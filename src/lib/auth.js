import crypto from "node:crypto";
import { ApiError } from "@/lib/api";
import { mutateDb, readDb } from "@/lib/db";
import { Roles } from "@/lib/permissions";

function stripPassword(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export async function login(email, password) {
  const db = await readDb();
  const user = db.users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());

  if (!user || !user.active || user.password !== password) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Credenciais inválidas.");
  }

  const token = crypto.randomUUID();
  const session = {
    token,
    userId: user.id,
    branchContextId: user.role === Roles.BRANCH_MANAGER || user.role === Roles.DELIVERY ? user.branchId : null,
    createdAt: new Date().toISOString()
  };

  await mutateDb((state) => {
    state.sessions.push(session);
  });

  return {
    token,
    user: stripPassword(user),
    branchContextId: session.branchContextId
  };
}

export async function logout(token) {
  await mutateDb((state) => {
    state.sessions = state.sessions.filter((session) => session.token !== token);
  });
}

export function extractToken(request) {
  const authorization = request.headers.get("authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new ApiError(401, "UNAUTHORIZED", "Token Bearer obrigatório.");
  }

  return token;
}

export async function getAuthContext(request) {
  const token = extractToken(request);
  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);

  if (!session) {
    throw new ApiError(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
  }

  const user = db.users.find((entry) => entry.id === session.userId);

  if (!user || !user.active) {
    throw new ApiError(401, "UNAUTHORIZED", "Usuário inválido.");
  }

  return {
    token,
    session,
    user: stripPassword(user),
    db
  };
}

export async function switchBranchContext(token, branchId) {
  return mutateDb((state) => {
    const session = state.sessions.find((entry) => entry.token === token);

    if (!session) {
      throw new ApiError(401, "UNAUTHORIZED", "Sessão inválida ou expirada.");
    }

    session.branchContextId = branchId;
    return session;
  });
}
