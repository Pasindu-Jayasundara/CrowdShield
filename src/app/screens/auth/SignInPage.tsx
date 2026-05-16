import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { AuthRedirect } from "../../../components/AuthRedirect";
import { HOME_PATH } from "../../../lib/auth-routes";
import { motion } from "motion/react";

export default function SignInPage() {
  return (
    <AuthRedirect mode="requireGuest">
      <SignInForm />
    </AuthRedirect>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = (provider: string) => {
    setLoading(true);
    setError(null);
    void signIn(provider, { redirectTo: HOME_PATH }).catch((err: Error) => {
      setError(err.message);
      setLoading(false);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(45,125,210,0.08)_0%,rgba(248,249,250,0)_100%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-on-primary shadow-2xl shadow-primary/20 transition-transform hover:scale-105">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="mt-8 text-4xl font-black tracking-tight text-text">
            CrowdShield
          </h1>
          <p className="mt-3 text-lg text-text-muted">
            The next generation of crowd-sourced security.
          </p>
        </div>

        <div className="glass rounded-[32px] p-10 shadow-2xl bg-surface/50 backdrop-blur-xl border border-border/50">
          <h2 className="text-2xl font-bold text-text mb-8 text-center">Sign In</h2>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSignIn("google")}
            className="group flex h-14 w-full items-center justify-center gap-4 rounded-2xl bg-surface border border-border px-6 text-base font-bold text-text shadow-sm transition-all hover:bg-gray-50 hover:border-border-hover disabled:opacity-60 active:scale-[0.98]"
          >
            <GoogleIcon />
            {loading ? "Connecting..." : "Continue with Google"}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-red-700"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium">{error}</p>
            </motion.div>
          )}

          <div className="mt-10 pt-10 border-t border-border/30">
            <p className="text-center text-xs font-medium text-text-muted uppercase tracking-widest">
              Securely powered by Convex Auth
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-text-muted">
            By signing in, you agree to our <span className="underline cursor-pointer hover:text-text transition-colors">Terms</span> and <span className="underline cursor-pointer hover:text-text transition-colors">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden className="group-hover:scale-110 transition-transform">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
