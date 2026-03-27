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
  Authon: () => Authon,
  AuthonMfaRequiredError: () => AuthonMfaRequiredError,
  generateQrSvg: () => generateQrSvg,
  getProviderButtonConfig: () => getProviderButtonConfig,
  getStrings: () => getStrings,
  translations: () => translations
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var AuthonMfaRequiredError = class extends Error {
  mfaToken;
  constructor(mfaToken) {
    super("MFA verification required");
    this.name = "AuthonMfaRequiredError";
    this.mfaToken = mfaToken;
  }
};

// ../../node_modules/.pnpm/@authon+shared@0.3.0/node_modules/@authon/shared/dist/index.js
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

// src/providers.ts
var PROVIDER_ICONS = {
  google: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  apple: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>`,
  kakao: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#191919" d="M12 3C6.48 3 2 6.36 2 10.43c0 2.62 1.75 4.93 4.37 6.23l-1.12 4.14c-.1.36.31.65.62.44l4.93-3.26c.39.04.79.06 1.2.06 5.52 0 10-3.36 10-7.61C22 6.36 17.52 3 12 3z"/></svg>`,
  naver: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="#fff" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z"/></svg>`,
  github: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>`,
  discord: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M20.32 4.37a19.8 19.8 0 00-4.89-1.52.07.07 0 00-.08.04c-.21.38-.44.87-.61 1.26a18.27 18.27 0 00-5.49 0 12.64 12.64 0 00-.62-1.26.07.07 0 00-.08-.04 19.74 19.74 0 00-4.89 1.52.07.07 0 00-.03.03C1.11 8.39.34 12.28.73 16.12a.08.08 0 00.03.06 19.9 19.9 0 005.99 3.03.08.08 0 00.08-.03c.46-.63.87-1.3 1.22-2a.08.08 0 00-.04-.11 13.1 13.1 0 01-1.87-.9.08.08 0 01-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 01.08-.01c3.93 1.8 8.18 1.8 12.07 0a.07.07 0 01.08 0c.12.1.25.2.37.3a.08.08 0 01-.01.12c-.6.35-1.22.65-1.87.9a.08.08 0 00-.04.1c.36.7.77 1.37 1.22 2a.08.08 0 00.08.03 19.83 19.83 0 006-3.03.08.08 0 00.03-.05c.47-4.87-.78-9.09-3.3-12.84a.06.06 0 00-.03-.03zM8.02 13.62c-1.11 0-2.03-1.02-2.03-2.28 0-1.26.9-2.28 2.03-2.28 1.14 0 2.04 1.03 2.03 2.28 0 1.26-.9 2.28-2.03 2.28zm7.5 0c-1.11 0-2.03-1.02-2.03-2.28 0-1.26.9-2.28 2.03-2.28 1.14 0 2.04 1.03 2.03 2.28 0 1.26-.89 2.28-2.03 2.28z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  line: `<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>`,
  microsoft: `<svg viewBox="0 0 24 24" width="20" height="20"><rect fill="#F25022" x="1" y="1" width="10" height="10"/><rect fill="#7FBA00" x="13" y="1" width="10" height="10"/><rect fill="#00A4EF" x="1" y="13" width="10" height="10"/><rect fill="#FFB900" x="13" y="13" width="10" height="10"/></svg>`
};
function getProviderButtonConfig(provider) {
  const colors = PROVIDER_COLORS[provider];
  return {
    provider,
    label: `Continue with ${PROVIDER_DISPLAY_NAMES[provider]}`,
    bgColor: colors.bg,
    textColor: colors.text,
    iconSvg: PROVIDER_ICONS[provider]
  };
}

// src/i18n.ts
var translations = {
  en: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    signIn: "Sign in",
    signUp: "Sign up",
    or: "or",
    emailAddress: "Email address",
    password: "Password",
    passwordHint: "Must contain uppercase, lowercase, and a number (min 8 chars)",
    continueWith: "Continue with",
    connectWallet: "Connect Wallet",
    magicLink: "Continue with Magic Link",
    passkey: "Sign in with Passkey",
    securedBy: "Secured by",
    backToSignIn: "Back to sign in"
  },
  ko: {
    welcomeBack: "\uB2E4\uC2DC \uC624\uC2E0 \uAC78 \uD658\uC601\uD569\uB2C8\uB2E4",
    createAccount: "\uACC4\uC815 \uB9CC\uB4E4\uAE30",
    alreadyHaveAccount: "\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?",
    dontHaveAccount: "\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694?",
    signIn: "\uB85C\uADF8\uC778",
    signUp: "\uD68C\uC6D0\uAC00\uC785",
    or: "\uB610\uB294",
    emailAddress: "\uC774\uBA54\uC77C \uC8FC\uC18C",
    password: "\uBE44\uBC00\uBC88\uD638",
    passwordHint: "\uB300\uBB38\uC790, \uC18C\uBB38\uC790, \uC22B\uC790 \uD3EC\uD568 (\uCD5C\uC18C 8\uC790)",
    continueWith: "(\uC73C)\uB85C \uACC4\uC18D\uD558\uAE30",
    connectWallet: "\uC9C0\uAC11 \uC5F0\uACB0",
    magicLink: "\uB9E4\uC9C1 \uB9C1\uD06C\uB85C \uACC4\uC18D\uD558\uAE30",
    passkey: "\uD328\uC2A4\uD0A4\uB85C \uB85C\uADF8\uC778",
    securedBy: "\uBCF4\uC548 \uC81C\uACF5",
    backToSignIn: "\uB85C\uADF8\uC778\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30"
  },
  ja: {
    welcomeBack: "\u304A\u304B\u3048\u308A\u306A\u3055\u3044",
    createAccount: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u4F5C\u6210",
    alreadyHaveAccount: "\u3059\u3067\u306B\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u3059\u304B\uFF1F",
    dontHaveAccount: "\u30A2\u30AB\u30A6\u30F3\u30C8\u3092\u304A\u6301\u3061\u3067\u306A\u3044\u3067\u3059\u304B\uFF1F",
    signIn: "\u30ED\u30B0\u30A4\u30F3",
    signUp: "\u65B0\u898F\u767B\u9332",
    or: "\u307E\u305F\u306F",
    emailAddress: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
    password: "\u30D1\u30B9\u30EF\u30FC\u30C9",
    passwordHint: "\u5927\u6587\u5B57\u3001\u5C0F\u6587\u5B57\u3001\u6570\u5B57\u3092\u542B\u3080\uFF088\u6587\u5B57\u4EE5\u4E0A\uFF09",
    continueWith: "\u3067\u7D9A\u884C",
    connectWallet: "\u30A6\u30A9\u30EC\u30C3\u30C8\u63A5\u7D9A",
    magicLink: "\u30DE\u30B8\u30C3\u30AF\u30EA\u30F3\u30AF\u3067\u7D9A\u884C",
    passkey: "\u30D1\u30B9\u30AD\u30FC\u3067\u30ED\u30B0\u30A4\u30F3",
    securedBy: "\u30BB\u30AD\u30E5\u30EA\u30C6\u30A3\u63D0\u4F9B",
    backToSignIn: "\u30ED\u30B0\u30A4\u30F3\u306B\u623B\u308B"
  },
  "zh-CN": {
    welcomeBack: "\u6B22\u8FCE\u56DE\u6765",
    createAccount: "\u521B\u5EFA\u8D26\u6237",
    alreadyHaveAccount: "\u5DF2\u6709\u8D26\u6237\uFF1F",
    dontHaveAccount: "\u6CA1\u6709\u8D26\u6237\uFF1F",
    signIn: "\u767B\u5F55",
    signUp: "\u6CE8\u518C",
    or: "\u6216",
    emailAddress: "\u90AE\u7BB1\u5730\u5740",
    password: "\u5BC6\u7801",
    passwordHint: "\u9700\u5305\u542B\u5927\u5199\u3001\u5C0F\u5199\u5B57\u6BCD\u548C\u6570\u5B57\uFF08\u81F3\u5C118\u4F4D\uFF09",
    continueWith: "\u7EE7\u7EED\u4F7F\u7528",
    connectWallet: "\u8FDE\u63A5\u94B1\u5305",
    magicLink: "\u4F7F\u7528\u9B54\u6CD5\u94FE\u63A5\u7EE7\u7EED",
    passkey: "\u4F7F\u7528\u901A\u884C\u5BC6\u94A5\u767B\u5F55",
    securedBy: "\u5B89\u5168\u4FDD\u969C",
    backToSignIn: "\u8FD4\u56DE\u767B\u5F55"
  },
  "zh-TW": {
    welcomeBack: "\u6B61\u8FCE\u56DE\u4F86",
    createAccount: "\u5EFA\u7ACB\u5E33\u6236",
    alreadyHaveAccount: "\u5DF2\u6709\u5E33\u6236\uFF1F",
    dontHaveAccount: "\u6C92\u6709\u5E33\u6236\uFF1F",
    signIn: "\u767B\u5165",
    signUp: "\u8A3B\u518A",
    or: "\u6216",
    emailAddress: "\u96FB\u5B50\u90F5\u4EF6",
    password: "\u5BC6\u78BC",
    passwordHint: "\u9700\u5305\u542B\u5927\u5BEB\u3001\u5C0F\u5BEB\u5B57\u6BCD\u548C\u6578\u5B57\uFF08\u81F3\u5C118\u4F4D\uFF09",
    continueWith: "\u7E7C\u7E8C\u4F7F\u7528",
    connectWallet: "\u9023\u63A5\u9322\u5305",
    magicLink: "\u4F7F\u7528\u9B54\u6CD5\u9023\u7D50\u7E7C\u7E8C",
    passkey: "\u4F7F\u7528\u901A\u884C\u91D1\u9470\u767B\u5165",
    securedBy: "\u5B89\u5168\u4FDD\u969C",
    backToSignIn: "\u8FD4\u56DE\u767B\u5165"
  },
  "pt-BR": {
    welcomeBack: "Bem-vindo de volta",
    createAccount: "Crie sua conta",
    alreadyHaveAccount: "Ja tem uma conta?",
    dontHaveAccount: "Nao tem uma conta?",
    signIn: "Entrar",
    signUp: "Cadastrar",
    or: "ou",
    emailAddress: "Endereco de e-mail",
    password: "Senha",
    passwordHint: "Deve conter maiusculas, minusculas e numeros (min 8 caracteres)",
    continueWith: "Continuar com",
    connectWallet: "Conectar carteira",
    magicLink: "Continuar com Magic Link",
    passkey: "Entrar com Passkey",
    securedBy: "Protegido por",
    backToSignIn: "Voltar ao login"
  },
  es: {
    welcomeBack: "Bienvenido de nuevo",
    createAccount: "Crea tu cuenta",
    alreadyHaveAccount: "Ya tienes una cuenta?",
    dontHaveAccount: "No tienes una cuenta?",
    signIn: "Iniciar sesion",
    signUp: "Registrarse",
    or: "o",
    emailAddress: "Correo electronico",
    password: "Contrasena",
    passwordHint: "Debe contener mayusculas, minusculas y numeros (min 8 caracteres)",
    continueWith: "Continuar con",
    connectWallet: "Conectar billetera",
    magicLink: "Continuar con Magic Link",
    passkey: "Iniciar con Passkey",
    securedBy: "Protegido por",
    backToSignIn: "Volver al inicio de sesion"
  },
  de: {
    welcomeBack: "Willkommen zuruck",
    createAccount: "Konto erstellen",
    alreadyHaveAccount: "Bereits ein Konto?",
    dontHaveAccount: "Noch kein Konto?",
    signIn: "Anmelden",
    signUp: "Registrieren",
    or: "oder",
    emailAddress: "E-Mail-Adresse",
    password: "Passwort",
    passwordHint: "Gross-/Kleinbuchstaben und Zahl erforderlich (mind. 8 Zeichen)",
    continueWith: "Weiter mit",
    connectWallet: "Wallet verbinden",
    magicLink: "Weiter mit Magic Link",
    passkey: "Mit Passkey anmelden",
    securedBy: "Gesichert durch",
    backToSignIn: "Zuruck zur Anmeldung"
  },
  fr: {
    welcomeBack: "Bon retour",
    createAccount: "Creez votre compte",
    alreadyHaveAccount: "Vous avez deja un compte ?",
    dontHaveAccount: "Vous n'avez pas de compte ?",
    signIn: "Se connecter",
    signUp: "S'inscrire",
    or: "ou",
    emailAddress: "Adresse e-mail",
    password: "Mot de passe",
    passwordHint: "Doit contenir majuscules, minuscules et chiffres (min 8 caracteres)",
    continueWith: "Continuer avec",
    connectWallet: "Connecter le portefeuille",
    magicLink: "Continuer avec Magic Link",
    passkey: "Se connecter avec Passkey",
    securedBy: "Securise par",
    backToSignIn: "Retour a la connexion"
  },
  hi: {
    welcomeBack: "\u0935\u093E\u092A\u0938\u0940 \u092A\u0930 \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948",
    createAccount: "\u0905\u092A\u0928\u093E \u0916\u093E\u0924\u093E \u092C\u0928\u093E\u090F\u0902",
    alreadyHaveAccount: "\u092A\u0939\u0932\u0947 \u0938\u0947 \u0916\u093E\u0924\u093E \u0939\u0948?",
    dontHaveAccount: "\u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u0939\u0948?",
    signIn: "\u0938\u093E\u0907\u0928 \u0907\u0928",
    signUp: "\u0938\u093E\u0907\u0928 \u0905\u092A",
    or: "\u092F\u093E",
    emailAddress: "\u0908\u092E\u0947\u0932 \u092A\u0924\u093E",
    password: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921",
    passwordHint: "\u092C\u0921\u093C\u0947, \u091B\u094B\u091F\u0947 \u0905\u0915\u094D\u0937\u0930 \u0914\u0930 \u0938\u0902\u0916\u094D\u092F\u093E \u0906\u0935\u0936\u094D\u092F\u0915 (\u0915\u092E \u0938\u0947 \u0915\u092E 8 \u0905\u0915\u094D\u0937\u0930)",
    continueWith: "\u0938\u0947 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902",
    connectWallet: "\u0935\u0949\u0932\u0947\u091F \u0915\u0928\u0947\u0915\u094D\u091F \u0915\u0930\u0947\u0902",
    magicLink: "\u092E\u0948\u091C\u093F\u0915 \u0932\u093F\u0902\u0915 \u0938\u0947 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902",
    passkey: "\u092A\u093E\u0938\u0915\u0940 \u0938\u0947 \u0938\u093E\u0907\u0928 \u0907\u0928",
    securedBy: "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u092A\u094D\u0930\u0926\u093E\u0924\u093E",
    backToSignIn: "\u0938\u093E\u0907\u0928 \u0907\u0928 \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902"
  },
  tr: {
    welcomeBack: "Tekrar hos geldiniz",
    createAccount: "Hesap olusturun",
    alreadyHaveAccount: "Zaten bir hesabiniz var mi?",
    dontHaveAccount: "Hesabiniz yok mu?",
    signIn: "Giris yap",
    signUp: "Kaydol",
    or: "veya",
    emailAddress: "E-posta adresi",
    password: "Sifre",
    passwordHint: "Buyuk, kucuk harf ve rakam icermeli (en az 8 karakter)",
    continueWith: "ile devam et",
    connectWallet: "Cuzdan bagla",
    magicLink: "Magic Link ile devam et",
    passkey: "Passkey ile giris yap",
    securedBy: "Guvenlik saglayici",
    backToSignIn: "Girise don"
  },
  id: {
    welcomeBack: "Selamat datang kembali",
    createAccount: "Buat akun Anda",
    alreadyHaveAccount: "Sudah punya akun?",
    dontHaveAccount: "Belum punya akun?",
    signIn: "Masuk",
    signUp: "Daftar",
    or: "atau",
    emailAddress: "Alamat email",
    password: "Kata sandi",
    passwordHint: "Harus mengandung huruf besar, kecil, dan angka (min 8 karakter)",
    continueWith: "Lanjutkan dengan",
    connectWallet: "Hubungkan dompet",
    magicLink: "Lanjutkan dengan Magic Link",
    passkey: "Masuk dengan Passkey",
    securedBy: "Diamankan oleh",
    backToSignIn: "Kembali ke login"
  },
  vi: {
    welcomeBack: "Chao mung tro lai",
    createAccount: "Tao tai khoan",
    alreadyHaveAccount: "Da co tai khoan?",
    dontHaveAccount: "Chua co tai khoan?",
    signIn: "Dang nhap",
    signUp: "Dang ky",
    or: "hoac",
    emailAddress: "Dia chi email",
    password: "Mat khau",
    passwordHint: "Can chu hoa, chu thuong va so (toi thieu 8 ky tu)",
    continueWith: "Tiep tuc voi",
    connectWallet: "Ket noi vi",
    magicLink: "Tiep tuc voi Magic Link",
    passkey: "Dang nhap voi Passkey",
    securedBy: "Bao mat boi",
    backToSignIn: "Quay lai dang nhap"
  },
  th: {
    welcomeBack: "\u0E22\u0E34\u0E19\u0E14\u0E35\u0E15\u0E49\u0E2D\u0E19\u0E23\u0E31\u0E1A\u0E01\u0E25\u0E31\u0E1A",
    createAccount: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E1A\u0E31\u0E0D\u0E0A\u0E35",
    alreadyHaveAccount: "\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27?",
    dontHaveAccount: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E1A\u0E31\u0E0D\u0E0A\u0E35?",
    signIn: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",
    signUp: "\u0E2A\u0E21\u0E31\u0E04\u0E23\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01",
    or: "\u0E2B\u0E23\u0E37\u0E2D",
    emailAddress: "\u0E2D\u0E35\u0E40\u0E21\u0E25",
    password: "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19",
    passwordHint: "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E15\u0E31\u0E27\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E43\u0E2B\u0E0D\u0E48 \u0E15\u0E31\u0E27\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E25\u0E47\u0E01 \u0E41\u0E25\u0E30\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 (\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 8 \u0E15\u0E31\u0E27)",
    continueWith: "\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E15\u0E48\u0E2D\u0E14\u0E49\u0E27\u0E22",
    connectWallet: "\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E01\u0E23\u0E30\u0E40\u0E1B\u0E4B\u0E32",
    magicLink: "\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E15\u0E48\u0E2D\u0E14\u0E49\u0E27\u0E22 Magic Link",
    passkey: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E14\u0E49\u0E27\u0E22 Passkey",
    securedBy: "\u0E23\u0E31\u0E01\u0E29\u0E32\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E25\u0E2D\u0E14\u0E20\u0E31\u0E22\u0E42\u0E14\u0E22",
    backToSignIn: "\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"
  },
  ru: {
    welcomeBack: "\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C",
    createAccount: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442",
    alreadyHaveAccount: "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442?",
    dontHaveAccount: "\u041D\u0435\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430?",
    signIn: "\u0412\u043E\u0439\u0442\u0438",
    signUp: "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F",
    or: "\u0438\u043B\u0438",
    emailAddress: "\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0430\u044F \u043F\u043E\u0447\u0442\u0430",
    password: "\u041F\u0430\u0440\u043E\u043B\u044C",
    passwordHint: "\u0417\u0430\u0433\u043B\u0430\u0432\u043D\u044B\u0435, \u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435 \u0431\u0443\u043A\u0432\u044B \u0438 \u0446\u0438\u0444\u0440\u044B (\u043C\u0438\u043D. 8 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432)",
    continueWith: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441",
    connectWallet: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u043E\u0448\u0435\u043B\u0435\u043A",
    magicLink: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 Magic Link",
    passkey: "\u0412\u043E\u0439\u0442\u0438 \u0441 Passkey",
    securedBy: "\u0417\u0430\u0449\u0438\u0449\u0435\u043D\u043E",
    backToSignIn: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0432\u0445\u043E\u0434\u0443"
  },
  it: {
    welcomeBack: "Bentornato",
    createAccount: "Crea il tuo account",
    alreadyHaveAccount: "Hai gia un account?",
    dontHaveAccount: "Non hai un account?",
    signIn: "Accedi",
    signUp: "Registrati",
    or: "o",
    emailAddress: "Indirizzo email",
    password: "Password",
    passwordHint: "Deve contenere maiuscole, minuscole e numeri (min 8 caratteri)",
    continueWith: "Continua con",
    connectWallet: "Connetti portafoglio",
    magicLink: "Continua con Magic Link",
    passkey: "Accedi con Passkey",
    securedBy: "Protetto da",
    backToSignIn: "Torna all'accesso"
  },
  pl: {
    welcomeBack: "Witaj ponownie",
    createAccount: "Utworz konto",
    alreadyHaveAccount: "Masz juz konto?",
    dontHaveAccount: "Nie masz konta?",
    signIn: "Zaloguj sie",
    signUp: "Zarejestruj sie",
    or: "lub",
    emailAddress: "Adres e-mail",
    password: "Haslo",
    passwordHint: "Wielkie, male litery i cyfry (min 8 znakow)",
    continueWith: "Kontynuuj z",
    connectWallet: "Polacz portfel",
    magicLink: "Kontynuuj z Magic Link",
    passkey: "Zaloguj sie z Passkey",
    securedBy: "Zabezpieczone przez",
    backToSignIn: "Powrot do logowania"
  },
  nl: {
    welcomeBack: "Welkom terug",
    createAccount: "Maak je account aan",
    alreadyHaveAccount: "Heb je al een account?",
    dontHaveAccount: "Nog geen account?",
    signIn: "Inloggen",
    signUp: "Registreren",
    or: "of",
    emailAddress: "E-mailadres",
    password: "Wachtwoord",
    passwordHint: "Hoofdletters, kleine letters en cijfers vereist (min 8 tekens)",
    continueWith: "Doorgaan met",
    connectWallet: "Portemonnee verbinden",
    magicLink: "Doorgaan met Magic Link",
    passkey: "Inloggen met Passkey",
    securedBy: "Beveiligd door",
    backToSignIn: "Terug naar inloggen"
  },
  ar: {
    welcomeBack: "\u0645\u0631\u062D\u0628\u064B\u0627 \u0628\u0639\u0648\u062F\u062A\u0643",
    createAccount: "\u0623\u0646\u0634\u0626 \u062D\u0633\u0627\u0628\u0643",
    alreadyHaveAccount: "\u0644\u062F\u064A\u0643 \u062D\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061F",
    dontHaveAccount: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u062D\u0633\u0627\u0628\u061F",
    signIn: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    signUp: "\u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628",
    or: "\u0623\u0648",
    emailAddress: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    password: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    passwordHint: "\u064A\u062C\u0628 \u0623\u0646 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u062D\u0631\u0641 \u0643\u0628\u064A\u0631\u0629 \u0648\u0635\u063A\u064A\u0631\u0629 \u0648\u0623\u0631\u0642\u0627\u0645 (8 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644)",
    continueWith: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645",
    connectWallet: "\u0631\u0628\u0637 \u0627\u0644\u0645\u062D\u0641\u0638\u0629",
    magicLink: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Magic Link",
    passkey: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 Passkey",
    securedBy: "\u0645\u062D\u0645\u064A \u0628\u0648\u0627\u0633\u0637\u0629",
    backToSignIn: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"
  },
  sv: {
    welcomeBack: "Valkommen tillbaka",
    createAccount: "Skapa ditt konto",
    alreadyHaveAccount: "Har du redan ett konto?",
    dontHaveAccount: "Har du inget konto?",
    signIn: "Logga in",
    signUp: "Registrera dig",
    or: "eller",
    emailAddress: "E-postadress",
    password: "Losenord",
    passwordHint: "Stora, sma bokstaver och siffror kravs (minst 8 tecken)",
    continueWith: "Fortsatt med",
    connectWallet: "Anslut planbok",
    magicLink: "Fortsatt med Magic Link",
    passkey: "Logga in med Passkey",
    securedBy: "Sakrad av",
    backToSignIn: "Tillbaka till inloggning"
  },
  uk: {
    welcomeBack: "\u0417 \u043F\u043E\u0432\u0435\u0440\u043D\u0435\u043D\u043D\u044F\u043C",
    createAccount: "\u0421\u0442\u0432\u043E\u0440\u0456\u0442\u044C \u043E\u0431\u043B\u0456\u043A\u043E\u0432\u0438\u0439 \u0437\u0430\u043F\u0438\u0441",
    alreadyHaveAccount: "\u0412\u0436\u0435 \u0454 \u043E\u0431\u043B\u0456\u043A\u043E\u0432\u0438\u0439 \u0437\u0430\u043F\u0438\u0441?",
    dontHaveAccount: "\u041D\u0435\u043C\u0430\u0454 \u043E\u0431\u043B\u0456\u043A\u043E\u0432\u043E\u0433\u043E \u0437\u0430\u043F\u0438\u0441\u0443?",
    signIn: "\u0423\u0432\u0456\u0439\u0442\u0438",
    signUp: "\u0417\u0430\u0440\u0435\u0454\u0441\u0442\u0440\u0443\u0432\u0430\u0442\u0438\u0441\u044F",
    or: "\u0430\u0431\u043E",
    emailAddress: "\u0415\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0430 \u043F\u043E\u0448\u0442\u0430",
    password: "\u041F\u0430\u0440\u043E\u043B\u044C",
    passwordHint: "\u0412\u0435\u043B\u0438\u043A\u0456, \u043C\u0430\u043B\u0456 \u043B\u0456\u0442\u0435\u0440\u0438 \u0442\u0430 \u0446\u0438\u0444\u0440\u0438 (\u043C\u0456\u043D. 8 \u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432)",
    continueWith: "\u041F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438 \u0437",
    connectWallet: "\u041F\u0456\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0438 \u0433\u0430\u043C\u0430\u043D\u0435\u0446\u044C",
    magicLink: "\u041F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438 \u0437 Magic Link",
    passkey: "\u0423\u0432\u0456\u0439\u0442\u0438 \u0437 Passkey",
    securedBy: "\u0417\u0430\u0445\u0438\u0449\u0435\u043D\u043E",
    backToSignIn: "\u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F \u0434\u043E \u0432\u0445\u043E\u0434\u0443"
  }
};
function getStrings(locale) {
  if (locale in translations) return translations[locale];
  const lang = locale.split("-")[0].split("_")[0];
  if (lang in translations) return translations[lang];
  return translations.en;
}

// src/modal.ts
function hexToRgba(hex, alpha) {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
var WALLET_OPTIONS = [
  { id: "pexus", name: "Pexus", color: "#7c3aed" },
  { id: "metamask", name: "MetaMask", color: "#f6851b" },
  { id: "phantom", name: "Phantom", color: "#ab9ff2" }
];
function walletIconSvg(id) {
  switch (id) {
    case "pexus":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#7c3aed"/><path d="M7 8h4v8H7V8zm6 0h4v8h-4V8z" fill="#fff"/></svg>`;
    case "metamask":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#f6851b"/><path d="M17.2 4L12 8.5l1 .7L17.2 4zM6.8 4l5.1 5.3-1-0.6L6.8 4zM16 16.2l-1.4 2.1 3 .8.8-2.9h-2.4zM5.6 16.2l.9 2.8 3-.8-1.4-2h-2.5z" fill="#fff"/></svg>`;
    case "phantom":
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#ab9ff2"/><circle cx="9" cy="11" r="1.5" fill="#fff"/><circle cx="15" cy="11" r="1.5" fill="#fff"/><path d="M6 12c0-3.3 2.7-6 6-6s6 2.7 6 6v2c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2v-2z" stroke="#fff" stroke-width="1.5" fill="none"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#666"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="12">${id[0]?.toUpperCase() ?? "W"}</text></svg>`;
  }
}
var ModalRenderer = class {
  shadowRoot = null;
  hostElement = null;
  containerElement = null;
  containerId = null;
  mode;
  theme;
  branding;
  themeObserver = null;
  mediaQueryListener = null;
  enabledProviders = [];
  currentView = "signIn";
  onProviderClick;
  onEmailSubmit;
  onClose;
  onWeb3WalletSelect;
  onPasswordlessSubmit;
  onOtpVerify;
  onPasskeyClick;
  escHandler = null;
  // Overlay state
  currentOverlay = "none";
  selectedWallet = "";
  overlayEmail = "";
  overlayError = "";
  // Turnstile CAPTCHA
  captchaSiteKey = "";
  turnstileWidgetId = null;
  turnstileToken = "";
  turnstileWrapper = null;
  // i18n
  t;
  // Dev Teleport (test mode)
  isTestMode = false;
  onDevTeleport = null;
  constructor(options) {
    this.mode = options.mode;
    this.theme = options.theme || "auto";
    this.branding = { ...DEFAULT_BRANDING, ...options.branding };
    this.captchaSiteKey = options.captchaSiteKey || "";
    this.isTestMode = options.isTestMode || false;
    this.t = getStrings(options.locale || "en");
    this.onDevTeleport = options.onDevTeleport || null;
    this.onProviderClick = options.onProviderClick;
    this.onEmailSubmit = options.onEmailSubmit;
    this.onClose = options.onClose;
    this.onWeb3WalletSelect = options.onWeb3WalletSelect || (() => {
    });
    this.onPasswordlessSubmit = options.onPasswordlessSubmit || (() => {
    });
    this.onOtpVerify = options.onOtpVerify || (() => {
    });
    this.onPasskeyClick = options.onPasskeyClick || (() => {
    });
    if (options.mode === "embedded" && options.containerId) {
      this.containerId = options.containerId;
    }
  }
  resolveContainerElement() {
    if (this.mode !== "embedded" || !this.containerId) return null;
    const next = document.getElementById(this.containerId);
    if (this.containerElement !== next) {
      this.hostElement?.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    this.containerElement = next;
    return next;
  }
  setProviders(providers) {
    this.enabledProviders = providers;
  }
  setBranding(branding) {
    this.branding = { ...DEFAULT_BRANDING, ...branding };
  }
  open(view = "signIn") {
    this.resolveContainerElement();
    if (this.hostElement && !this.hostElement.isConnected) {
      this.hostElement = null;
      this.shadowRoot = null;
    }
    if (this.shadowRoot && this.hostElement) {
      this.hideOverlay();
      this.switchView(view);
    } else {
      this.currentView = view;
      this.currentOverlay = "none";
      this.render(view);
    }
  }
  close() {
    this.stopThemeObserver();
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
    }
    if (this.turnstileWidgetId !== null) {
      window.turnstile?.remove(this.turnstileWidgetId);
      this.turnstileWidgetId = null;
      this.turnstileToken = "";
    }
    if (this.turnstileWrapper) {
      this.turnstileWrapper.remove();
      this.turnstileWrapper = null;
    }
    if (this.hostElement) {
      this.hostElement.remove();
      this.hostElement = null;
      this.shadowRoot = null;
    }
    const liveContainer = this.resolveContainerElement();
    if (liveContainer) {
      liveContainer.replaceChildren();
    }
    this.currentOverlay = "none";
  }
  getTurnstileToken() {
    return this.turnstileToken;
  }
  resetTurnstile() {
    if (this.turnstileWidgetId !== null) {
      window.turnstile?.reset(this.turnstileWidgetId);
      this.turnstileToken = "";
    }
  }
  /** Update theme at runtime without destroying form state */
  setTheme(theme) {
    this.theme = theme;
    this.updateThemeCSS();
    if (theme === "auto") {
      this.startThemeObserver();
    } else {
      this.stopThemeObserver();
    }
  }
  updateThemeCSS() {
    if (!this.shadowRoot) return;
    const styleEl = this.shadowRoot.getElementById("authon-theme-style");
    if (styleEl) {
      styleEl.textContent = this.buildCSS();
    }
  }
  startThemeObserver() {
    this.stopThemeObserver();
    if (typeof document === "undefined" || typeof window === "undefined") return;
    this.themeObserver = new MutationObserver(() => this.updateThemeCSS());
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"]
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    this.mediaQueryListener = () => this.updateThemeCSS();
    mq.addEventListener("change", this.mediaQueryListener);
  }
  stopThemeObserver() {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
      this.themeObserver = null;
    }
    if (this.mediaQueryListener) {
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", this.mediaQueryListener);
      this.mediaQueryListener = null;
    }
  }
  showError(message) {
    if (!this.shadowRoot) return;
    this.clearError();
    const errorEl = this.shadowRoot.getElementById("email-form");
    if (errorEl) {
      const errDiv = document.createElement("div");
      errDiv.id = "authon-error-msg";
      errDiv.className = "error-msg";
      errDiv.textContent = message;
      errorEl.appendChild(errDiv);
    }
  }
  showBanner(message, type = "error") {
    if (!this.shadowRoot) return;
    this.clearBanner();
    const inner = this.shadowRoot.getElementById("modal-inner");
    if (!inner) return;
    const banner = document.createElement("div");
    banner.id = "authon-banner";
    banner.className = type === "warning" ? "banner-warning" : "error-msg";
    banner.textContent = message;
    inner.insertBefore(banner, inner.firstChild);
  }
  clearBanner() {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById("authon-banner")?.remove();
  }
  clearError() {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById("authon-error-msg")?.remove();
  }
  showLoading() {
    if (!this.shadowRoot) return;
    this.hideLoading();
    const overlay = document.createElement("div");
    overlay.id = "authon-loading-overlay";
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="loading-ring"></div>
        <div class="loading-ring"></div>
        <div class="loading-ring"></div>
      </div>
      <div class="loading-text">Signing in<span class="loading-dots"><span></span><span></span><span></span></span></div>
    `;
    this.shadowRoot.querySelector(".modal-container")?.appendChild(overlay);
  }
  hideLoading() {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById("authon-loading-overlay")?.remove();
  }
  // ── Flow Overlay Public API ──
  showOverlay(overlay) {
    this.currentOverlay = overlay;
    this.overlayError = "";
    this.renderOverlay();
  }
  hideOverlay() {
    this.currentOverlay = "none";
    this.overlayError = "";
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById("flow-overlay")?.remove();
  }
  showWeb3Success(walletId, address) {
    this.selectedWallet = walletId;
    this.overlayError = "";
    const truncated = address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
    this.currentOverlay = "web3-success";
    this.renderOverlayWithData({ truncatedAddress: truncated, walletId });
  }
  showPasswordlessSent() {
    this.overlayError = "";
    this.currentOverlay = "passwordless-sent";
    this.renderOverlay();
  }
  showOtpInput(email) {
    this.overlayEmail = email;
    this.overlayError = "";
    this.currentOverlay = "otp-input";
    this.renderOverlay();
  }
  showPasskeySuccess() {
    this.overlayError = "";
    this.currentOverlay = "passkey-success";
    this.renderOverlay();
  }
  showOverlayError(message) {
    this.overlayError = message;
    if (this.currentOverlay !== "none") {
      this.renderOverlay();
    }
  }
  // ── Smooth view switch (no flicker) ──
  switchView(view) {
    if (!this.shadowRoot || view === this.currentView) return;
    this.currentView = view;
    const inner = this.shadowRoot.getElementById("modal-inner");
    if (!inner) return;
    inner.style.opacity = "0";
    inner.style.transform = "translateY(-4px)";
    setTimeout(() => {
      inner.innerHTML = this.buildInnerContent(view);
      this.attachInnerEvents(view);
      void inner.offsetHeight;
      inner.style.opacity = "1";
      inner.style.transform = "translateY(0)";
    }, 140);
  }
  // ── Render ──
  render(view) {
    const host = document.createElement("div");
    host.setAttribute("data-authon-modal", "");
    this.hostElement = host;
    if (this.mode === "popup") {
      document.body.appendChild(host);
    } else {
      const container = this.resolveContainerElement();
      if (!container) {
        this.hostElement = null;
        throw new Error(`Authon container "#${this.containerId}" not found`);
      }
      container.replaceChildren();
      container.appendChild(host);
    }
    this.shadowRoot = host.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = this.buildShell(view);
    this.attachInnerEvents(view);
    this.attachShellEvents();
    if (this.theme === "auto") {
      this.startThemeObserver();
    }
  }
  // ── HTML builders ──
  /** Shell = style + backdrop + modal-container (stable across view switches) */
  buildShell(view) {
    const popupWrapper = this.mode === "popup" ? `<div class="backdrop" id="backdrop"></div>` : "";
    return `
      <style id="authon-theme-style">${this.buildCSS()}</style>
      ${popupWrapper}
      <div class="modal-container" role="dialog" aria-modal="true">
        <div id="modal-inner" class="modal-inner">
          ${this.buildInnerContent(view)}
        </div>
      </div>
    `;
  }
  /** Inner content = everything inside the modal that changes per view */
  buildInnerContent(view) {
    const b = this.branding;
    const isSignUp = view === "signUp";
    const title = isSignUp ? this.t.createAccount : this.t.welcomeBack;
    const subtitle = isSignUp ? this.t.alreadyHaveAccount : this.t.dontHaveAccount;
    const subtitleLink = isSignUp ? this.t.signIn : this.t.signUp;
    const dark = this.isDark();
    const showProviders = !isSignUp;
    const providerButtons = showProviders ? this.enabledProviders.filter((p) => !b.hiddenProviders?.includes(p)).map((p) => {
      const config = getProviderButtonConfig(p);
      const isWhiteBg = config.bgColor === "#ffffff";
      const btnBg = dark && isWhiteBg ? "#f8fafc" : config.bgColor;
      const btnBorder = isWhiteBg ? dark ? "#475569" : "#e5e7eb" : config.bgColor;
      return `<button class="provider-btn" data-provider="${p}" style="background:${btnBg};color:${config.textColor};border:1px solid ${btnBorder}">
              <span class="provider-icon">${config.iconSvg}</span>
              <span>${config.label}</span>
            </button>`;
    }).join("") : "";
    const hasVisibleProviders = showProviders && this.enabledProviders.filter((p) => !b.hiddenProviders?.includes(p)).length > 0;
    const divider = hasVisibleProviders && b.showDivider !== false && b.showEmailPassword !== false ? `<div class="divider"><span>${this.t.or}</span></div>` : "";
    const emailForm = b.showEmailPassword !== false ? `<form class="email-form" id="email-form">
          <input type="email" placeholder="${this.t.emailAddress}" name="email" required class="input" autocomplete="email" />
          <input type="password" placeholder="${this.t.password}" name="password" required class="input" autocomplete="${isSignUp ? "new-password" : "current-password"}" />
          ${isSignUp ? `<p class="password-hint">${this.t.passwordHint}</p>` : ""}
          <button type="submit" class="submit-btn">${isSignUp ? this.t.signUp : this.t.signIn}</button>
        </form>` : "";
    const hasMethodAbove = showProviders && this.enabledProviders.length > 0 || b.showEmailPassword !== false;
    const hasMethodBelow = b.showWeb3 || b.showPasswordless || b.showPasskey;
    const methodDivider = hasMethodAbove && hasMethodBelow ? `<div class="divider"><span>or</span></div>` : "";
    const methodButtons = [];
    if (b.showWeb3) {
      methodButtons.push(`<button class="auth-method-btn web3-btn" id="web3-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/>
        </svg>
        <span>${this.t.connectWallet}</span>
      </button>`);
    }
    if (b.showPasswordless) {
      methodButtons.push(`<button class="auth-method-btn passwordless-btn" id="passwordless-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        <span>${this.t.magicLink}</span>
      </button>`);
    }
    if (b.showPasskey) {
      methodButtons.push(`<button class="auth-method-btn passkey-btn" id="passkey-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/><path d="M21.7 13.3 19 11"/><path d="m21 15-2.5-1.5"/><path d="m17 17 2.5-1.5"/><path d="M22 9v6a1 1 0 0 1-1 1h-.5"/><circle cx="18" cy="9" r="3"/>
        </svg>
        <span>${this.t.passkey}</span>
      </button>`);
    }
    const authMethods = methodButtons.length > 0 ? `<div class="auth-methods">${methodButtons.join("")}</div>` : "";
    const footer = b.termsUrl || b.privacyUrl ? `<div class="footer">
          ${b.termsUrl ? `<a href="${b.termsUrl}" target="_blank">Terms of Service</a>` : ""}
          ${b.termsUrl && b.privacyUrl ? " \xB7 " : ""}
          ${b.privacyUrl ? `<a href="${b.privacyUrl}" target="_blank">Privacy Policy</a>` : ""}
        </div>` : "";
    const titleHtml = isSignUp ? `<div class="title-row">
          <button class="back-btn" id="back-btn" type="button" aria-label="Back to sign in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
          <h2 class="title">${title}</h2>
        </div>` : `<h2 class="title">${title}</h2>`;
    return `
      ${b.logoDataUrl ? `<img src="${b.logoDataUrl}" alt="Logo" class="logo" />` : ""}
      ${titleHtml}
      ${b.brandName ? `<p class="brand-name">${b.brandName}</p>` : ""}
      ${showProviders ? `<div class="providers">${providerButtons}</div>` : ""}
      ${divider}
      ${emailForm}
      ${methodDivider}
      ${authMethods}
      <p class="switch-view">${subtitle} <a href="#" id="switch-link">${subtitleLink}</a></p>
      ${footer}
      ${this.isTestMode ? `<div class="dev-teleport">
        <div class="dev-teleport-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Dev Teleport
        </div>
        <div class="dev-teleport-row">
          <input type="email" placeholder="test@example.com" id="dev-teleport-email" class="dev-teleport-input" value="dev@test.com" />
          <button type="button" id="dev-teleport-btn" class="dev-teleport-btn">Go</button>
        </div>
      </div>` : ""}
      ${b.showSecuredBy !== false ? `<div class="secured-by">${this.t.securedBy} <a href="https://authon.dev" target="_blank" rel="noopener noreferrer" class="secured-link">Authon</a></div>` : ""}
    `;
  }
  renderTurnstile() {
    if (!this.captchaSiteKey) return;
    const w = window;
    const tryRender = () => {
      if (!w.turnstile) return;
      this.turnstileWrapper = document.createElement("div");
      this.turnstileWrapper.style.cssText = "position:fixed;bottom:10px;right:10px;z-index:2147483647;";
      document.body.appendChild(this.turnstileWrapper);
      this.turnstileWidgetId = w.turnstile.render(this.turnstileWrapper, {
        sitekey: this.captchaSiteKey,
        callback: (token) => {
          this.turnstileToken = token;
        },
        "expired-callback": () => {
          this.turnstileToken = "";
        },
        "error-callback": () => {
          this.turnstileToken = "";
        },
        theme: this.isDark() ? "dark" : "light",
        appearance: "interaction-only"
      });
    };
    if (w.turnstile) {
      tryRender();
    } else {
      const interval = setInterval(() => {
        if (w.turnstile) {
          clearInterval(interval);
          tryRender();
        }
      }, 200);
      setTimeout(() => clearInterval(interval), 1e4);
    }
  }
  isDark() {
    if (this.theme === "dark") return true;
    if (this.theme === "light") return false;
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (html.classList.contains("dark") || html.getAttribute("data-theme") === "dark") return true;
      if (html.classList.contains("light") || html.getAttribute("data-theme") === "light") return false;
    }
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  buildCSS() {
    const b = this.branding;
    const dark = this.isDark();
    const bg = dark ? b.darkBg || "#0f172a" : b.lightBg || "#ffffff";
    const text = dark ? b.darkText || "#f1f5f9" : b.lightText || "#111827";
    const mutedText = dark ? "#94a3b8" : "#6b7280";
    const dimText = dark ? "#64748b" : "#9ca3af";
    const borderColor = dark ? "#334155" : "#d1d5db";
    const dividerColor = dark ? "#334155" : "#e5e7eb";
    const inputBg = dark ? "#1e293b" : "#ffffff";
    return `
      :host {
        --authon-primary-start: ${b.primaryColorStart || "#7c3aed"};
        --authon-primary-end: ${b.primaryColorEnd || "#4f46e5"};
        --authon-bg: ${bg};
        --authon-text: ${text};
        --authon-muted: ${mutedText};
        --authon-dim: ${dimText};
        --authon-border: ${borderColor};
        --authon-divider: ${dividerColor};
        --authon-input-bg: ${inputBg};
        --authon-overlay-bg: ${hexToRgba(bg, 0.92)};
        --authon-overlay-bg-solid: ${hexToRgba(bg, 0.97)};
        --authon-backdrop-bg: rgba(0,0,0,${dark ? "0.7" : "0.5"});
        --authon-shadow-opacity: ${dark ? "0.5" : "0.25"};
        --authon-radius: ${b.borderRadius ?? 12}px;
        --authon-font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-family: var(--authon-font);
        color: var(--authon-text);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .backdrop {
        position: fixed; inset: 0; z-index: 99998;
        background: var(--authon-backdrop-bg); backdrop-filter: blur(4px);
        animation: fadeIn 0.2s ease;
      }
      .modal-container {
        ${this.mode === "popup" ? "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; max-height: 90vh; overflow-y: auto;" : ""}
        background: var(--authon-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: var(--authon-radius);
        padding: 32px;
        width: 400px; max-width: 100%;
        position: ${this.mode === "popup" ? "fixed" : "relative"};
        ${this.mode === "popup" ? `box-shadow: 0 25px 50px -12px rgba(0,0,0,${dark ? "0.5" : "0.25"}); animation: slideIn 0.3s ease;` : ""}
      }
      .modal-inner {
        transition: opacity 0.14s ease, transform 0.14s ease;
      }
      .logo { display: block; margin: 0 auto 16px; max-height: 48px; }
      .title-row { display: flex; align-items: center; position: relative; margin-bottom: 8px; }
      .title-row .title { flex: 1; margin-bottom: 0; }
      .back-btn {
        position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        background: none; border: none; color: var(--authon-muted);
        cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .back-btn:hover { color: var(--authon-text); background: var(--authon-divider); }
      .password-hint { font-size: 11px; color: var(--authon-dim); margin: -4px 0 2px; }
      .title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 8px; color: var(--authon-text); }
      .brand-name { text-align: center; font-size: 14px; color: var(--authon-muted); margin-bottom: 24px; }
      .providers { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
      .provider-btn {
        display: flex; align-items: center; gap: 12px;
        width: 100%; padding: 10px 16px; border-radius: calc(var(--authon-radius) * 0.67);
        font-size: 14px; font-weight: 500; cursor: pointer;
        transition: opacity 0.15s, transform 0.1s;
        font-family: var(--authon-font);
      }
      .provider-btn:hover { opacity: 0.9; }
      .provider-btn:active { transform: scale(0.98); }
      .provider-icon { display: flex; align-items: center; flex-shrink: 0; }
      .divider {
        display: flex; align-items: center; gap: 12px;
        margin: 16px 0; color: var(--authon-dim); font-size: 13px;
      }
      .divider::before, .divider::after {
        content: ''; flex: 1; height: 1px; background: var(--authon-divider);
      }
      .email-form { display: flex; flex-direction: column; gap: 10px; }
      .input {
        width: 100%; padding: 10px 14px;
        background: var(--authon-input-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border); border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-family: var(--authon-font);
        outline: none; transition: border-color 0.15s;
      }
      .input::placeholder { color: var(--authon-dim); }
      .input:focus { border-color: var(--authon-primary-start); box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
      .submit-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .submit-btn:hover { opacity: 0.9; }
      .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      .error-msg {
        margin-top: 8px; padding: 8px 12px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #ef4444; text-align: center;
        animation: fadeIn 0.15s ease;
      }
      .banner-warning {
        margin-bottom: 16px; padding: 10px 14px;
        background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #f59e0b; text-align: center;
        animation: fadeIn 0.15s ease;
      }
      .switch-view { text-align: center; margin-top: 16px; font-size: 13px; color: var(--authon-muted); }
      .switch-view a { color: var(--authon-primary-start); text-decoration: none; font-weight: 500; }
      .switch-view a:hover { text-decoration: underline; }
      .footer { text-align: center; margin-top: 12px; font-size: 12px; color: var(--authon-dim); }
      .footer a { color: var(--authon-dim); text-decoration: none; }
      .footer a:hover { text-decoration: underline; }
      .secured-by {
        text-align: center; margin-top: 16px;
        font-size: 11px; color: var(--authon-dim);
      }
      .secured-link { font-weight: 600; color: var(--authon-muted); text-decoration: none; }
      .secured-link:hover { text-decoration: underline; }

      /* Dev Teleport */
      .dev-teleport {
        margin-top: 12px; padding: 10px;
        border-radius: calc(var(--authon-radius) * 0.5);
        background: rgba(251,191,36,0.06);
        border: 1px dashed rgba(251,191,36,0.25);
      }
      .dev-teleport-label {
        display: flex; align-items: center; gap: 4px;
        font-size: 10px; font-weight: 600; color: #fbbf24;
        margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;
      }
      .dev-teleport-row { display: flex; gap: 6px; }
      .dev-teleport-input {
        flex: 1; padding: 6px 10px; font-size: 12px;
        border-radius: calc(var(--authon-radius) * 0.4);
        background: rgba(0,0,0,0.2); border: 1px solid rgba(251,191,36,0.2);
        color: #fbbf24; outline: none; font-family: ui-monospace, monospace;
      }
      .dev-teleport-input:focus { border-color: rgba(251,191,36,0.5); }
      .dev-teleport-btn {
        padding: 6px 14px; font-size: 11px; font-weight: 700;
        border-radius: calc(var(--authon-radius) * 0.4);
        background: rgba(251,191,36,0.15); border: 1px solid rgba(251,191,36,0.3);
        color: #fbbf24; cursor: pointer;
      }
      .dev-teleport-btn:hover { background: rgba(251,191,36,0.25); }

      /* Auth method buttons */
      .auth-methods { display: flex; flex-direction: column; gap: 8px; }
      .auth-method-btn {
        display: flex; align-items: center; justify-content: center; gap: 8px;
        width: 100%; padding: 10px 16px;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s, transform 0.1s;
      }
      .auth-method-btn:hover { opacity: 0.85; }
      .auth-method-btn:active { transform: scale(0.98); }
      /* Web3 -- purple */
      .web3-btn {
        background: ${dark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)"};
        border: 1px solid ${dark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.25)"};
        color: ${dark ? "#c4b5fd" : "#7c3aed"};
      }
      /* Passwordless -- cyan */
      .passwordless-btn {
        background: ${dark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.08)"};
        border: 1px solid ${dark ? "rgba(6,182,212,0.3)" : "rgba(6,182,212,0.25)"};
        color: ${dark ? "#67e8f9" : "#0891b2"};
      }
      /* Passkey -- amber */
      .passkey-btn {
        background: ${dark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)"};
        border: 1px solid ${dark ? "rgba(245,158,11,0.3)" : "rgba(245,158,11,0.25)"};
        color: ${dark ? "#fcd34d" : "#b45309"};
      }

      /* Flow overlay */
      .flow-overlay {
        position: absolute; inset: 0; z-index: 10;
        background: var(--authon-overlay-bg-solid);
        backdrop-filter: blur(2px);
        border-radius: var(--authon-radius);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 12px; padding: 24px;
        animation: fadeIn 0.2s ease;
      }
      .flow-overlay .cancel-link {
        font-size: 12px; color: var(--authon-dim); cursor: pointer; border: none;
        background: none; font-family: var(--authon-font); margin-top: 4px;
      }
      .flow-overlay .cancel-link:hover { text-decoration: underline; }
      .flow-overlay .overlay-title {
        font-size: 14px; font-weight: 600; color: var(--authon-text); text-align: center;
      }
      .flow-overlay .overlay-subtitle {
        font-size: 12px; color: var(--authon-muted); text-align: center;
      }
      .flow-overlay .overlay-error {
        padding: 6px 12px; margin-top: 4px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 12px; color: #ef4444; text-align: center; width: 100%;
      }

      /* Wallet picker */
      .wallet-picker { display: flex; flex-direction: column; gap: 8px; width: 100%; }
      .wallet-btn {
        display: flex; align-items: center; gap: 10px;
        width: 100%; padding: 10px 14px;
        background: ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"};
        border: 1px solid ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"};
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 500; color: var(--authon-text);
        cursor: pointer; font-family: var(--authon-font);
        transition: opacity 0.15s;
      }
      .wallet-btn:hover { opacity: 0.8; }
      .wallet-btn .wallet-icon { display: flex; align-items: center; flex-shrink: 0; }
      .wallet-btn .wallet-icon svg { border-radius: 6px; }

      /* Passwordless email input in overlay */
      .pwless-form { display: flex; flex-direction: column; gap: 10px; width: 100%; }
      .pwless-submit {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, #06b6d4, #0891b2);
        color: #fff; border: none; border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .pwless-submit:hover { opacity: 0.9; }
      .pwless-submit:disabled { opacity: 0.6; cursor: not-allowed; }

      /* OTP input */
      .otp-container { display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%; }
      .otp-inputs { display: flex; gap: 8px; justify-content: center; }
      .otp-digit {
        width: 40px; height: 48px; text-align: center;
        font-size: 20px; font-weight: 600; font-family: var(--authon-font);
        background: var(--authon-input-bg); color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.33);
        outline: none; transition: border-color 0.15s;
      }
      .otp-digit:focus {
        border-color: var(--authon-primary-start);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
      }

      /* Success check animation */
      .success-check {
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
      }
      .success-check svg path {
        stroke-dasharray: 20;
        stroke-dashoffset: 20;
        animation: check-draw 0.4s ease-out 0.1s forwards;
      }

      /* Spinner */
      .flow-spinner {
        animation: spin 0.8s linear infinite;
      }

      /* Passkey verifying icon */
      .passkey-icon-pulse {
        width: 48px; height: 48px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: rgba(245,158,11,0.15);
        animation: pulse 1.5s ease-in-out infinite;
      }

      /* Wallet connecting icon */
      .wallet-connecting-icon {
        width: 48px; height: 48px; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        animation: pulse 1.5s ease-in-out infinite;
      }
      .wallet-connecting-icon svg { border-radius: 6px; }

      /* Address badge */
      .address-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 2px 10px; border-radius: 6px;
        background: ${dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"};
        font-size: 11px; font-family: monospace; color: var(--authon-muted);
      }
      .address-badge .wallet-icon-sm svg { width: 16px; height: 16px; border-radius: 4px; }

      /* Loading overlay */
      #authon-loading-overlay {
        position: absolute; inset: 0; z-index: 10;
        background: var(--authon-overlay-bg);
        backdrop-filter: blur(2px);
        border-radius: var(--authon-radius);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
        animation: fadeIn 0.15s ease;
      }
      .loading-spinner { position: relative; width: 48px; height: 48px; }
      .loading-ring {
        position: absolute; inset: 0;
        border: 2.5px solid transparent; border-top-color: var(--authon-primary-start);
        border-radius: 50%; animation: spin 1s cubic-bezier(.55,.15,.45,.85) infinite;
      }
      .loading-ring:nth-child(2) {
        inset: 5px; border-top-color: transparent; border-right-color: var(--authon-primary-end);
        animation-duration: 1.2s; animation-direction: reverse; opacity: .7;
      }
      .loading-ring:nth-child(3) {
        inset: 10px; border-top-color: transparent; border-bottom-color: var(--authon-primary-start);
        animation-duration: .8s; opacity: .4;
      }
      .loading-text { font-size: 14px; font-weight: 500; color: var(--authon-muted); }
      .loading-dots { display: inline-flex; gap: 2px; margin-left: 2px; }
      .loading-dots span {
        width: 3px; height: 3px; border-radius: 50%;
        background: var(--authon-muted); animation: blink 1.4s infinite both;
      }
      .loading-dots span:nth-child(2) { animation-delay: .2s; }
      .loading-dots span:nth-child(3) { animation-delay: .4s; }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes blink { 0%,80%,100% { opacity: .2; } 40% { opacity: 1; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { opacity: 0; transform: translate(-50%, -48%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      @keyframes check-draw { to { stroke-dashoffset: 0; } }
      @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
      ${b.customCss || ""}
    `;
  }
  // ── Flow Overlay Rendering ──
  renderOverlay() {
    this.renderOverlayWithData({});
  }
  renderOverlayWithData(data) {
    if (!this.shadowRoot) return;
    const container = this.shadowRoot.querySelector(".modal-container");
    if (!container) return;
    this.shadowRoot.getElementById("flow-overlay")?.remove();
    if (this.currentOverlay === "none") return;
    const overlay = document.createElement("div");
    overlay.id = "flow-overlay";
    overlay.className = "flow-overlay";
    overlay.innerHTML = this.buildOverlayContent(data);
    container.appendChild(overlay);
    this.attachOverlayEvents(overlay);
  }
  buildOverlayContent(data) {
    const dark = this.isDark();
    const errorHtml = this.overlayError ? `<div class="overlay-error">${this.escapeHtml(this.overlayError)}</div>` : "";
    switch (this.currentOverlay) {
      case "web3-picker": {
        const walletItems = WALLET_OPTIONS.map(
          (w) => `<button class="wallet-btn" data-wallet="${w.id}">
            <span class="wallet-icon">${walletIconSvg(w.id)}</span>
            <span>${w.name}</span>
          </button>`
        ).join("");
        return `
          <div class="overlay-title" style="margin-bottom: 4px;">Select Wallet</div>
          <div class="wallet-picker">${walletItems}</div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }
      case "web3-connecting": {
        const wallet = WALLET_OPTIONS.find((w) => w.id === this.selectedWallet);
        const walletName = wallet?.name ?? this.selectedWallet;
        return `
          <div class="wallet-connecting-icon">${walletIconSvg(this.selectedWallet)}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg class="flow-spinner" width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="6" fill="none" stroke="${wallet?.color ?? "#7c3aed"}" stroke-width="2" opacity="0.25"/>
              <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="${wallet?.color ?? "#7c3aed"}" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span class="overlay-subtitle">Connecting ${this.escapeHtml(walletName)}...</span>
          </div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }
      case "web3-success": {
        const wallet = WALLET_OPTIONS.find((w) => w.id === (data.walletId || this.selectedWallet));
        const walletColor = wallet?.color ?? "#8b5cf6";
        const truncAddr = data.truncatedAddress || "0x...";
        return `
          <div class="success-check" style="background:linear-gradient(135deg, ${walletColor}, ${walletColor})">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Wallet Connected</div>
          <div class="address-badge">
            <span class="wallet-icon-sm">${walletIconSvg(data.walletId || this.selectedWallet)}</span>
            <span>${this.escapeHtml(truncAddr)}</span>
          </div>
        `;
      }
      case "passwordless-input": {
        return `
          <div class="overlay-title">Enter your email</div>
          <div class="pwless-form">
            <input type="email" placeholder="you@example.com" class="input" id="pwless-email" autocomplete="email" />
            <button class="pwless-submit" id="pwless-submit-btn">Send Magic Link</button>
          </div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }
      case "passwordless-sending": {
        return `
          <svg class="flow-spinner" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" opacity="0.25"/>
            <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="overlay-subtitle">Sending magic link...</span>
        `;
      }
      case "passwordless-sent": {
        return `
          <div class="success-check" style="background:linear-gradient(135deg, var(--authon-primary-start, #7c3aed), var(--authon-primary-end, #4f46e5))">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Magic link sent!</div>
          <span class="overlay-subtitle">Check your email inbox</span>
        `;
      }
      case "otp-input": {
        const digitInputs = Array.from(
          { length: 6 },
          (_, i) => `<input type="text" inputmode="numeric" maxlength="1" class="otp-digit" data-idx="${i}" autocomplete="one-time-code" />`
        ).join("");
        return `
          <div class="otp-container">
            <div class="overlay-title">Enter verification code</div>
            <span class="overlay-subtitle">6-digit code sent to ${this.escapeHtml(this.overlayEmail)}</span>
            <div class="otp-inputs">${digitInputs}</div>
            ${errorHtml}
            <button class="cancel-link" id="overlay-cancel">Cancel</button>
          </div>
        `;
      }
      case "passkey-verifying": {
        return `
          <div class="passkey-icon-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="7" r="4"/><path d="M10.3 15H7a4 4 0 0 0-4 4v2"/>
              <path d="M21.7 13.3 19 11"/><path d="m21 15-2.5-1.5"/><path d="m17 17 2.5-1.5"/>
              <path d="M22 9v6a1 1 0 0 1-1 1h-.5"/><circle cx="18" cy="9" r="3"/>
            </svg>
          </div>
          <span class="overlay-subtitle">Verifying identity...</span>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">Cancel</button>
        `;
      }
      case "passkey-success": {
        return `
          <div class="success-check" style="background:linear-gradient(135deg, var(--authon-primary-start, #7c3aed), var(--authon-primary-end, #4f46e5))">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">Identity verified!</div>
        `;
      }
      default:
        return "";
    }
  }
  attachOverlayEvents(overlay) {
    if (!this.shadowRoot) return;
    const cancelBtn = overlay.querySelector("#overlay-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hideOverlay());
    }
    overlay.querySelectorAll(".wallet-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const walletId = btn.dataset.wallet;
        if (walletId) {
          this.selectedWallet = walletId;
          this.onWeb3WalletSelect(walletId);
        }
      });
    });
    const pwlessSubmit = overlay.querySelector("#pwless-submit-btn");
    const pwlessEmail = overlay.querySelector("#pwless-email");
    if (pwlessSubmit && pwlessEmail) {
      setTimeout(() => pwlessEmail.focus(), 50);
      const submitHandler = () => {
        const email = pwlessEmail.value.trim();
        if (!email) return;
        this.overlayEmail = email;
        this.showOverlay("passwordless-sending");
        this.onPasswordlessSubmit(email);
      };
      pwlessSubmit.addEventListener("click", submitHandler);
      pwlessEmail.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submitHandler();
        }
      });
    }
    const otpDigits = overlay.querySelectorAll(".otp-digit");
    if (otpDigits.length === 6) {
      setTimeout(() => otpDigits[0].focus(), 50);
      otpDigits.forEach((digit, idx) => {
        digit.addEventListener("input", () => {
          const val = digit.value.replace(/\D/g, "");
          digit.value = val.slice(0, 1);
          if (val && idx < 5) {
            otpDigits[idx + 1].focus();
          }
          const code = Array.from(otpDigits).map((d) => d.value).join("");
          if (code.length === 6) {
            this.onOtpVerify(this.overlayEmail, code);
          }
        });
        digit.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !digit.value && idx > 0) {
            otpDigits[idx - 1].focus();
            otpDigits[idx - 1].value = "";
          }
        });
        digit.addEventListener("paste", (e) => {
          e.preventDefault();
          const pasted = (e.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, 6);
          if (pasted.length === 0) return;
          for (let i = 0; i < 6; i++) {
            otpDigits[i].value = pasted[i] || "";
          }
          const lastIdx = Math.min(pasted.length, 5);
          otpDigits[lastIdx].focus();
          if (pasted.length === 6) {
            this.onOtpVerify(this.overlayEmail, pasted);
          }
        });
      });
    }
  }
  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  // ── Event binding ──
  /** Attach events to shell elements (backdrop, ESC) -- called once */
  attachShellEvents() {
    if (!this.shadowRoot) return;
    const backdrop = this.shadowRoot.getElementById("backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.onClose());
    }
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
    }
    if (this.mode === "popup") {
      this.escHandler = (e) => {
        if (e.key === "Escape") {
          if (this.currentOverlay !== "none") {
            this.hideOverlay();
          } else {
            this.onClose();
          }
        }
      };
      document.addEventListener("keydown", this.escHandler);
    }
  }
  /** Attach events to inner content (buttons, form, switch link) -- called on each view */
  attachInnerEvents(view) {
    if (!this.shadowRoot) return;
    this.shadowRoot.querySelectorAll(".provider-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const provider = btn.dataset.provider;
        this.onProviderClick(provider);
      });
    });
    const form = this.shadowRoot.getElementById("email-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        this.onEmailSubmit(
          formData.get("email"),
          formData.get("password"),
          view === "signUp"
        );
      });
    }
    this.renderTurnstile();
    const devTeleportBtn = this.shadowRoot.getElementById("dev-teleport-btn");
    const devTeleportEmail = this.shadowRoot.getElementById("dev-teleport-email");
    if (devTeleportBtn && devTeleportEmail && this.onDevTeleport) {
      const handler = this.onDevTeleport;
      devTeleportBtn.addEventListener("click", () => {
        const email = devTeleportEmail.value.trim();
        if (email) handler(email);
      });
      devTeleportEmail.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const email = devTeleportEmail.value.trim();
          if (email) handler(email);
        }
      });
    }
    const backBtn = this.shadowRoot.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.open("signIn");
      });
    }
    const switchLink = this.shadowRoot.getElementById("switch-link");
    if (switchLink) {
      switchLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.open(view === "signIn" ? "signUp" : "signIn");
      });
    }
    const web3Btn = this.shadowRoot.getElementById("web3-btn");
    if (web3Btn) {
      web3Btn.addEventListener("click", () => this.showOverlay("web3-picker"));
    }
    const pwlessBtn = this.shadowRoot.getElementById("passwordless-btn");
    if (pwlessBtn) {
      pwlessBtn.addEventListener("click", () => this.showOverlay("passwordless-input"));
    }
    const passkeyBtn = this.shadowRoot.getElementById("passkey-btn");
    if (passkeyBtn) {
      passkeyBtn.addEventListener("click", () => this.onPasskeyClick());
    }
  }
};

