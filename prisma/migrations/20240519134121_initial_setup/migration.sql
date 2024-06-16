-- CreateEnum
CREATE TYPE "ROLES" AS ENUM ('EMPLOYER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerified" TEXT NOT NULL,
    "role" "ROLES" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
