// app/lib/auth.ts

export type MyLaneUser = {
  name: string;
  email: string;
  phone?: string;
};

const STORAGE_KEY = "mylane_user";

export function saveUser(user: MyLaneUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getUser(): MyLaneUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MyLaneUser;
  } catch {
    return null;
  }
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
