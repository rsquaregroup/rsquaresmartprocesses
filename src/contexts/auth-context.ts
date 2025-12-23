import { createContext } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";

export type UserRole = "admin" | "backoffice" | "requester";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  team_key?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