// src/session.ts
var SessionManager = class {
  accessToken = null;
  refreshToken = null;
  user = null;
  refreshTimer = null;
  apiUrl;
  publishableKey;
  storageKey;
  constructor(publishableKey, apiUrl) {
    this.publishableKey = publishableKey;
    this.apiUrl = apiUrl;
    this.storageKey = `authon_session_${publishableKey.slice(0, 16)}`;
    this.restoreFromStorage();
  }
  restoreFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;
      const data = JSON.parse(stored);
      if (data.accessToken && data.refreshToken && data.user) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = data.user;
        this.scheduleRefresh(5);
      }
    } catch {
    }
  }
  persistToStorage() {
    if (typeof window === "undefined") return;
    try {
      if (this.accessToken && this.refreshToken && this.user) {
        localStorage.setItem(this.storageKey, JSON.stringify({
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          user: this.user
        }));
      } else {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
    }
  }
  getToken() {
    return this.accessToken;
  }
  getUser() {
    return this.user;
  }
  setSession(tokens) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = tokens.user;
    this.persistToStorage();
    if (tokens.expiresIn && tokens.expiresIn > 0) {
      this.scheduleRefresh(tokens.expiresIn);
    }
  }
  updateUser(user) {
    this.user = user;
  }
  clearSession() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.persistToStorage();
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
  scheduleRefresh(expiresIn) {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const refreshIn = Math.max((expiresIn - 60) * 1e3, 3e4);
    this.refreshTimer = setTimeout(() => this.refresh(), refreshIn);
  }
  async refresh() {
    if (!this.refreshToken) {
      this.clearSession();
      return null;
    }
    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.publishableKey
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      if (!res.ok) {
        this.clearSession();
        return null;
      }
      const tokens = await res.json();
      this.setSession(tokens);
      return tokens;
    } catch {
      this.clearSession();
      return null;
    }
  }
  async signOut() {
    try {
      await fetch(`${this.apiUrl}/v1/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.publishableKey,
          ...this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}
        },
        credentials: "include"
      });
    } catch {
    }
    this.clearSession();
  }
  destroy() {
    this.clearSession();
  }
};

// src/qrcode.ts
var EXP = [];
var LOG = new Array(256).fill(0);
(() => {
  let v = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = v;
    LOG[v] = i;
    v <<= 1;
    if (v & 256) v ^= 285;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
var gfMul = (a, b) => a && b ? EXP[LOG[a] + LOG[b]] : 0;
function rsEncode(data, ecLen) {
  let g = [1];
  for (let i = 0; i < ecLen; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= gfMul(g[j], EXP[i]);
      ng[j + 1] ^= g[j];
    }
    g = ng;
  }
  const rem = new Array(ecLen).fill(0);
  for (const d of data) {
    const fb = d ^ rem[0];
    for (let j = 0; j < ecLen - 1; j++) {
      rem[j] = rem[j + 1] ^ gfMul(g[ecLen - 1 - j], fb);
    }
    rem[ecLen - 1] = gfMul(g[0], fb);
  }
  return rem;
}
var VER = [
  { total: 0, ec: 0, g1: 0, g1d: 0, g2: 0, g2d: 0, align: [] },
  // dummy
  { total: 26, ec: 7, g1: 1, g1d: 19, g2: 0, g2d: 0, align: [] },
  { total: 44, ec: 10, g1: 1, g1d: 34, g2: 0, g2d: 0, align: [6, 18] },
  { total: 70, ec: 15, g1: 1, g1d: 55, g2: 0, g2d: 0, align: [6, 22] },
  { total: 100, ec: 20, g1: 1, g1d: 80, g2: 0, g2d: 0, align: [6, 26] },
  { total: 134, ec: 26, g1: 1, g1d: 108, g2: 0, g2d: 0, align: [6, 30] },
  { total: 172, ec: 18, g1: 2, g1d: 68, g2: 0, g2d: 0, align: [6, 34] },
  { total: 196, ec: 20, g1: 2, g1d: 78, g2: 0, g2d: 0, align: [6, 22, 38] },
  { total: 242, ec: 24, g1: 2, g1d: 97, g2: 0, g2d: 0, align: [6, 24, 42] },
  { total: 292, ec: 30, g1: 2, g1d: 116, g2: 0, g2d: 0, align: [6, 26, 46] },
  { total: 346, ec: 18, g1: 2, g1d: 68, g2: 2, g2d: 69, align: [6, 28, 50] },
  { total: 404, ec: 20, g1: 4, g1d: 81, g2: 0, g2d: 0, align: [6, 30, 54] },
  { total: 466, ec: 24, g1: 2, g1d: 92, g2: 2, g2d: 93, align: [6, 32, 58] },
  { total: 532, ec: 26, g1: 4, g1d: 107, g2: 0, g2d: 0, align: [6, 34, 62] }
];
function dataCapacity(ver) {
  const v = VER[ver];
  return v.g1 * v.g1d + v.g2 * v.g2d;
}
function pickVersion(byteLen) {
  for (let v = 1; v < VER.length; v++) {
    const headerBits = 4 + (v <= 9 ? 8 : 16);
    const available = dataCapacity(v) * 8 - headerBits;
    if (byteLen * 8 <= available) return v;
  }
  throw new Error(`Data too long for QR code (${byteLen} bytes)`);
}
function encodeData(bytes, ver) {
  const cap = dataCapacity(ver);
  const countBits = ver <= 9 ? 8 : 16;
  const bits = [];
  const push = (val, len) => {
    for (let i = len - 1; i >= 0; i--) bits.push(val >> i & 1);
  };
  push(4, 4);
  push(bytes.length, countBits);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, cap * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const padBytes = [236, 17];
  let pi = 0;
  while (bits.length < cap * 8) {
    push(padBytes[pi], 8);
    pi ^= 1;
  }
  const cw = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = byte << 1 | bits[i + j];
    cw.push(byte);
  }
  return cw;
}
function computeCodewords(ver, dataCW) {
  const v = VER[ver];
  const blocks = [];
  const ecBlocks = [];
  let offset = 0;
  for (let i = 0; i < v.g1; i++) {
    const block = dataCW.slice(offset, offset + v.g1d);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, v.ec));
    offset += v.g1d;
  }
  for (let i = 0; i < v.g2; i++) {
    const block = dataCW.slice(offset, offset + v.g2d);
    blocks.push(block);
    ecBlocks.push(rsEncode(block, v.ec));
    offset += v.g2d;
  }
  const result = [];
  const maxDataLen = Math.max(v.g1d, v.g2d || 0);
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of blocks) {
      if (i < block.length) result.push(block[i]);
    }
  }
  for (let i = 0; i < v.ec; i++) {
    for (const block of ecBlocks) result.push(block[i]);
  }
  return result;
}
var UNSET = -1;
var DARK = 1;
var LIGHT = 0;
function createMatrix(size) {
  return Array.from({ length: size }, () => new Array(size).fill(UNSET));
}
function setModule(m, r, c, dark) {
  if (r >= 0 && r < m.length && c >= 0 && c < m.length) m[r][c] = dark ? DARK : LIGHT;
}
function placeFinderPattern(m, row, col) {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const dark = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || r >= 2 && r <= 4 && c >= 2 && c <= 4);
      setModule(m, row + r, col + c, dark);
    }
  }
}
function placeAlignmentPattern(m, row, col) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const dark = Math.abs(r) === 2 || Math.abs(c) === 2 || r === 0 && c === 0;
      m[row + r][col + c] = dark ? DARK : LIGHT;
    }
  }
}
function isReserved(m, r, c) {
  return m[r][c] !== UNSET;
}
function buildMatrix(ver, codewords) {
  const size = ver * 4 + 17;
  const m = createMatrix(size);
  placeFinderPattern(m, 0, 0);
  placeFinderPattern(m, 0, size - 7);
  placeFinderPattern(m, size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    m[6][i] = i % 2 === 0 ? DARK : LIGHT;
    m[i][6] = i % 2 === 0 ? DARK : LIGHT;
  }
  const ap = VER[ver].align;
  if (ap.length > 0) {
    for (const r of ap) {
      for (const c of ap) {
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(m, r, c);
      }
    }
  }
  m[4 * ver + 9][8] = DARK;
  for (let i = 0; i < 9; i++) {
    if (m[8][i] === UNSET) m[8][i] = LIGHT;
    if (m[i][8] === UNSET) m[i][8] = LIGHT;
  }
  for (let i = 0; i < 8; i++) {
    if (m[8][size - 1 - i] === UNSET) m[8][size - 1 - i] = LIGHT;
    if (m[size - 1 - i][8] === UNSET) m[size - 1 - i][8] = LIGHT;
  }
  if (ver >= 7) {
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        m[i][size - 11 + j] = LIGHT;
        m[size - 11 + j][i] = LIGHT;
      }
    }
  }
  let bitIdx = 0;
  const totalBits = codewords.length * 8;
  let upward = true;
  for (let right = size - 1; right >= 0; right -= 2) {
    if (right === 6) right = 5;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (const dc of [0, -1]) {
        const col = right + dc;
        if (col < 0 || col >= size) continue;
        if (isReserved(m, row, col)) continue;
        if (bitIdx < totalBits) {
          const byteIdx = bitIdx >> 3;
          const bitPos = 7 - (bitIdx & 7);
          m[row][col] = codewords[byteIdx] >> bitPos & 1;
          bitIdx++;
        } else {
          m[row][col] = LIGHT;
        }
      }
    }
    upward = !upward;
  }
  return m;
}
var MASKS = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => r * c % 2 + r * c % 3 === 0,
  (r, c) => (r * c % 2 + r * c % 3) % 2 === 0,
  (r, c) => ((r + c) % 2 + r * c % 3) % 2 === 0
];
function applyMask(m, maskIdx, template) {
  const size = m.length;
  const result = m.map((row) => [...row]);
  const fn = MASKS[maskIdx];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (template[r][c] !== UNSET) continue;
      if (fn(r, c)) result[r][c] ^= 1;
    }
  }
  return result;
}
function penalty(m) {
  const size = m.length;
  let score = 0;
  for (let r = 0; r < size; r++) {
    let count = 1;
    for (let c = 1; c < size; c++) {
      if (m[r][c] === m[r][c - 1]) {
        count++;
      } else {
        if (count >= 5) score += count - 2;
        count = 1;
      }
    }
    if (count >= 5) score += count - 2;
  }
  for (let c = 0; c < size; c++) {
    let count = 1;
    for (let r = 1; r < size; r++) {
      if (m[r][c] === m[r - 1][c]) {
        count++;
      } else {
        if (count >= 5) score += count - 2;
        count = 1;
      }
    }
    if (count >= 5) score += count - 2;
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const v = m[r][c];
      if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
    }
  }
  const pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[r][c + k] !== pat1[k]) match1 = false;
        if (m[r][c + k] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) score += 40;
    }
  }
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 11; r++) {
      let match1 = true, match2 = true;
      for (let k = 0; k < 11; k++) {
        if (m[r + k][c] !== pat1[k]) match1 = false;
        if (m[r + k][c] !== pat2[k]) match2 = false;
      }
      if (match1 || match2) score += 40;
    }
  }
  let dark = 0;
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (m[r][c]) dark++;
  const pct = dark * 100 / (size * size);
  const prev5 = Math.floor(pct / 5) * 5;
  const next5 = prev5 + 5;
  score += Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;
  return score;
}
function bchEncode(data, gen, dataBits) {
  let d = data << 15 - dataBits;
  const genLen = Math.floor(Math.log2(gen)) + 1;
  const totalBits = dataBits + (genLen - 1);
  d = data << totalBits - dataBits;
  for (let i = dataBits - 1; i >= 0; i--) {
    if (d & 1 << i + genLen - 1) d ^= gen << i;
  }
  return data << genLen - 1 | d;
}
function placeFormatInfo(m, maskIdx) {
  const size = m.length;
  const data = 1 << 3 | maskIdx;
  let format = bchEncode(data, 1335, 5);
  format ^= 21522;
  const bits = [];
  for (let i = 14; i >= 0; i--) bits.push(format >> i & 1);
  const hPos = [0, 1, 2, 3, 4, 5, 7, 8, size - 8, size - 7, size - 6, size - 5, size - 4, size - 3, size - 2];
  for (let i = 0; i < 15; i++) m[8][hPos[i]] = bits[i];
  const vPos = [size - 1, size - 2, size - 3, size - 4, size - 5, size - 6, size - 7, size - 8, 7, 5, 4, 3, 2, 1, 0];
  for (let i = 0; i < 15; i++) m[vPos[i]][8] = bits[i];
}
function placeVersionInfo(m, ver) {
  if (ver < 7) return;
  const size = m.length;
  let info = bchEncode(ver, 7973, 6);
  for (let i = 0; i < 18; i++) {
    const bit = info >> i & 1;
    const r = Math.floor(i / 3);
    const c = size - 11 + i % 3;
    m[r][c] = bit;
    m[c][r] = bit;
  }
}
function generateQrSvg(text, moduleSize = 4) {
  const bytes = Array.from(new TextEncoder().encode(text));
  const ver = pickVersion(bytes.length);
  const dataCW = encodeData(bytes, ver);
  const allCW = computeCodewords(ver, dataCW);
  const size = ver * 4 + 17;
  const template = createMatrix(size);
  placeFinderPattern(template, 0, 0);
  placeFinderPattern(template, 0, size - 7);
  placeFinderPattern(template, size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    template[6][i] = LIGHT;
    template[i][6] = LIGHT;
  }
  const ap = VER[ver].align;
  for (const r of ap) {
    for (const c of ap) {
      if (r <= 8 && c <= 8) continue;
      if (r <= 8 && c >= size - 8) continue;
      if (r >= size - 8 && c <= 8) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) template[r + dr][c + dc] = LIGHT;
    }
  }
  template[4 * ver + 9][8] = LIGHT;
  for (let i = 0; i < 9; i++) {
    if (template[8][i] === UNSET) template[8][i] = LIGHT;
    if (template[i][8] === UNSET) template[i][8] = LIGHT;
  }
  for (let i = 0; i < 8; i++) {
    if (template[8][size - 1 - i] === UNSET) template[8][size - 1 - i] = LIGHT;
    if (template[size - 1 - i][8] === UNSET) template[size - 1 - i][8] = LIGHT;
  }
  if (ver >= 7) {
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
      template[i][size - 11 + j] = LIGHT;
      template[size - 11 + j][i] = LIGHT;
    }
  }
  const base = buildMatrix(ver, allCW);
  let bestMask = 0;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const masked = applyMask(base, mask, template);
    placeFormatInfo(masked, mask);
    placeVersionInfo(masked, ver);
    const s = penalty(masked);
    if (s < bestScore) {
      bestScore = s;
      bestMask = mask;
    }
  }
  const final = applyMask(base, bestMask, template);
  placeFormatInfo(final, bestMask);
  placeVersionInfo(final, ver);
  const quiet = 4;
  const total = size + quiet * 2;
  const px = total * moduleSize;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${px}" height="${px}" shape-rendering="crispEdges">`;
  svg += `<rect width="${total}" height="${total}" fill="#fff"/>`;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (final[r][c] === DARK) {
        svg += `<rect x="${c + quiet}" y="${r + quiet}" width="1" height="1" fill="#000"/>`;
      }
    }
  }
  svg += "</svg>";
  return svg;
}

