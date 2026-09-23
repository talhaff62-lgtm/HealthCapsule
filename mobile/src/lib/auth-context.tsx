import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, authFetch } from "@/api/config";
import { getToken, setToken, clearToken } from "@/lib/token-store";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthContextType = {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function initAuth() {
      try {
        const storedToken = await getToken();
        if (!storedToken) {
          if (active) {
            setTokenState(null);
            setUser(null);
            setStatus("signedOut");
          }
          return;
        }
        const me = await authFetch<{ id: string; name: string; email?: string; role: string }>(
          "/api/v1/auth/me",
          { token: storedToken },
        );
        if (active) {
          const authUser: AuthUser = {
            id: me.id,
            name: me.name,
            email: me.email ?? "",
            role: me.role,
          };
          setTokenState(storedToken);
          setUser(authUser);
          setStatus("signedIn");
        }
      } catch {
        await clearToken();
        if (active) {
          setTokenState(null);
          setUser(null);
          setStatus("signedOut");
        }
      }
    }
    initAuth();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const res = await apiFetch<{
      token: string;
      user: { id: string; name: string; email: string; role: string };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    setStatus("signedIn");
    return res.user;
  }, []);

  const signOut = useCallback(async () => {
    await clearToken();
    setTokenState(null);
    setUser(null);
    setStatus("signedOut");
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
