import { PrismaClient } from "@prisma/client";

export const findUser = async (client: PrismaClient, email: string) => {
  const user = await client.user.findMany({
    where: {
      email: email,
    },
  });
  return user?.[0];
};
