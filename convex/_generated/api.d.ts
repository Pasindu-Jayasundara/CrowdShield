/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as announcements from "../announcements.js";
import type * as auth from "../auth.js";
import type * as campaigns from "../campaigns.js";
import type * as geo from "../geo.js";
import type * as lib_analysis from "../lib/analysis.js";
import type * as lib_password from "../lib/password.js";
import type * as lib_regions from "../lib/regions.js";
import type * as lib_session from "../lib/session.js";
import type * as lib_threatScore from "../lib/threatScore.js";
import type * as lib_validators from "../lib/validators.js";
import type * as newsletter from "../newsletter.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";
import type * as supportMessages from "../supportMessages.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  analytics: typeof analytics;
  announcements: typeof announcements;
  auth: typeof auth;
  campaigns: typeof campaigns;
  geo: typeof geo;
  "lib/analysis": typeof lib_analysis;
  "lib/password": typeof lib_password;
  "lib/regions": typeof lib_regions;
  "lib/session": typeof lib_session;
  "lib/threatScore": typeof lib_threatScore;
  "lib/validators": typeof lib_validators;
  newsletter: typeof newsletter;
  reports: typeof reports;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
  supportMessages: typeof supportMessages;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
