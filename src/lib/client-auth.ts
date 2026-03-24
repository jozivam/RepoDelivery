const TOKEN_KEY = "rd_token";
const USER_KEY = "rd_user";
const BRANCH_KEY = "rd_branch_ctx";

export type UserRole =
  | "DEV"
  | "COMPANY_ADMIN"
  | "BRANCH_MANAGER"
  | "DELIVERY";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  branchId: string | null;
  active: boolean;
}

export interface Session {
  token: string;
  user: AuthUser;
  branchContextId: string | null;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);
  const branchContextId = localStorage.getItem(BRANCH_KEY);
  if (!token || !userRaw) return null;
  try {
    const user: AuthUser = JSON.parse(userRaw);
    return { token, user, branchContextId };
  } catch {
    return null;
  }
}

export function saveSession(data: Session) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  if (data.branchContextId) {
    localStorage.setItem(BRANCH_KEY, data.branchContextId);
  } else {
    localStorage.removeItem(BRANCH_KEY);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(BRANCH_KEY);
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`/api/v1${path}`, { ...options, headers });
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message ?? "Erro desconhecido");
  }
  return json.data;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<Session> {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data as Session;
}

export async function apiLogout(token: string) {
  await apiFetch("/auth/logout", { method: "POST" }, token);
}

export function authFetch(
  path: string,
  options: RequestInit = {},
  token?: string | null
) {
  const t = token ?? getSession()?.token;
  return apiFetch(path, options, t);
}
