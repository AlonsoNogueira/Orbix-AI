import { generateToken } from "../../utils/jwt";
import { findUserByEmail } from "../user/user-service";
import { compare, hash } from "bcrypt";
import { AuthenticationError } from "../../utils/errors";
import prisma from "../../utils/prisma";

export async function login(email: string, password: string) {
  try {
    const user = await findUserByEmail(email, true);

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    const token = generateToken(user.id);

    return { token };
  } catch (error) {
    throw new AuthenticationError("Error during login");
  }
}

export async function register(email: string, password: string, name: string) {
  try {
    const user = await findUserByEmail(email, false);

    if (user) {
      throw new AuthenticationError("User already exists");
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,  
        name,
      },
    });

    const token = generateToken(newUser.id);

    return { token };
  } catch (error) {
    throw new AuthenticationError("Error during registration");
  }
}
