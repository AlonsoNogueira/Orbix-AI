import prisma from "../../utils/prisma";

export async function findUserByEmail(email: string, includePassword: boolean) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    omit: {
      password: !includePassword,
    },
  });
}

export async function findUserById(userId: string, includePassword: boolean) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    omit: {
      password: !includePassword,
    },
  });
}

export async function findAll(includePassword: boolean) {
  return prisma.user.findMany({
    omit: { password: !includePassword },
  });
}