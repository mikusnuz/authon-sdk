"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_KEY_PREFIXES: () => API_KEY_PREFIXES,
  AUDIT_EVENTS: () => AUDIT_EVENTS,
  DEFAULT_BRANDING: () => DEFAULT_BRANDING,
  DEFAULT_SESSION_CONFIG: () => DEFAULT_SESSION_CONFIG,
  OAUTH_PROVIDERS: () => OAUTH_PROVIDERS,
  PROVIDER_COLORS: () => PROVIDER_COLORS,
  PROVIDER_DISPLAY_NAMES: () => PROVIDER_DISPLAY_NAMES,
  WEBHOOK_EVENTS: () => WEBHOOK_EVENTS
});
module.exports = __toCommonJS(index_exports);
var OAUTH_PROVIDERS = [
  "google",
  "apple",
  "kakao",
  "naver",
  "facebook",
  "github",
  "discord",
  "x",
  "line",
  "microsoft"
];
var PROVIDER_DISPLAY_NAMES = {
  google: "Google",
  apple: "Apple",
  kakao: "Kakao",
  naver: "Naver",
  facebook: "Facebook",
  github: "GitHub",
  discord: "Discord",
  x: "X",
  line: "LINE",
  microsoft: "Microsoft"
};
var PROVIDER_COLORS = {
  google: { bg: "#ffffff", text: "#1f1f1f" },
  apple: { bg: "#000000", text: "#ffffff" },
  kakao: { bg: "#FEE500", text: "#191919" },
  naver: { bg: "#03C75A", text: "#ffffff" },
  facebook: { bg: "#1877F2", text: "#ffffff" },
  github: { bg: "#24292e", text: "#ffffff" },
  discord: { bg: "#5865F2", text: "#ffffff" },
  x: { bg: "#000000", text: "#ffffff" },
  line: { bg: "#06C755", text: "#ffffff" },
  microsoft: { bg: "#ffffff", text: "#1f1f1f" }
};
var WEBHOOK_EVENTS = [
  "user.created",
  "user.updated",
  "user.deleted",
  "user.banned",
  "user.unbanned",
  "session.created",
  "session.ended",
  "session.revoked",
  "provider.linked",
  "provider.unlinked"
];
var API_KEY_PREFIXES = {
  PUBLISHABLE_LIVE: "pk_live_",
  PUBLISHABLE_TEST: "pk_test_",
  SECRET_LIVE: "sk_live_",
  SECRET_TEST: "sk_test_"
};
var DEFAULT_BRANDING = {
  primaryColorStart: "#7c3aed",
  primaryColorEnd: "#4f46e5",
  lightBg: "#ffffff",
  lightText: "#111827",
  darkBg: "#0f172a",
  darkText: "#f1f5f9",
  borderRadius: 12,
  showEmailPassword: true,
  showDivider: true,
  showSecuredBy: true,
  locale: "en"
};
var DEFAULT_SESSION_CONFIG = {
  accessTokenTtl: 900,
  refreshTokenTtl: 604800,
  maxSessions: 5,
  singleSession: false
};
var AUDIT_EVENTS = {
  AUTH_SIGNUP: "auth.signup",
  AUTH_SIGNIN: "auth.signin",
  AUTH_SIGNIN_FAILED: "auth.signin.failed",
  AUTH_SIGNOUT: "auth.signout",
  AUTH_TOKEN_REFRESH: "auth.token.refresh",
  AUTH_MFA_SETUP: "auth.mfa.setup",
  AUTH_MFA_VERIFY: "auth.mfa.verify",
  AUTH_PASSKEY_REGISTER: "auth.passkey.register",
  AUTH_WEB3_VERIFY: "auth.web3.verify",
  ADMIN_USER_BANNED: "admin.user.banned",
  ADMIN_USER_UNBANNED: "admin.user.unbanned",
  ADMIN_USER_DELETED: "admin.user.deleted",
  ORG_CREATED: "org.created",
  ORG_DELETED: "org.deleted",
  ORG_MEMBER_ADDED: "org.member.added",
  ORG_MEMBER_REMOVED: "org.member.removed",
  ORG_MEMBER_ROLE_CHANGED: "org.member.role_changed",
  ORG_INVITATION_SENT: "org.invitation.sent",
  ORG_INVITATION_ACCEPTED: "org.invitation.accepted"
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_KEY_PREFIXES,
  AUDIT_EVENTS,
  DEFAULT_BRANDING,
  DEFAULT_SESSION_CONFIG,
  OAUTH_PROVIDERS,
  PROVIDER_COLORS,
  PROVIDER_DISPLAY_NAMES,
  WEBHOOK_EVENTS
});
//# sourceMappingURL=index.cjs.map