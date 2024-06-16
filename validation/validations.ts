import zod from "zod";
import { ROLES } from "../constants/roles";

export const UserSchema = zod.object({
  email: zod.string().email(),
  role: zod.string().superRefine((role, ctx) => {
    if (!Object.values(ROLES).includes(role as ROLES)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid user Role",
      });
    }
  }),
  password: zod
    .string()
    .min(15, { message: "Password length must be atleast 15 characters" })
    .max(100, { message: "Password length must be atmost 100 characters" })
    .superRefine((password, ctx) => {
      const specialChars = /[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/;
      const digits = /[0-9]/;
      const uppercases = /[A-Z]/;
      if (!specialChars.test(password)) {
        ctx.addIssue({
          code: "custom",
          message: "Password does not contain a special character",
        });
      }
      if (!digits.test(password)) {
        ctx.addIssue({
          code: "custom",
          message: "Password does not contain a digit",
        });
      }
      if (!uppercases.test(password)) {
        ctx.addIssue({
          code: "custom",
          message: "Password does not contain an uppercase character",
        });
      }
    }),
});
