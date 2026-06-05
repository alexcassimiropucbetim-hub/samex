import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = "super-secret-key-mudar-em-producao"; // Em prod, usar process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id: string;
  type: "admin" | "encarregado";
  name: string;
  roleName?: string; // Para encarregados (Local, Regional, etc)
  churchId?: string; // Para encarregados
  expires: Date;
};

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10h") // Sessão dura 10 horas
    .sign(key);
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "expires">) {
  const expires = new Date(Date.now() + 10 * 60 * 60 * 1000); // 10 horas
  const sessionData = { ...payload, expires };
  const session = await encrypt(sessionData);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0), // Expira imediatamente
    sameSite: "lax",
    path: "/",
  });
}
