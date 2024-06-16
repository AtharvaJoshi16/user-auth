import dotenv from "dotenv";
import express from "express";
import { logger } from "./logger";
import { router } from "./routes";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();
app.use(process.env.BASE_URL ?? "", router);
app.listen(process.env.PORT, () => {
  logger.info(`Server running on port ${process.env.PORT}`);
});