// src/authon.ts
var Authon = class {
  publishableKey;
  config;
  session;
  modal = null;
  listeners = /* @__PURE__ */ new Map();
  branding = null;
  providers = [];
  providerFlowModes = {};
  initialized = false;
  captchaEnabled = false;
  turnstileSiteKey = "";
  constructor(publishableKey, config) {
    this.publishableKey = publishableKey;
    this.config = {
      apiUrl: config?.apiUrl || "https://api.authon.dev",
      mode: config?.mode || "popup",
      theme: config?.theme || "auto",
      locale: config?.locale || "en",
      containerId: config?.containerId,
      appearance: config?.appearance
    };
    this.session = new SessionManager(publishableKey, this.config.apiUrl);
    this.consumeRedirectResultFromUrl();
  }
  // ── Public API ──
  async getProviders() {
    await this.ensureInitialized();
    return [...this.providers];
  }
  async openSignIn() {
    await this.ensureInitialized();
    this.getModal().open("signIn");
  }
  async openSignUp() {
    await this.ensureInitialized();
    this.getModal().open("signUp");
  }
  /** Update theme at runtime without destroying form state */
  setTheme(theme) {
    this.getModal().setTheme(theme);
  }
  async signInWithOAuth(provider, options) {
    await this.ensureInitialized();
    await this.startOAuthFlow(provider, options);
  }
  async signInWithEmail(email, password, turnstileToken) {
    const body = { email, password };
    if (turnstileToken) body.turnstileToken = turnstileToken;
    const res = await this.apiPost(
      "/v1/auth/signin",
      body
    );
    if (res.mfaRequired && res.mfaToken) {
      this.emit("mfaRequired", res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken);
    }
    this.session.setSession(res);
    this.emit("signedIn", res.user);
    return res.user;
  }
  async signUpWithEmail(email, password, meta) {
    const tokens = await this.apiPost("/v1/auth/signup", {
      email,
      password,
      ...meta
    });
    this.session.setSession(tokens);
    this.emit("signedIn", tokens.user);
    return tokens.user;
  }
  async signOut() {
    await this.session.signOut();
    this.emit("signedOut");
  }
  getUser() {
    return this.session.getUser();
  }
  getToken() {
    return this.session.getToken();
  }
  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
    const set = this.listeners.get(event);
    set.add(listener);
    return () => set.delete(listener);
  }
  // ── MFA ──
  async setupMfa() {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to setup MFA");
    const res = await this.apiPostAuth("/v1/auth/mfa/totp/setup", void 0, token);
    return { ...res, qrCodeSvg: generateQrSvg(res.qrCodeUri) };
  }
  async verifyMfaSetup(code) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to verify MFA setup");
    await this.apiPostAuth("/v1/auth/mfa/totp/verify-setup", { code }, token);
  }
  async verifyMfa(mfaToken, code) {
    const res = await this.apiPost("/v1/auth/mfa/verify", { mfaToken, code });
    this.session.setSession(res);
    this.emit("signedIn", res.user);
    return res.user;
  }
  async disableMfa(code) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to disable MFA");
    await this.apiPostAuth("/v1/auth/mfa/disable", { code }, token);
  }
  async getMfaStatus() {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to get MFA status");
    const res = await fetch(`${this.config.apiUrl}/v1/auth/mfa/status`, {
      headers: {
        "x-api-key": this.publishableKey,
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, "/v1/auth/mfa/status"));
    return res.json();
  }
  async regenerateBackupCodes(code) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to regenerate backup codes");
    const res = await this.apiPostAuth(
      "/v1/auth/mfa/backup-codes/regenerate",
      { code },
      token
    );
    return res.backupCodes;
  }
  // ── Passwordless ──
  async sendMagicLink(email) {
    await this.apiPost("/v1/auth/passwordless/magic-link", { email });
  }
  async sendEmailOtp(email) {
    await this.apiPost("/v1/auth/passwordless/email-otp", { email });
  }
  async verifyPasswordless(options) {
    const res = await this.apiPost("/v1/auth/passwordless/verify", options);
    this.session.setSession(res);
    this.emit("signedIn", res.user);
    return res.user;
  }
  // ── Passkeys ──
  async registerPasskey(name) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to register a passkey");
    const options = await this.apiPostAuth(
      "/v1/auth/passkeys/register/options",
      name ? { name } : void 0,
      token
    );
    const credential = await navigator.credentials.create({
      publicKey: this.deserializeCreationOptions(options.options)
    });
    const attestation = credential.response;
    const result = await this.apiPostAuth(
      "/v1/auth/passkeys/register/verify",
      {
        id: credential.id,
        rawId: this.bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: this.bufferToBase64url(attestation.attestationObject),
          clientDataJSON: this.bufferToBase64url(attestation.clientDataJSON)
        }
      },
      token
    );
    this.emit("passkeyRegistered", result);
    return result;
  }
  async authenticateWithPasskey(email) {
    const options = await this.apiPost(
      "/v1/auth/passkeys/authenticate/options",
      email ? { email } : void 0
    );
    const credential = await navigator.credentials.get({
      publicKey: this.deserializeRequestOptions(options.options)
    });
    const assertion = credential.response;
    const res = await this.apiPost("/v1/auth/passkeys/authenticate/verify", {
      id: credential.id,
      rawId: this.bufferToBase64url(credential.rawId),
      type: credential.type,
      response: {
        authenticatorData: this.bufferToBase64url(assertion.authenticatorData),
        clientDataJSON: this.bufferToBase64url(assertion.clientDataJSON),
        signature: this.bufferToBase64url(assertion.signature),
        userHandle: assertion.userHandle ? this.bufferToBase64url(assertion.userHandle) : void 0
      }
    });
    this.session.setSession(res);
    this.emit("signedIn", res.user);
    return res.user;
  }
  async listPasskeys() {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to list passkeys");
    return this.apiGetAuth("/v1/auth/passkeys", token);
  }
  async renamePasskey(passkeyId, name) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to rename a passkey");
    return this.apiPatchAuth(`/v1/auth/passkeys/${passkeyId}`, { name }, token);
  }
  async revokePasskey(passkeyId) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to revoke a passkey");
    await this.apiDeleteAuth(`/v1/auth/passkeys/${passkeyId}`, token);
  }
  // ── Web3 ──
  async web3GetNonce(address, chain, walletType, chainId) {
    return this.apiPost("/v1/auth/web3/nonce", {
      address,
      chain,
      walletType,
      ...chainId != null ? { chainId } : {}
    });
  }
  async web3Verify(message, signature, address, chain, walletType) {
    const res = await this.apiPost("/v1/auth/web3/verify", {
      message,
      signature,
      address,
      chain,
      walletType
    });
    this.session.setSession(res);
    this.emit("signedIn", res.user);
    return res.user;
  }
  async listWallets() {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to list wallets");
    return this.apiGetAuth("/v1/auth/web3/wallets", token);
  }
  async linkWallet(params) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to link a wallet");
    const wallet = await this.apiPostAuth("/v1/auth/web3/wallets/link", params, token);
    this.emit("web3Connected", wallet);
    return wallet;
  }
  async unlinkWallet(walletId) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to unlink a wallet");
    await this.apiDeleteAuth(`/v1/auth/web3/wallets/${walletId}`, token);
  }
  // ── User Profile ──
  async updateProfile(data) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to update profile");
    const user = await this.apiPatchAuth("/v1/auth/me", data, token);
    this.session.updateUser(user);
    return user;
  }
  // ── Session Management ──
  async listSessions() {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to list sessions");
    return this.apiGetAuth("/v1/auth/me/sessions", token);
  }
  async revokeSession(sessionId) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to revoke a session");
    await this.apiDeleteAuth(`/v1/auth/me/sessions/${sessionId}`, token);
  }
  // ── Organizations ──
  organizations = {
    list: async () => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to list organizations");
      return this.apiGetAuth("/v1/auth/organizations", token);
    },
    create: async (params) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to create an organization");
      return this.apiPostAuth("/v1/auth/organizations", params, token);
    },
    get: async (orgId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to get organization");
      return this.apiGetAuth(`/v1/auth/organizations/${orgId}`, token);
    },
    update: async (orgId, params) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to update organization");
      return this.apiPatchAuth(`/v1/auth/organizations/${orgId}`, params, token);
    },
    delete: async (orgId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to delete organization");
      await this.apiDeleteAuth(`/v1/auth/organizations/${orgId}`, token);
    },
    getMembers: async (orgId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to get organization members");
      return this.apiGetAuth(`/v1/auth/organizations/${orgId}/members`, token);
    },
    invite: async (orgId, params) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to invite a member");
      return this.apiPostAuth(`/v1/auth/organizations/${orgId}/invitations`, params, token);
    },
    getInvitations: async (orgId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to get invitations");
      return this.apiGetAuth(`/v1/auth/organizations/${orgId}/invitations`, token);
    },
    acceptInvitation: async (token) => {
      const authToken = this.session.getToken();
      if (!authToken) throw new Error("Must be signed in to accept an invitation");
      return this.apiPostAuth(`/v1/auth/organizations/invitations/${token}/accept`, void 0, authToken);
    },
    rejectInvitation: async (token) => {
      const authToken = this.session.getToken();
      if (!authToken) throw new Error("Must be signed in to reject an invitation");
      await this.apiPostAuth(`/v1/auth/organizations/invitations/${token}/reject`, void 0, authToken);
    },
    removeMember: async (orgId, memberId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to remove a member");
      await this.apiDeleteAuth(`/v1/auth/organizations/${orgId}/members/${memberId}`, token);
    },
    updateMemberRole: async (orgId, memberId, role) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to update member role");
      return this.apiPatchAuth(`/v1/auth/organizations/${orgId}/members/${memberId}`, { role }, token);
    },
    leave: async (orgId) => {
      const token = this.session.getToken();
      if (!token) throw new Error("Must be signed in to leave organization");
      await this.apiPostAuth(`/v1/auth/organizations/${orgId}/leave`, void 0, token);
    }
  };
  /** Testing utilities — only available when initialized with a pk_test_ key */
  get testing() {
    if (!this.publishableKey.startsWith("pk_test_")) return void 0;
    return {
      signIn: async (params) => {
        const res = await this.apiPost("/v1/auth/testing/token", params);
        this.session.setSession(res);
        this.emit("signedIn", res.user);
        return res.user;
      }
    };
  }
  destroy() {
    this.modal?.close();
    this.session.destroy();
    this.listeners.clear();
  }
  // ── Internal ──
  loadTurnstileScript() {
    if (typeof document === "undefined") return;
    if (document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    document.head.appendChild(script);
  }
  emit(event, ...args) {
    this.listeners.get(event)?.forEach((fn) => fn(...args));
  }
  async ensureInitialized() {
    if (this.initialized) return;
    try {
      const [branding, providersRes] = await Promise.all([
        this.apiGet("/v1/auth/branding"),
        this.apiGet("/v1/auth/providers")
      ]);
      this.branding = { ...branding, ...this.config.appearance };
      this.captchaEnabled = !!branding.captchaEnabled;
      this.turnstileSiteKey = branding.turnstileSiteKey || "";
      if (this.captchaEnabled && this.turnstileSiteKey) {
        this.loadTurnstileScript();
      }
      this.providers = providersRes.providers;
      this.providerFlowModes = {};
      for (const provider of this.providers) {
        this.providerFlowModes[provider] = this.normalizeFlowMode(
          providersRes.providerConfigs?.[provider]?.oauthFlow
        );
      }
      this.initialized = true;
    } catch (err) {
      this.emit("error", err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }
  getModal() {
    if (!this.modal) {
      this.modal = new ModalRenderer({
        mode: this.config.mode,
        theme: this.config.theme,
        locale: this.config.locale,
        containerId: this.config.containerId,
        branding: this.branding || void 0,
        captchaSiteKey: this.captchaEnabled ? this.turnstileSiteKey : void 0,
        isTestMode: this.publishableKey.startsWith("pk_test_"),
        onDevTeleport: this.publishableKey.startsWith("pk_test_") ? async (email) => {
          this.modal?.clearError();
          try {
            await this.testing.signIn({ email });
            this.modal?.close();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            this.modal?.showError(msg || "Dev teleport failed");
          }
        } : void 0,
        onProviderClick: (provider) => this.startOAuthFlow(provider),
        onEmailSubmit: (email, password, isSignUp) => {
          this.modal?.clearError();
          const turnstileToken = this.modal?.getTurnstileToken?.() || void 0;
          const promise = isSignUp ? this.signUpWithEmail(email, password, { turnstileToken }) : this.signInWithEmail(email, password, turnstileToken);
          promise.then(() => this.modal?.close()).catch((err) => {
            this.modal?.resetTurnstile?.();
            const msg = err instanceof Error ? err.message : String(err);
            this.modal?.showError(msg || "Authentication failed");
            this.emit("error", err instanceof Error ? err : new Error(msg));
          });
        },
        onClose: () => this.modal?.close(),
        onWeb3WalletSelect: async (walletId) => {
          const chain = walletId === "phantom" ? "solana" : "evm";
          try {
            this.modal?.showOverlay?.("web3-connecting");
            const address = await this.getWalletAddress(walletId);
            const { message } = await this.web3GetNonce(address, chain, walletId);
            const signature = await this.requestWalletSignature(walletId, message);
            await this.web3Verify(message, signature, address, chain, walletId);
            this.modal?.showWeb3Success(walletId, address);
            setTimeout(() => this.modal?.close(), 2500);
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onPasswordlessSubmit: async (email) => {
          try {
            const method = this.branding?.passwordlessMethod ?? "magic_link";
            if (method === "email_otp" || method === "both") {
              await this.sendEmailOtp(email);
              this.modal?.showOtpInput(email);
            } else {
              await this.sendMagicLink(email);
              this.modal?.showPasswordlessSent();
            }
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onOtpVerify: async (email, code) => {
          try {
            await this.verifyPasswordless({ email, code });
            this.modal?.close();
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        },
        onPasskeyClick: async () => {
          try {
            this.modal?.showOverlay?.("passkey-verifying");
            await this.authenticateWithPasskey();
            this.modal?.showPasskeySuccess();
            setTimeout(() => this.modal?.close(), 2500);
          } catch (err) {
            this.modal?.showOverlayError(err instanceof Error ? err.message : String(err));
          }
        }
      });
    }
    if (this.branding) this.modal.setBranding(this.branding);
    this.modal.setProviders(this.providers);
    return this.modal;
  }
  async startOAuthFlow(provider, options) {
    try {
      const configuredFlow = this.providerFlowModes[provider] ?? "auto";
      const flowMode = this.normalizeFlowMode(options?.flowMode ?? configuredFlow);
      if (flowMode === "redirect") {
        this.modal?.showLoading();
        await this.startRedirectOAuthFlow(provider);
        return;
      }
      const { url, state } = await this.requestOAuthAuthorization(provider, "popup");
      this.modal?.showLoading();
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        url,
        "authon-oauth",
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
      );
      if (!popup || popup.closed) {
        if (flowMode === "auto") {
          this.modal?.showBanner("Popup unavailable. Continuing with redirect sign-in\u2026", "warning");
          await this.startRedirectOAuthFlow(provider);
          return;
        }
        this.modal?.hideLoading();
        this.modal?.showBanner("Pop-up blocked. Please allow pop-ups for this site and try again.", "warning");
        this.emit("error", new Error("Popup was blocked by the browser"));
        return;
      }
      let resolved = false;
      let cleaned = false;
      const storageKey = `authon-oauth-${state}`;
      const resolve = (tokens) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        try {
          if (popup && !popup.closed) popup.close();
        } catch {
        }
        try {
          localStorage.removeItem(storageKey);
        } catch {
        }
        this.session.setSession(tokens);
        this.modal?.close();
        this.emit("signedIn", tokens.user);
      };
      const handleError = (msg) => {
        if (resolved) return;
        cleanup();
        this.session.clearSession();
        this.modal?.hideLoading();
        this.modal?.showError(msg);
        this.emit("error", new Error(msg));
      };
      const pollApi = async () => {
        if (resolved || cleaned) return;
        try {
          const result = await this.apiGet(
            `/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`
          );
          if (result.status === "completed" && result.accessToken) {
            resolve({
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
              expiresIn: result.expiresIn,
              user: result.user
            });
          } else if (result.status === "error") {
            handleError(result.message || "Authentication failed");
          }
        } catch {
        }
      };
      const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        window.removeEventListener("message", messageHandler);
        window.removeEventListener("storage", storageHandler);
        document.removeEventListener("visibilitychange", visibilityHandler);
        if (apiPollTimer) clearInterval(apiPollTimer);
        if (closePollTimer) clearInterval(closePollTimer);
        if (maxTimer) clearTimeout(maxTimer);
      };
      const messageHandler = (e) => {
        if (e.data?.type !== "authon-oauth-callback") return;
        if (e.data.tokens) {
          resolve(e.data.tokens);
        }
      };
      window.addEventListener("message", messageHandler);
      const storageHandler = (e) => {
        if (e.key !== storageKey || !e.newValue) return;
        try {
          const data = JSON.parse(e.newValue);
          if (data.tokens) resolve(data.tokens);
          else if (data.error) handleError(data.error);
        } catch {
        }
      };
      window.addEventListener("storage", storageHandler);
      try {
        const existing = localStorage.getItem(storageKey);
        if (existing) {
          const data = JSON.parse(existing);
          if (data.tokens) {
            resolve(data.tokens);
            return;
          }
        }
      } catch {
      }
      const apiPollTimer = setInterval(pollApi, 1500);
      const visibilityHandler = () => {
        if (document.visibilityState === "visible" && !resolved && !cleaned) {
          pollApi();
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
      const closePollTimer = setInterval(() => {
        if (resolved || cleaned) return;
        try {
          if (popup && popup.closed) {
            clearInterval(closePollTimer);
            pollApi();
            setTimeout(() => {
              if (resolved || cleaned) return;
              pollApi().then(() => {
                if (resolved || cleaned) return;
                cleanup();
                this.modal?.hideLoading();
              });
            }, 3e3);
          }
        } catch {
        }
      }, 500);
      const maxTimer = setTimeout(() => {
        if (resolved || cleaned) return;
        cleanup();
        this.modal?.hideLoading();
      }, 18e4);
    } catch (err) {
      this.modal?.hideLoading();
      this.emit("error", err instanceof Error ? err : new Error(String(err)));
    }
  }
  normalizeFlowMode(mode) {
    if (mode === "popup" || mode === "redirect" || mode === "auto") {
      return mode;
    }
    return "auto";
  }
  async requestOAuthAuthorization(provider, flowMode, returnTo) {
    const redirectUri = `${this.config.apiUrl}/v1/auth/oauth/redirect`;
    const params = new URLSearchParams({
      redirectUri,
      flow: flowMode
    });
    if (returnTo) {
      params.set("returnTo", returnTo);
    }
    return this.apiGet(
      `/v1/auth/oauth/${provider}/url?${params.toString()}`
    );
  }
  async startRedirectOAuthFlow(provider) {
    const { url } = await this.requestOAuthAuthorization(
      provider,
      "redirect",
      window.location.href
    );
    window.location.assign(url);
  }
  consumeRedirectResultFromUrl() {
    if (typeof window === "undefined") return;
    let currentUrl;
    try {
      currentUrl = new URL(window.location.href);
    } catch {
      return;
    }
    const state = currentUrl.searchParams.get("authon_oauth_state");
    const explicitError = currentUrl.searchParams.get("authon_oauth_error");
    if (!state && !explicitError) return;
    let consumed = false;
    if (state) {
      try {
        const storageKey = `authon-oauth-${state}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          if (data.tokens) {
            this.session.setSession(data.tokens);
            this.emit("signedIn", data.tokens.user);
            consumed = true;
          } else if (data.error) {
            this.emit("error", new Error(data.error));
            consumed = true;
          }
          localStorage.removeItem(storageKey);
        }
      } catch {
      }
    }
    if (!consumed && explicitError) {
      this.emit("error", new Error(explicitError));
    }
    currentUrl.searchParams.delete("authon_oauth_state");
    currentUrl.searchParams.delete("authon_oauth_error");
    window.history.replaceState({}, "", currentUrl.toString());
  }
  async apiGet(path) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: { "x-api-key": this.publishableKey },
      credentials: "include"
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }
  async apiPost(path, body) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.publishableKey
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }
  async apiPostAuth(path, body, token) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.publishableKey,
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }
  async apiGetAuth(path, token) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      headers: {
        "x-api-key": this.publishableKey,
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }
  async apiPatchAuth(path, body, token) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.publishableKey,
        Authorization: `Bearer ${token}`
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : void 0
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
    return res.json();
  }
  async apiDeleteAuth(path, token) {
    const res = await fetch(`${this.config.apiUrl}${path}`, {
      method: "DELETE",
      headers: {
        "x-api-key": this.publishableKey,
        Authorization: `Bearer ${token}`
      },
      credentials: "include"
    });
    if (!res.ok) throw new Error(await this.parseApiError(res, path));
  }
  // ── Wallet helpers ──
  async getWalletAddress(walletId) {
    if (walletId === "phantom") {
      const provider2 = window.solana;
      if (!provider2?.isPhantom) throw new Error("Phantom wallet not detected. Please install it from phantom.app");
      const resp = await provider2.connect();
      return resp.publicKey.toString();
    }
    const provider = window.ethereum;
    if (!provider) throw new Error(`${walletId} wallet not detected. Please install it.`);
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return accounts[0];
  }
  async requestWalletSignature(walletId, message) {
    if (walletId === "phantom") {
      const provider2 = window.solana;
      const encoded = new TextEncoder().encode(message);
      const signed = await provider2.signMessage(encoded, "utf8");
      return Array.from(new Uint8Array(signed.signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    const provider = window.ethereum;
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    return provider.request({ method: "personal_sign", params: [message, accounts[0]] });
  }
  // ── WebAuthn helpers ──
  bufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  base64urlToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  deserializeCreationOptions(options) {
    const opts = { ...options };
    if (typeof opts.challenge === "string") {
      opts.challenge = this.base64urlToBuffer(opts.challenge);
    }
    if (opts.user && typeof opts.user.id === "string") {
      opts.user.id = this.base64urlToBuffer(
        opts.user.id
      );
    }
    if (Array.isArray(opts.excludeCredentials)) {
      opts.excludeCredentials = opts.excludeCredentials.map((c) => ({
        ...c,
        id: typeof c.id === "string" ? this.base64urlToBuffer(c.id) : c.id
      }));
    }
    return opts;
  }
  deserializeRequestOptions(options) {
    const opts = { ...options };
    if (typeof opts.challenge === "string") {
      opts.challenge = this.base64urlToBuffer(opts.challenge);
    }
    if (Array.isArray(opts.allowCredentials)) {
      opts.allowCredentials = opts.allowCredentials.map((c) => ({
        ...c,
        id: typeof c.id === "string" ? this.base64urlToBuffer(c.id) : c.id
      }));
    }
    return opts;
  }
  async parseApiError(res, path) {
    try {
      const body = await res.json();
      if (Array.isArray(body.message) && body.message.length > 0) {
        return body.message[0];
      }
      if (typeof body.message === "string" && body.message !== "Bad Request") {
        return body.message;
      }
    } catch {
    }
    return `API ${path}: ${res.status}`;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Authon,
  AuthonMfaRequiredError,
  generateQrSvg,
  getProviderButtonConfig,
  getStrings,
  translations
});
//# sourceMappingURL=index.cjs.map