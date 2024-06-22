import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { RESPONSES } from "../constants/responseMessages";
import { ROLES } from "../constants/roles";
import { USER_ROUTES } from "../constants/routes";
import { STATUS_CODES } from "../constants/status_codes";
import { findUser } from "../utils/findUser";
import { sendMail } from "../utils/sendMail";
const client = new PrismaClient();
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, role = ROLES.EMPLOYEE as ROLES } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_VALUE!)
    );
    const userFound = await findUser(client, email);
    if (!userFound) {
      const user = await client.user.create({
        data: {
          email: email,
          password: hashedPassword,
          role: role as ROLES,
          isVerified: false,
        },
      });
      res.status(STATUS_CODES.CREATE_SUCCESS).json({
        code: STATUS_CODES.CREATE_SUCCESS,
        message: RESPONSES.USER_CREATED.replace("<userid>", user.id).replace(
          "<email>",
          user.email
        ),
      });
    } else if (!userFound?.isVerified) {
      const emailToken = jwt.sign(
        {
          email,
          hashedPassword,
          role,
        },
        process.env.JWT_KEY!,
        { expiresIn: process.env.JWT_EXPIRY_TIME! }
      );
      await sendMail({
        from: process.env.SERVICE_EMAIL as string,
        to: email,
        subject: `VERIFICATION LINK FOR ${email}`,
        text: `Verify link: ${process.env.HOST}${process.env.BASE_URL}${USER_ROUTES.VERIFY_EMAIL}?token=${emailToken}`,
      });
      res.status(STATUS_CODES.ALREADY_EXISTS).json({
        code: STATUS_CODES.ALREADY_EXISTS,
        message: RESPONSES.USER_NOT_VERIFIED.replace("<email>", email),
      });
    } else if (userFound?.isVerified) {
      res.status(STATUS_CODES.ALREADY_EXISTS).json({
        code: STATUS_CODES.ALREADY_EXISTS,
        message: RESPONSES.USER_EXISTS.replace("<email>", email),
      });
    }
  } catch (e) {
    res.status(STATUS_CODES.BAD_REQUEST).json({
      code: STATUS_CODES.BAD_REQUEST,
      error: e,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const payload = req.query.token;
  payload &&
    jwt.verify(
      payload as string,
      process.env.JWT_KEY!,
      async (err, decodedData) => {
        if (err) {
          res.json({
            code: STATUS_CODES.VALIDATION_ERR,
            message: RESPONSES.INVALID_PAYLOAD,
          });
        } else {
          const user = await findUser(client, (decodedData as any)?.email);
          await client.user.update({
            where: {
              id: user?.id,
              email: user?.email,
            },
            data: {
              isVerified: true,
            },
          });
          res.json({
            decodedData,
            code: STATUS_CODES.CREATE_SUCCESS,
            message: RESPONSES.EMAIL_VERIFIED,
          });
        }
      }
    );
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password: rawPassword } = req.body;

  const user = await findUser(client, email);
  if (user) {
    if (await bcrypt.compare(rawPassword, user?.password)) {
      const token = jwt.sign(user, process.env.JWT_KEY!, {
        expiresIn: process.env.JWT_EXPIRY_TIME!,
      });
      res.status(STATUS_CODES.CREATE_SUCCESS).json({
        code: STATUS_CODES.SUCCESS,
        token,
      });
    } else {
      res.status(STATUS_CODES.FORBIDDEN).json({
        code: STATUS_CODES.FORBIDDEN,
        message: RESPONSES.INVALID_PASSWORD,
      });
    }
  } else {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      code: STATUS_CODES.UNAUTHORIZED,
      message: RESPONSES.NON_EXISTING_USER.replace("<email>", email),
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const { password } = req.body;
  if (!token) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({
      message: RESPONSES.UNAUTHORIZED,
      code: STATUS_CODES.UNAUTHORIZED,
    });
  } else {
    jwt.verify(token, process.env.JWT_KEY!, async (err, decodedData) => {
      if (err) {
        console.log(err);
        res.status(STATUS_CODES.VALIDATION_ERR).json({
          message: RESPONSES.INVALID_PAYLOAD,
          code: STATUS_CODES.VALIDATION_ERR,
        });
      } else {
        const user = await findUser(client, (decodedData as any)?.email);
        if (user) {
          await client.user.update({
            where: {
              id: user.id,
              email: user?.email,
            },
            data: {
              password: await bcrypt.hash(
                password,
                parseInt(process.env.SALT_VALUE!)
              ),
            },
          });

          res.status(STATUS_CODES.CREATE_SUCCESS).json({
            code: STATUS_CODES.CREATE_SUCCESS,
            message: RESPONSES.PASSWORD_RESET.replace("<email>", user?.email),
          });
        } else {
          res.status(STATUS_CODES.VALIDATION_ERR).json({
            message: RESPONSES.INVALID_PAYLOAD,
            code: STATUS_CODES.VALIDATION_ERR,
          });
        }
      }
    });
  }
};
