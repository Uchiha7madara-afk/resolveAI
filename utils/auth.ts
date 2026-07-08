// Temporary fake auth using localStorage
// TODO: Replace with real Supabase auth in next session

const AUTH_KEY = "resolveai_auth_user";

export interface FakeUser {
  email: string;
  name: string;
  signedInAt: number;
}

export function setAuthenticated(email: string): void {
  if (typeof window === "undefined") return;
  const user: FakeUser = {
    email,
    name: email.split("@")[0] || "Operator",
    signedInAt: Date.now(),
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getCurrentUser(): FakeUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FakeUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) !== null;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}
