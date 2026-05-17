import { useConvexAuth } from "convex/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { HOME_PATH, SIGN_IN_PATH } from "../lib/auth-routes";

type AuthRedirectProps = {
  mode: "requireAuth" | "requireGuest";
  children: React.ReactNode;
};

export function AuthRedirect({ mode, children }: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (mode === "requireAuth" && !isAuthenticated) {
      navigate(SIGN_IN_PATH, { replace: true });
      return;
    }

    if (mode === "requireGuest" && isAuthenticated) {
      navigate(HOME_PATH, { replace: true });
    }
  }, [isAuthenticated, isLoading, mode, navigate]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-primary" />
      </main>
    );
  }

  if (mode === "requireAuth" && !isAuthenticated) {
    return null;
  }

  if (mode === "requireGuest" && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}