import { generateToken } from "../../utils/jwt";
import { findUserByEmail } from "../user/user-service";
import { compare, hash } from "bcrypt";
import { AuthenticationError, ConflictError } from "../../utils/errors";
import prisma from "../../utils/prisma";

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email, true);

  if (!user) {
    throw new AuthenticationError("Credenciais inválidas");
  }

  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError("Credenciais inválidas");
  }

  const token = generateToken(user.id);
  return { token };
}

export async function register(
  email: string,
  password: string,
  name: string,
  cellphone: string,
) {
  const existing = await findUserByEmail(email, false);
  if (existing) {
    throw new ConflictError("E-mail já cadastrado");
  }

  const hashedPassword = await hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      cellphone,
    },
  });

  const token = generateToken(newUser.id);
  return { token };
}