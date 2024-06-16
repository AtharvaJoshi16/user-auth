import express from "express";
import { USER_ROUTES } from "./constants/routes";
import { loginUser, registerUser, verifyEmail } from "./controllers";
import { validateDataMW } from "./middlewares/validateData";

const router = express.Router();

router.put(`/${USER_ROUTES.VERIFY_EMAIL}`, verifyEmail);
router.post(USER_ROUTES.REGISTER_USER, validateDataMW, registerUser);
router.get(USER_ROUTES.LOGIN_USER, loginUser);

export { router };
