import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { SIGN_IN_PATH, HOME_PATH } from "./lib/auth-routes";

const isSignInPage = createRouteMatcher([SIGN_IN_PATH]);
const isPublicPage = createRouteMatcher([SIGN_IN_PATH]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const authenticated = await convexAuth.isAuthenticated();

    if (isSignInPage(request) && authenticated) {
      return nextjsMiddlewareRedirect(request, HOME_PATH);
    }

    if (!isPublicPage(request) && !authenticated) {
      return nextjsMiddlewareRedirect(request, SIGN_IN_PATH);
    }
  },
  {
    cookieConfig: { maxAge: 60 * 60 * 24 * 30 },
  },
);

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
