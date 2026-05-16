import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback, useState } from "react";
import { SIGN_IN_PATH } from "../lib/auth-routes";

export function useSignOut() {
  const { signOut } = useAuthActions();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      window.location.assign(SIGN_IN_PATH);
    } catch {
      setIsSigningOut(false);
    }
  }, [signOut]);

  return { signOut: handleSignOut, isSigningOut };
}
