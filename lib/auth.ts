import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

export {
  AUTH_COOKIE_NAME,
  type SessionPayload,
  createSessionToken,
  verifySessionToken,
} from "./session";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./session";

export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export async function getCurrentUserFromCookie() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        isActive: true,
        degree: true,
        gradYear: true,
        track: true,
        statusQuote: true,
        bio: true,
        dorm: true,
        skills: true,
        github: true,
        linkedin: true,
        connected: true,
        online: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error reading session:", error);
    return null;
  }
}
