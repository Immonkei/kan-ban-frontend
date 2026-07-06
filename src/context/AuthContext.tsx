import { createContext } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;

  signIn(
    email: string,
    password: string
  ): Promise<void>;

  signUp(
    name: string,
    email: string,
    password: string
  ): Promise<void>;

  logout(): void;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);