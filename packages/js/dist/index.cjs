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
  AuthonWalletError: () => AuthonWalletError,
  MAGIC_LINK_PARAM: () => MAGIC_LINK_PARAM,
  ProfileRenderer: () => ProfileRenderer,
  WalletClient: () => WalletClient,
  generateQrSvg: () => generateQrSvg,
  getProviderButtonConfig: () => getProviderButtonConfig,
  getStrings: () => getStrings,
  safeHttpUrl: () => safeHttpUrl,
  safeImageDataUrl: () => safeImageDataUrl,
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

// ../shared/dist/index.js
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
    backToSignIn: "Back to sign in",
    profile: "Profile",
    editProfile: "Edit Profile",
    displayName: "Display Name",
    save: "Save",
    signOut: "Sign Out",
    sessions: "Active Sessions",
    emailCode: "Continue with email code",
    enterEmail: "Enter your email",
    sendMagicLink: "Send Magic Link",
    sendCode: "Send code",
    sendingMagicLink: "Sending magic link...",
    sendingCode: "Sending code...",
    magicLinkSent: "Magic link sent!",
    checkInbox: "Check your email inbox",
    enterCode: "Enter verification code",
    codeSentTo: "6-digit code sent to {email}",
    cancel: "Cancel",
    magicLinkConfirmTitle: "Sign in with this account?",
    magicLinkConfirmBody: "You will be signed in as {email}. Cancel if you did not request this link.",
    magicLinkConfirmButton: "Sign in"
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
    backToSignIn: "\uB85C\uADF8\uC778\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
    profile: "\uD504\uB85C\uD544",
    editProfile: "\uD504\uB85C\uD544 \uD3B8\uC9D1",
    displayName: "\uD45C\uC2DC \uC774\uB984",
    save: "\uC800\uC7A5",
    signOut: "\uB85C\uADF8\uC544\uC6C3",
    sessions: "\uD65C\uC131 \uC138\uC158",
    emailCode: "\uC774\uBA54\uC77C \uCF54\uB4DC\uB85C \uACC4\uC18D\uD558\uAE30",
    enterEmail: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD558\uC138\uC694",
    sendMagicLink: "\uB9E4\uC9C1 \uB9C1\uD06C \uBCF4\uB0B4\uAE30",
    sendCode: "\uCF54\uB4DC \uBCF4\uB0B4\uAE30",
    sendingMagicLink: "\uB9E4\uC9C1 \uB9C1\uD06C\uB97C \uBCF4\uB0B4\uB294 \uC911...",
    sendingCode: "\uCF54\uB4DC\uB97C \uBCF4\uB0B4\uB294 \uC911...",
    magicLinkSent: "\uB9E4\uC9C1 \uB9C1\uD06C\uB97C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4",
    checkInbox: "\uBA54\uC77C\uD568\uC5D0\uC11C \uB9C1\uD06C\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694",
    enterCode: "\uBC1B\uC740 \uCF54\uB4DC\uB97C \uC785\uB825\uD558\uC138\uC694",
    codeSentTo: "{email}(\uC73C)\uB85C 6\uC790\uB9AC \uCF54\uB4DC\uB97C \uBCF4\uB0C8\uC2B5\uB2C8\uB2E4",
    cancel: "\uCDE8\uC18C",
    magicLinkConfirmTitle: "\uC774 \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD560\uAE4C\uC694?",
    magicLinkConfirmBody: "{email} \uACC4\uC815\uC73C\uB85C \uB85C\uADF8\uC778\uD569\uB2C8\uB2E4. \uC9C1\uC811 \uC694\uCCAD\uD55C \uB9C1\uD06C\uAC00 \uC544\uB2C8\uBA74 \uCDE8\uC18C\uB97C \uB20C\uB7EC \uC8FC\uC138\uC694.",
    magicLinkConfirmButton: "\uB85C\uADF8\uC778"
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
    backToSignIn: "\u30ED\u30B0\u30A4\u30F3\u306B\u623B\u308B",
    profile: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB",
    editProfile: "\u30D7\u30ED\u30D5\u30A3\u30FC\u30EB\u7DE8\u96C6",
    displayName: "\u8868\u793A\u540D",
    save: "\u4FDD\u5B58",
    signOut: "\u30B5\u30A4\u30F3\u30A2\u30A6\u30C8",
    sessions: "\u30A2\u30AF\u30C6\u30A3\u30D6\u30BB\u30C3\u30B7\u30E7\u30F3",
    emailCode: "\u30E1\u30FC\u30EB\u30B3\u30FC\u30C9\u3067\u7D9A\u884C",
    enterEmail: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9\u3092\u5165\u529B",
    sendMagicLink: "\u30DE\u30B8\u30C3\u30AF\u30EA\u30F3\u30AF\u3092\u9001\u4FE1",
    sendCode: "\u30B3\u30FC\u30C9\u3092\u9001\u4FE1",
    sendingMagicLink: "\u30DE\u30B8\u30C3\u30AF\u30EA\u30F3\u30AF\u3092\u9001\u4FE1\u4E2D...",
    sendingCode: "\u30B3\u30FC\u30C9\u3092\u9001\u4FE1\u4E2D...",
    magicLinkSent: "\u30DE\u30B8\u30C3\u30AF\u30EA\u30F3\u30AF\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F",
    checkInbox: "\u30E1\u30FC\u30EB\u306E\u53D7\u4FE1\u30C8\u30EC\u30A4\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044",
    enterCode: "\u8A8D\u8A3C\u30B3\u30FC\u30C9\u3092\u5165\u529B",
    codeSentTo: "{email} \u306B6\u6841\u306E\u30B3\u30FC\u30C9\u3092\u9001\u4FE1\u3057\u307E\u3057\u305F",
    cancel: "\u30AD\u30E3\u30F3\u30BB\u30EB",
    magicLinkConfirmTitle: "\u3053\u306E\u30A2\u30AB\u30A6\u30F3\u30C8\u3067\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u304B\uFF1F",
    magicLinkConfirmBody: "{email} \u3068\u3057\u3066\u30ED\u30B0\u30A4\u30F3\u3057\u307E\u3059\u3002\u3053\u306E\u30DE\u30B8\u30C3\u30AF\u30EA\u30F3\u30AF\u3092\u30EA\u30AF\u30A8\u30B9\u30C8\u3057\u3066\u3044\u306A\u3044\u5834\u5408\u306F\u3001\u30AD\u30E3\u30F3\u30BB\u30EB\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
    magicLinkConfirmButton: "\u30ED\u30B0\u30A4\u30F3"
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
    backToSignIn: "\u8FD4\u56DE\u767B\u5F55",
    profile: "\u4E2A\u4EBA\u8D44\u6599",
    editProfile: "\u7F16\u8F91\u8D44\u6599",
    displayName: "\u663E\u793A\u540D\u79F0",
    save: "\u4FDD\u5B58",
    signOut: "\u9000\u51FA\u767B\u5F55",
    sessions: "\u6D3B\u8DC3\u4F1A\u8BDD",
    emailCode: "\u4F7F\u7528\u90AE\u7BB1\u9A8C\u8BC1\u7801\u7EE7\u7EED",
    enterEmail: "\u8BF7\u8F93\u5165\u90AE\u7BB1",
    sendMagicLink: "\u53D1\u9001\u9B54\u6CD5\u94FE\u63A5",
    sendCode: "\u53D1\u9001\u9A8C\u8BC1\u7801",
    sendingMagicLink: "\u6B63\u5728\u53D1\u9001\u9B54\u6CD5\u94FE\u63A5...",
    sendingCode: "\u6B63\u5728\u53D1\u9001\u9A8C\u8BC1\u7801...",
    magicLinkSent: "\u9B54\u6CD5\u94FE\u63A5\u5DF2\u53D1\u9001\uFF01",
    checkInbox: "\u8BF7\u67E5\u770B\u90AE\u7BB1\u6536\u4EF6\u7BB1",
    enterCode: "\u8F93\u5165\u9A8C\u8BC1\u7801",
    codeSentTo: "6 \u4F4D\u9A8C\u8BC1\u7801\u5DF2\u53D1\u9001\u81F3 {email}",
    cancel: "\u53D6\u6D88",
    magicLinkConfirmTitle: "\u8981\u4F7F\u7528\u6B64\u8D26\u53F7\u767B\u5F55\u5417\uFF1F",
    magicLinkConfirmBody: "\u5C06\u4EE5 {email} \u7684\u8EAB\u4EFD\u767B\u5F55\u3002\u5982\u679C\u5E76\u975E\u672C\u4EBA\u8BF7\u6C42\u6B64\u9B54\u6CD5\u94FE\u63A5\uFF0C\u8BF7\u53D6\u6D88\u3002",
    magicLinkConfirmButton: "\u767B\u5F55"
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
    backToSignIn: "\u8FD4\u56DE\u767B\u5165",
    profile: "\u500B\u4EBA\u8CC7\u6599",
    editProfile: "\u7DE8\u8F2F\u8CC7\u6599",
    displayName: "\u986F\u793A\u540D\u7A31",
    save: "\u5132\u5B58",
    signOut: "\u767B\u51FA",
    sessions: "\u6D3B\u8E8D\u5DE5\u4F5C\u968E\u6BB5",
    emailCode: "\u4F7F\u7528\u96FB\u5B50\u90F5\u4EF6\u9A57\u8B49\u78BC\u7E7C\u7E8C",
    enterEmail: "\u8ACB\u8F38\u5165\u96FB\u5B50\u90F5\u4EF6",
    sendMagicLink: "\u50B3\u9001\u9B54\u6CD5\u9023\u7D50",
    sendCode: "\u50B3\u9001\u9A57\u8B49\u78BC",
    sendingMagicLink: "\u6B63\u5728\u50B3\u9001\u9B54\u6CD5\u9023\u7D50...",
    sendingCode: "\u6B63\u5728\u50B3\u9001\u9A57\u8B49\u78BC...",
    magicLinkSent: "\u9B54\u6CD5\u9023\u7D50\u5DF2\u50B3\u9001\uFF01",
    checkInbox: "\u8ACB\u67E5\u770B\u96FB\u5B50\u90F5\u4EF6\u6536\u4EF6\u5323",
    enterCode: "\u8F38\u5165\u9A57\u8B49\u78BC",
    codeSentTo: "6 \u4F4D\u6578\u9A57\u8B49\u78BC\u5DF2\u50B3\u9001\u81F3 {email}",
    cancel: "\u53D6\u6D88",
    magicLinkConfirmTitle: "\u8981\u4F7F\u7528\u6B64\u5E33\u865F\u767B\u5165\u55CE\uFF1F",
    magicLinkConfirmBody: "\u5C07\u4EE5 {email} \u7684\u8EAB\u5206\u767B\u5165\u3002\u82E5\u4E26\u975E\u672C\u4EBA\u8ACB\u6C42\u6B64\u9B54\u6CD5\u9023\u7D50\uFF0C\u8ACB\u53D6\u6D88\u3002",
    magicLinkConfirmButton: "\u767B\u5165"
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
    backToSignIn: "Voltar ao login",
    profile: "Perfil",
    editProfile: "Editar perfil",
    displayName: "Nome de exibicao",
    save: "Salvar",
    signOut: "Sair",
    sessions: "Sessoes ativas",
    emailCode: "Continuar com codigo por e-mail",
    enterEmail: "Digite seu e-mail",
    sendMagicLink: "Enviar Magic Link",
    sendCode: "Enviar codigo",
    sendingMagicLink: "Enviando magic link...",
    sendingCode: "Enviando codigo...",
    magicLinkSent: "Magic link enviado!",
    checkInbox: "Verifique sua caixa de entrada",
    enterCode: "Digite o codigo de verificacao",
    codeSentTo: "Codigo de 6 digitos enviado para {email}",
    cancel: "Cancelar",
    magicLinkConfirmTitle: "Entrar com esta conta?",
    magicLinkConfirmBody: "Voce entrara como {email}. Cancele se nao foi voce quem solicitou este Magic Link.",
    magicLinkConfirmButton: "Entrar"
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
    backToSignIn: "Volver al inicio de sesion",
    profile: "Perfil",
    editProfile: "Editar perfil",
    displayName: "Nombre de visualizacion",
    save: "Guardar",
    signOut: "Cerrar sesion",
    sessions: "Sesiones activas",
    emailCode: "Continuar con codigo por correo",
    enterEmail: "Introduce tu correo electronico",
    sendMagicLink: "Enviar Magic Link",
    sendCode: "Enviar codigo",
    sendingMagicLink: "Enviando magic link...",
    sendingCode: "Enviando codigo...",
    magicLinkSent: "Magic link enviado!",
    checkInbox: "Revisa tu bandeja de entrada",
    enterCode: "Introduce el codigo de verificacion",
    codeSentTo: "Codigo de 6 digitos enviado a {email}",
    cancel: "Cancelar",
    magicLinkConfirmTitle: "Iniciar sesion con esta cuenta?",
    magicLinkConfirmBody: "Iniciaras sesion como {email}. Cancela si no solicitaste este Magic Link.",
    magicLinkConfirmButton: "Iniciar sesion"
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
    backToSignIn: "Zuruck zur Anmeldung",
    profile: "Profil",
    editProfile: "Profil bearbeiten",
    displayName: "Anzeigename",
    save: "Speichern",
    signOut: "Abmelden",
    sessions: "Aktive Sitzungen",
    emailCode: "Weiter mit E-Mail-Code",
    enterEmail: "E-Mail-Adresse eingeben",
    sendMagicLink: "Magic Link senden",
    sendCode: "Code senden",
    sendingMagicLink: "Magic Link wird gesendet...",
    sendingCode: "Code wird gesendet...",
    magicLinkSent: "Magic Link gesendet!",
    checkInbox: "Prufe dein E-Mail-Postfach",
    enterCode: "Bestatigungscode eingeben",
    codeSentTo: "6-stelliger Code an {email} gesendet",
    cancel: "Abbrechen",
    magicLinkConfirmTitle: "Mit diesem Konto anmelden?",
    magicLinkConfirmBody: "Sie werden als {email} angemeldet. Brechen Sie ab, wenn Sie diesen Magic Link nicht angefordert haben.",
    magicLinkConfirmButton: "Anmelden"
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
    backToSignIn: "Retour a la connexion",
    profile: "Profil",
    editProfile: "Modifier le profil",
    displayName: "Nom d'affichage",
    save: "Enregistrer",
    signOut: "Se deconnecter",
    sessions: "Sessions actives",
    emailCode: "Continuer avec un code par e-mail",
    enterEmail: "Saisissez votre e-mail",
    sendMagicLink: "Envoyer le Magic Link",
    sendCode: "Envoyer le code",
    sendingMagicLink: "Envoi du magic link...",
    sendingCode: "Envoi du code...",
    magicLinkSent: "Magic link envoye !",
    checkInbox: "Verifiez votre boite de reception",
    enterCode: "Saisissez le code de verification",
    codeSentTo: "Code a 6 chiffres envoye a {email}",
    cancel: "Annuler",
    magicLinkConfirmTitle: "Se connecter avec ce compte ?",
    magicLinkConfirmBody: "Vous serez connecte en tant que {email}. Annulez si ce Magic Link ne vient pas de vous.",
    magicLinkConfirmButton: "Se connecter"
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
    backToSignIn: "\u0938\u093E\u0907\u0928 \u0907\u0928 \u092A\u0930 \u0935\u093E\u092A\u0938 \u091C\u093E\u090F\u0902",
    profile: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932",
    editProfile: "\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932 \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902",
    displayName: "\u092A\u094D\u0930\u0926\u0930\u094D\u0936\u0928 \u0928\u093E\u092E",
    save: "\u0938\u0939\u0947\u091C\u0947\u0902",
    signOut: "\u0938\u093E\u0907\u0928 \u0906\u0909\u091F",
    sessions: "\u0938\u0915\u094D\u0930\u093F\u092F \u0938\u0924\u094D\u0930",
    emailCode: "\u0908\u092E\u0947\u0932 \u0915\u094B\u0921 \u0938\u0947 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902",
    enterEmail: "\u0905\u092A\u0928\u093E \u0908\u092E\u0947\u0932 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    sendMagicLink: "\u092E\u0948\u091C\u093F\u0915 \u0932\u093F\u0902\u0915 \u092D\u0947\u091C\u0947\u0902",
    sendCode: "\u0915\u094B\u0921 \u092D\u0947\u091C\u0947\u0902",
    sendingMagicLink: "\u092E\u0948\u091C\u093F\u0915 \u0932\u093F\u0902\u0915 \u092D\u0947\u091C\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948...",
    sendingCode: "\u0915\u094B\u0921 \u092D\u0947\u091C\u093E \u091C\u093E \u0930\u0939\u093E \u0939\u0948...",
    magicLinkSent: "\u092E\u0948\u091C\u093F\u0915 \u0932\u093F\u0902\u0915 \u092D\u0947\u091C \u0926\u093F\u092F\u093E \u0917\u092F\u093E!",
    checkInbox: "\u0905\u092A\u0928\u093E \u0908\u092E\u0947\u0932 \u0907\u0928\u092C\u0949\u0915\u094D\u0938 \u0926\u0947\u0916\u0947\u0902",
    enterCode: "\u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u094B\u0921 \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902",
    codeSentTo: "{email} \u092A\u0930 6 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0915\u094B\u0921 \u092D\u0947\u091C\u093E \u0917\u092F\u093E",
    cancel: "\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902",
    magicLinkConfirmTitle: "\u0915\u094D\u092F\u093E \u0907\u0938 \u0916\u093E\u0924\u0947 \u0938\u0947 \u0938\u093E\u0907\u0928 \u0907\u0928 \u0915\u0930\u0947\u0902?",
    magicLinkConfirmBody: "\u0906\u092A {email} \u0915\u0947 \u0930\u0942\u092A \u092E\u0947\u0902 \u0938\u093E\u0907\u0928 \u0907\u0928 \u0939\u094B\u0902\u0917\u0947\u0964 \u0905\u0917\u0930 \u0906\u092A\u0928\u0947 \u092F\u0939 \u092E\u0948\u091C\u093F\u0915 \u0932\u093F\u0902\u0915 \u0928\u0939\u0940\u0902 \u092E\u0901\u0917\u093E\u092F\u093E \u0939\u0948, \u0924\u094B \u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902\u0964",
    magicLinkConfirmButton: "\u0938\u093E\u0907\u0928 \u0907\u0928"
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
    backToSignIn: "Girise don",
    profile: "Profil",
    editProfile: "Profili duzenle",
    displayName: "Goruntu adi",
    save: "Kaydet",
    signOut: "Cikis yap",
    sessions: "Aktif oturumlar",
    emailCode: "E-posta kodu ile devam et",
    enterEmail: "E-posta adresinizi girin",
    sendMagicLink: "Magic Link gonder",
    sendCode: "Kod gonder",
    sendingMagicLink: "Magic Link gonderiliyor...",
    sendingCode: "Kod gonderiliyor...",
    magicLinkSent: "Magic Link gonderildi!",
    checkInbox: "E-posta kutunuzu kontrol edin",
    enterCode: "Dogrulama kodunu girin",
    codeSentTo: "{email} adresine 6 haneli kod gonderildi",
    cancel: "Iptal",
    magicLinkConfirmTitle: "Bu hesapla giris yapilsin mi?",
    magicLinkConfirmBody: "{email} olarak giris yapacaksiniz. Bu Magic Link istegini siz yapmadiysaniz iptal edin.",
    magicLinkConfirmButton: "Giris yap"
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
    backToSignIn: "Kembali ke login",
    profile: "Profil",
    editProfile: "Edit profil",
    displayName: "Nama tampilan",
    save: "Simpan",
    signOut: "Keluar",
    sessions: "Sesi aktif",
    emailCode: "Lanjutkan dengan kode email",
    enterEmail: "Masukkan email Anda",
    sendMagicLink: "Kirim Magic Link",
    sendCode: "Kirim kode",
    sendingMagicLink: "Mengirim magic link...",
    sendingCode: "Mengirim kode...",
    magicLinkSent: "Magic link terkirim!",
    checkInbox: "Periksa kotak masuk email Anda",
    enterCode: "Masukkan kode verifikasi",
    codeSentTo: "Kode 6 digit dikirim ke {email}",
    cancel: "Batal",
    magicLinkConfirmTitle: "Masuk dengan akun ini?",
    magicLinkConfirmBody: "Anda akan masuk sebagai {email}. Pilih Batal jika Anda tidak meminta Magic link ini.",
    magicLinkConfirmButton: "Masuk"
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
    backToSignIn: "Quay lai dang nhap",
    profile: "Ho so",
    editProfile: "Chinh sua ho so",
    displayName: "Ten hien thi",
    save: "Luu",
    signOut: "Dang xuat",
    sessions: "Phien dang nhap hoat dong",
    emailCode: "Tiep tuc voi ma qua email",
    enterEmail: "Nhap email cua ban",
    sendMagicLink: "Gui Magic Link",
    sendCode: "Gui ma",
    sendingMagicLink: "Dang gui magic link...",
    sendingCode: "Dang gui ma...",
    magicLinkSent: "Da gui magic link!",
    checkInbox: "Kiem tra hop thu email cua ban",
    enterCode: "Nhap ma xac minh",
    codeSentTo: "Ma 6 chu so da gui den {email}",
    cancel: "Huy",
    magicLinkConfirmTitle: "Dang nhap bang tai khoan nay?",
    magicLinkConfirmBody: "Ban se dang nhap voi tu cach {email}. Hay chon Huy neu ban khong yeu cau magic link nay.",
    magicLinkConfirmButton: "Dang nhap"
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
    backToSignIn: "\u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",
    profile: "\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C",
    editProfile: "\u0E41\u0E01\u0E49\u0E44\u0E02\u0E42\u0E1B\u0E23\u0E44\u0E1F\u0E25\u0E4C",
    displayName: "\u0E0A\u0E37\u0E48\u0E2D\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07",
    save: "\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01",
    signOut: "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",
    sessions: "\u0E40\u0E0B\u0E2A\u0E0A\u0E31\u0E19\u0E17\u0E35\u0E48\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E2D\u0E22\u0E39\u0E48",
    emailCode: "\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E15\u0E48\u0E2D\u0E14\u0E49\u0E27\u0E22\u0E23\u0E2B\u0E31\u0E2A\u0E17\u0E32\u0E07\u0E2D\u0E35\u0E40\u0E21\u0E25",
    enterEmail: "\u0E01\u0E23\u0E2D\u0E01\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13",
    sendMagicLink: "\u0E2A\u0E48\u0E07 Magic Link",
    sendCode: "\u0E2A\u0E48\u0E07\u0E23\u0E2B\u0E31\u0E2A",
    sendingMagicLink: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2A\u0E48\u0E07 Magic Link...",
    sendingCode: "\u0E01\u0E33\u0E25\u0E31\u0E07\u0E2A\u0E48\u0E07\u0E23\u0E2B\u0E31\u0E2A...",
    magicLinkSent: "\u0E2A\u0E48\u0E07 Magic Link \u0E41\u0E25\u0E49\u0E27!",
    checkInbox: "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E01\u0E25\u0E48\u0E2D\u0E07\u0E08\u0E14\u0E2B\u0E21\u0E32\u0E22\u0E2D\u0E35\u0E40\u0E21\u0E25\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13",
    enterCode: "\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19",
    codeSentTo: "\u0E2A\u0E48\u0E07\u0E23\u0E2B\u0E31\u0E2A 6 \u0E2B\u0E25\u0E31\u0E01\u0E44\u0E1B\u0E17\u0E35\u0E48 {email} \u0E41\u0E25\u0E49\u0E27",
    cancel: "\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01",
    magicLinkConfirmTitle: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E14\u0E49\u0E27\u0E22\u0E1A\u0E31\u0E0D\u0E0A\u0E35\u0E19\u0E35\u0E49\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48?",
    magicLinkConfirmBody: "\u0E04\u0E38\u0E13\u0E08\u0E30\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A\u0E43\u0E19\u0E0A\u0E37\u0E48\u0E2D {email} \u0E2B\u0E32\u0E01\u0E04\u0E38\u0E13\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E02\u0E2D Magic Link \u0E19\u0E35\u0E49 \u0E43\u0E2B\u0E49\u0E01\u0E14\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01",
    magicLinkConfirmButton: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A"
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
    backToSignIn: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0432\u0445\u043E\u0434\u0443",
    profile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
    editProfile: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u0444\u0438\u043B\u044C",
    displayName: "\u041E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0435\u043C\u043E\u0435 \u0438\u043C\u044F",
    save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
    signOut: "\u0412\u044B\u0439\u0442\u0438",
    sessions: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0435\u0430\u043D\u0441\u044B",
    emailCode: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 \u043A\u043E\u0434\u043E\u043C \u0438\u0437 \u043F\u0438\u0441\u044C\u043C\u0430",
    enterEmail: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0439 \u043F\u043E\u0447\u0442\u044B",
    sendMagicLink: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C Magic Link",
    sendCode: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u043A\u043E\u0434",
    sendingMagicLink: "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 Magic Link...",
    sendingCode: "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430 \u043A\u043E\u0434\u0430...",
    magicLinkSent: "Magic Link \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D!",
    checkInbox: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0432\u0445\u043E\u0434\u044F\u0449\u0438\u0435 \u043F\u0438\u0441\u044C\u043C\u0430",
    enterCode: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F",
    codeSentTo: "6-\u0437\u043D\u0430\u0447\u043D\u044B\u0439 \u043A\u043E\u0434 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D \u043D\u0430 {email}",
    cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
    magicLinkConfirmTitle: "\u0412\u043E\u0439\u0442\u0438 \u0441 \u044D\u0442\u043E\u0439 \u0443\u0447\u0435\u0442\u043D\u043E\u0439 \u0437\u0430\u043F\u0438\u0441\u044C\u044E?",
    magicLinkConfirmBody: "\u0412\u044B \u0432\u043E\u0439\u0434\u0435\u0442\u0435 \u043A\u0430\u043A {email}. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041E\u0442\u043C\u0435\u043D\u0430\xBB, \u0435\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u043B\u0438 \u044D\u0442\u043E\u0442 Magic Link.",
    magicLinkConfirmButton: "\u0412\u043E\u0439\u0442\u0438"
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
    backToSignIn: "Torna all'accesso",
    profile: "Profilo",
    editProfile: "Modifica profilo",
    displayName: "Nome visualizzato",
    save: "Salva",
    signOut: "Esci",
    sessions: "Sessioni attive",
    emailCode: "Continua con codice via email",
    enterEmail: "Inserisci la tua email",
    sendMagicLink: "Invia Magic Link",
    sendCode: "Invia codice",
    sendingMagicLink: "Invio del magic link...",
    sendingCode: "Invio del codice...",
    magicLinkSent: "Magic link inviato!",
    checkInbox: "Controlla la tua casella email",
    enterCode: "Inserisci il codice di verifica",
    codeSentTo: "Codice a 6 cifre inviato a {email}",
    cancel: "Annulla",
    magicLinkConfirmTitle: "Accedere con questo account?",
    magicLinkConfirmBody: "Accederai come {email}. Annulla se non hai richiesto questo Magic link.",
    magicLinkConfirmButton: "Accedi"
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
    backToSignIn: "Powrot do logowania",
    profile: "Profil",
    editProfile: "Edytuj profil",
    displayName: "Nazwa wyswietlana",
    save: "Zapisz",
    signOut: "Wyloguj sie",
    sessions: "Aktywne sesje",
    emailCode: "Kontynuuj z kodem e-mail",
    enterEmail: "Wpisz swoj e-mail",
    sendMagicLink: "Wyslij Magic Link",
    sendCode: "Wyslij kod",
    sendingMagicLink: "Wysylanie magic linku...",
    sendingCode: "Wysylanie kodu...",
    magicLinkSent: "Magic Link wyslany!",
    checkInbox: "Sprawdz swoja skrzynke e-mail",
    enterCode: "Wpisz kod weryfikacyjny",
    codeSentTo: "6-cyfrowy kod wyslano na {email}",
    cancel: "Anuluj",
    magicLinkConfirmTitle: "Zalogowac sie na to konto?",
    magicLinkConfirmBody: "Zostaniesz zalogowany jako {email}. Anuluj, jesli nie prosiles o ten Magic Link.",
    magicLinkConfirmButton: "Zaloguj sie"
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
    backToSignIn: "Terug naar inloggen",
    profile: "Profiel",
    editProfile: "Profiel bewerken",
    displayName: "Weergavenaam",
    save: "Opslaan",
    signOut: "Uitloggen",
    sessions: "Actieve sessies",
    emailCode: "Doorgaan met e-mailcode",
    enterEmail: "Voer je e-mailadres in",
    sendMagicLink: "Magic Link versturen",
    sendCode: "Code versturen",
    sendingMagicLink: "Magic Link wordt verstuurd...",
    sendingCode: "Code wordt verstuurd...",
    magicLinkSent: "Magic Link verstuurd!",
    checkInbox: "Controleer je e-mailinbox",
    enterCode: "Voer de verificatiecode in",
    codeSentTo: "Code van 6 cijfers verstuurd naar {email}",
    cancel: "Annuleren",
    magicLinkConfirmTitle: "Inloggen met dit account?",
    magicLinkConfirmBody: "Je wordt ingelogd als {email}. Annuleer als je deze Magic Link niet hebt aangevraagd.",
    magicLinkConfirmButton: "Inloggen"
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
    backToSignIn: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644",
    profile: "\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A",
    editProfile: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A",
    displayName: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u0639\u0631\u0648\u0636",
    save: "\u062D\u0641\u0638",
    signOut: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C",
    sessions: "\u0627\u0644\u062C\u0644\u0633\u0627\u062A \u0627\u0644\u0646\u0634\u0637\u0629",
    emailCode: "\u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0631\u0645\u0632 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    enterEmail: "\u0623\u062F\u062E\u0644 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    sendMagicLink: "\u0625\u0631\u0633\u0627\u0644 Magic Link",
    sendCode: "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632",
    sendingMagicLink: "\u062C\u0627\u0631\u064D \u0625\u0631\u0633\u0627\u0644 Magic Link...",
    sendingCode: "\u062C\u0627\u0631\u064D \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632...",
    magicLinkSent: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 Magic Link!",
    checkInbox: "\u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u0646\u062F\u0648\u0642 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
    enterCode: "\u0623\u062F\u062E\u0644 \u0631\u0645\u0632 \u0627\u0644\u062A\u062D\u0642\u0642",
    codeSentTo: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0625\u0644\u0649 {email}",
    cancel: "\u0625\u0644\u063A\u0627\u0621",
    magicLinkConfirmTitle: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628\u061F",
    magicLinkConfirmBody: "\u0633\u064A\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644\u0643 \u0628\u0627\u0633\u0645 {email}. \u0623\u0644\u063A\u0650 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0625\u0630\u0627 \u0644\u0645 \u062A\u0637\u0644\u0628 Magic Link \u0647\u0630\u0627.",
    magicLinkConfirmButton: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644"
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
    backToSignIn: "Tillbaka till inloggning",
    profile: "Profil",
    editProfile: "Redigera profil",
    displayName: "Visningsnamn",
    save: "Spara",
    signOut: "Logga ut",
    sessions: "Aktiva sessioner",
    emailCode: "Fortsatt med e-postkod",
    enterEmail: "Ange din e-post",
    sendMagicLink: "Skicka Magic Link",
    sendCode: "Skicka kod",
    sendingMagicLink: "Skickar magic link...",
    sendingCode: "Skickar kod...",
    magicLinkSent: "Magic link skickad!",
    checkInbox: "Kontrollera din inkorg",
    enterCode: "Ange verifieringskod",
    codeSentTo: "6-siffrig kod skickad till {email}",
    cancel: "Avbryt",
    magicLinkConfirmTitle: "Logga in med det har kontot?",
    magicLinkConfirmBody: "Du loggas in som {email}. Avbryt om du inte har begart denna Magic link.",
    magicLinkConfirmButton: "Logga in"
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
    backToSignIn: "\u041F\u043E\u0432\u0435\u0440\u043D\u0443\u0442\u0438\u0441\u044F \u0434\u043E \u0432\u0445\u043E\u0434\u0443",
    profile: "\u041F\u0440\u043E\u0444\u0456\u043B\u044C",
    editProfile: "\u0420\u0435\u0434\u0430\u0433\u0443\u0432\u0430\u0442\u0438 \u043F\u0440\u043E\u0444\u0456\u043B\u044C",
    displayName: "\u0412\u0456\u0434\u043E\u0431\u0440\u0430\u0436\u0443\u0432\u0430\u043D\u0435 \u0456\u043C'\u044F",
    save: "\u0417\u0431\u0435\u0440\u0435\u0433\u0442\u0438",
    signOut: "\u0412\u0438\u0439\u0442\u0438",
    sessions: "\u0410\u043A\u0442\u0438\u0432\u043D\u0456 \u0441\u0435\u0430\u043D\u0441\u0438",
    emailCode: "\u041F\u0440\u043E\u0434\u043E\u0432\u0436\u0438\u0442\u0438 \u0437 \u043A\u043E\u0434\u043E\u043C \u0437 \u043B\u0438\u0441\u0442\u0430",
    enterEmail: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u0443 \u043F\u043E\u0448\u0442\u0443",
    sendMagicLink: "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438 Magic Link",
    sendCode: "\u041D\u0430\u0434\u0456\u0441\u043B\u0430\u0442\u0438 \u043A\u043E\u0434",
    sendingMagicLink: "\u041D\u0430\u0434\u0441\u0438\u043B\u0430\u043D\u043D\u044F Magic Link...",
    sendingCode: "\u041D\u0430\u0434\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u043A\u043E\u0434\u0443...",
    magicLinkSent: "Magic Link \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E!",
    checkInbox: "\u041F\u0435\u0440\u0435\u0432\u0456\u0440\u0442\u0435 \u0432\u0445\u0456\u0434\u043D\u0456 \u043B\u0438\u0441\u0442\u0438",
    enterCode: "\u0412\u0432\u0435\u0434\u0456\u0442\u044C \u043A\u043E\u0434 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F",
    codeSentTo: "6-\u0437\u043D\u0430\u0447\u043D\u0438\u0439 \u043A\u043E\u0434 \u043D\u0430\u0434\u0456\u0441\u043B\u0430\u043D\u043E \u043D\u0430 {email}",
    cancel: "\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438",
    magicLinkConfirmTitle: "\u0423\u0432\u0456\u0439\u0442\u0438 \u0437 \u0446\u0438\u043C \u043E\u0431\u043B\u0456\u043A\u043E\u0432\u0438\u043C \u0437\u0430\u043F\u0438\u0441\u043E\u043C?",
    magicLinkConfirmBody: "\u0412\u0438 \u0443\u0432\u0456\u0439\u0434\u0435\u0442\u0435 \u044F\u043A {email}. \u041D\u0430\u0442\u0438\u0441\u043D\u0456\u0442\u044C \xAB\u0421\u043A\u0430\u0441\u0443\u0432\u0430\u0442\u0438\xBB, \u044F\u043A\u0449\u043E \u0432\u0438 \u043D\u0435 \u0437\u0430\u043F\u0438\u0442\u0443\u0432\u0430\u043B\u0438 \u0446\u0435\u0439 Magic Link.",
    magicLinkConfirmButton: "\u0423\u0432\u0456\u0439\u0442\u0438"
  }
};
var PROVIDER_FIRST = {
  "(\uC73C)\uB85C \uACC4\uC18D\uD558\uAE30": "",
  "\u3067\u7D9A\u884C": "",
  "\u0938\u0947 \u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902": " ",
  "ile devam et": " "
};
function formatContinueWith(t, providerName) {
  const joiner = PROVIDER_FIRST[t.continueWith];
  return joiner === void 0 ? `${t.continueWith} ${providerName}` : `${providerName}${joiner}${t.continueWith}`;
}
function getStrings(locale) {
  const en = translations.en;
  if (locale in translations) return { ...en, ...translations[locale] };
  const lang = locale.split("-")[0].split("_")[0];
  if (lang in translations) return { ...en, ...translations[lang] };
  return en;
}

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
function getProviderButtonConfig(provider, t) {
  const colors = PROVIDER_COLORS[provider];
  return {
    provider,
    label: t ? formatContinueWith(t, PROVIDER_DISPLAY_NAMES[provider]) : `Continue with ${PROVIDER_DISPLAY_NAMES[provider]}`,
    bgColor: colors.bg,
    textColor: colors.text,
    iconSvg: PROVIDER_ICONS[provider]
  };
}

// src/sanitize.ts
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function safeHttpUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2048) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}
var IMAGE_DATA_URL_RE = /^data:image\/(?:png|jpeg|gif|webp|svg\+xml)(?:;[a-z0-9-]+=[a-z0-9._-]+)*;base64,[a-z0-9+/]+={0,2}$/i;
var MAX_IMAGE_DATA_URL_LENGTH = 2 * 1024 * 1024;
function safeImageDataUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > MAX_IMAGE_DATA_URL_LENGTH) return null;
  return IMAGE_DATA_URL_RE.test(trimmed) ? trimmed : null;
}
function safeAvatarUrl(value) {
  return safeHttpUrl(value) ?? safeImageDataUrl(value);
}
var NUM = String.raw`[+-]?(?:\d{1,3}(?:\.\d+)?|\.\d+)`;
var PCT_OR_NUM = String.raw`${NUM}%?`;
var ALPHA = String.raw`(?:\s*(?:,|\/)\s*${PCT_OR_NUM})?`;
var SEP = String.raw`(?:\s*,\s*|\s+)`;
var COLOR_RES = [
  /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
  new RegExp(String.raw`^rgba?\(\s*${PCT_OR_NUM}${SEP}${PCT_OR_NUM}${SEP}${PCT_OR_NUM}${ALPHA}\s*\)$`, "i"),
  new RegExp(String.raw`^hsla?\(\s*${NUM}(?:deg)?${SEP}${NUM}%${SEP}${NUM}%${ALPHA}\s*\)$`, "i")
];
function isSafeColor(value) {
  if (typeof value !== "string" || value.length > 64) return false;
  const trimmed = value.trim();
  return COLOR_RES.some((re) => re.test(trimmed));
}
function safeColor(value, fallback) {
  return isSafeColor(value) ? value.trim() : fallback;
}
function colorWithAlpha(color, alpha) {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
}
function safeRadius(value, fallback = 12) {
  const n = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(64, Math.max(0, n));
}
var MAX_CUSTOM_CSS_LENGTH = 2e4;
function sanitizeCustomCss(value) {
  if (typeof value !== "string" || !value) return "";
  let css = value.slice(0, MAX_CUSTOM_CSS_LENGTH);
  let prev;
  do {
    prev = css;
    css = css.replace(/<\s*\/\s*style/gi, "").replace(/<!--|-->/g, "");
  } while (css !== prev);
  return css;
}

// src/modal.ts
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
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#666"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="12">${escapeHtml(id[0]?.toUpperCase() ?? "W")}</text></svg>`;
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
  magicLinkConfirmHandlers = null;
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
    this.applyCustomCss();
  }
  /** Project custom CSS lives in its own <style>, set via textContent so it cannot inject markup. */
  applyCustomCss() {
    if (!this.shadowRoot) return;
    const css = sanitizeCustomCss(this.branding.customCss);
    let el = this.shadowRoot.getElementById("authon-custom-style");
    if (!css) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement("style");
      el.id = "authon-custom-style";
      const themeStyle = this.shadowRoot.getElementById("authon-theme-style");
      if (themeStyle) themeStyle.after(el);
      else this.shadowRoot.prepend(el);
    }
    el.textContent = css;
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
    this.setSubmitLoading(false);
    const errorEl = this.shadowRoot.getElementById("email-form");
    if (errorEl) {
      const errDiv = document.createElement("div");
      errDiv.id = "authon-error-msg";
      errDiv.className = "error-msg";
      errDiv.textContent = message;
      errorEl.appendChild(errDiv);
    }
  }
  setSubmitLoading(loading) {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.querySelector(".submit-btn");
    if (!btn) return;
    if (loading) {
      btn.dataset.originalText = btn.textContent || "";
      btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:6px"><svg width="14" height="14" viewBox="0 0 14 14" style="animation:spin 0.8s linear infinite"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M7 2a5 5 0 0 1 5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>';
      btn.disabled = true;
      btn.style.opacity = "0.7";
    } else {
      btn.textContent = btn.dataset.originalText || "Continue";
      btn.disabled = false;
      btn.style.opacity = "1";
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
  showVerificationInput(email, onVerify, onResend) {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.querySelector(".modal-inner");
    if (!inner) return;
    inner.innerHTML = `
      <div style="text-align:center;padding:8px 0">
        <div style="width:48px;height:48px;border-radius:12px;background:color-mix(in srgb, var(--authon-primary-start) 15%, transparent);display:flex;align-items:center;justify-content:center;margin:0 auto 16px">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--authon-primary-start)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <h2 class="title" style="font-size:20px;margin-bottom:4px">${this.t.welcomeBack.includes("Welcome") ? "Check your email" : this.t.welcomeBack}</h2>
        <p style="font-size:13px;color:var(--authon-muted);margin-bottom:20px">${this.escapeHtml(email)}</p>
      </div>
      <div class="email-form" id="verify-form">
        <div id="verify-error" style="display:none;padding:8px 12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;font-size:13px;color:#ef4444;text-align:center;margin-bottom:4px"></div>
        <input type="text" id="verify-code" class="input" placeholder="000000" maxlength="6" inputmode="numeric" autocomplete="one-time-code" style="text-align:center;font-size:20px;letter-spacing:0.2em;font-family:ui-monospace,monospace" />
        <button type="button" id="verify-submit" class="submit-btn">${this.t.signIn}</button>
      </div>
      <p style="text-align:center;margin-top:12px;font-size:12px;color:var(--authon-dim)">
        <a href="#" id="resend-link" style="color:var(--authon-primary-start);text-decoration:none;font-weight:500">${this.t.backToSignIn.includes("Back") ? "Resend code" : this.t.backToSignIn}</a>
      </p>
    `;
    const codeInput = this.shadowRoot.getElementById("verify-code");
    const submitBtn = this.shadowRoot.getElementById("verify-submit");
    const resendLink = this.shadowRoot.getElementById("resend-link");
    codeInput?.focus();
    codeInput?.addEventListener("input", () => {
      codeInput.value = codeInput.value.replace(/\D/g, "").slice(0, 6);
    });
    const verifyError = this.shadowRoot.getElementById("verify-error");
    submitBtn?.addEventListener("click", async () => {
      const code = codeInput?.value?.trim();
      if (!code || code.length < 6) return;
      if (verifyError) {
        verifyError.style.display = "none";
      }
      submitBtn.textContent = "...";
      submitBtn.disabled = true;
      try {
        await onVerify(code);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (verifyError) {
          verifyError.textContent = msg || "Verification failed";
          verifyError.style.display = "block";
        }
        submitBtn.textContent = this.t.signIn;
        submitBtn.disabled = false;
        if (codeInput) {
          codeInput.value = "";
          codeInput.focus();
        }
      }
    });
    codeInput?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitBtn?.click();
    });
    resendLink?.addEventListener("click", async (e) => {
      e.preventDefault();
      resendLink.textContent = "...";
      await onResend();
      resendLink.textContent = "Sent!";
      setTimeout(() => {
        resendLink.textContent = "Resend code";
      }, 2e3);
    });
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
  /** Passwordless sign-in sends a 6-digit code instead of a link ('both' is the legacy code value). */
  usesEmailCode() {
    const method = this.branding?.passwordlessMethod;
    return method === "email_otp" || method === "both";
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
  /** Ask before using a magic link this browser did not request (login CSRF guard). */
  showMagicLinkConfirm(email, onConfirm, onCancel) {
    this.overlayEmail = email;
    this.overlayError = "";
    this.magicLinkConfirmHandlers = { onConfirm, onCancel };
    this.currentOverlay = "magic-link-confirm";
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
    this.applyCustomCss();
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
      const config = getProviderButtonConfig(p, this.t);
      const isWhiteBg = config.bgColor === "#ffffff";
      const btnBg = dark && isWhiteBg ? "#f8fafc" : config.bgColor;
      const btnBorder = isWhiteBg ? dark ? "#475569" : "#e5e7eb" : config.bgColor;
      return `<button class="provider-btn" data-provider="${escapeHtml(p)}" style="background:${btnBg};color:${config.textColor};border:1px solid ${btnBorder}">
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
        <span>${this.usesEmailCode() ? this.t.emailCode : this.t.magicLink}</span>
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
    const termsUrl = safeHttpUrl(b.termsUrl);
    const privacyUrl = safeHttpUrl(b.privacyUrl);
    const footer = termsUrl || privacyUrl ? `<div class="footer">
          ${termsUrl ? `<a href="${escapeHtml(termsUrl)}" target="_blank" rel="noopener noreferrer">Terms of Service</a>` : ""}
          ${termsUrl && privacyUrl ? " \xB7 " : ""}
          ${privacyUrl ? `<a href="${escapeHtml(privacyUrl)}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : ""}
        </div>` : "";
    const logoUrl = safeImageDataUrl(b.logoDataUrl);
    const titleHtml = isSignUp ? `<div class="title-row">
          <button class="back-btn" id="back-btn" type="button" aria-label="Back to sign in">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          </button>
          <h2 class="title">${title}</h2>
        </div>` : `<h2 class="title">${title}</h2>`;
    return `
      ${logoUrl ? `<img src="${escapeHtml(logoUrl)}" alt="Logo" class="logo" />` : ""}
      ${titleHtml}
      ${b.brandName ? `<p class="brand-name">${escapeHtml(b.brandName)}</p>` : ""}
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
    const bg = dark ? safeColor(b.darkBg, "#0f172a") : safeColor(b.lightBg, "#ffffff");
    const text = dark ? safeColor(b.darkText, "#f1f5f9") : safeColor(b.lightText, "#111827");
    const mutedText = dark ? "#94a3b8" : "#6b7280";
    const dimText = dark ? "#64748b" : "#9ca3af";
    const borderColor = dark ? "#334155" : "#d1d5db";
    const dividerColor = dark ? "#334155" : "#e5e7eb";
    const inputBg = dark ? "#1e293b" : "#ffffff";
    return `
      :host {
        --authon-primary-start: ${safeColor(b.primaryColorStart, "#7c3aed")};
        --authon-primary-end: ${safeColor(b.primaryColorEnd, "#4f46e5")};
        --authon-bg: ${bg};
        --authon-text: ${text};
        --authon-muted: ${mutedText};
        --authon-dim: ${dimText};
        --authon-border: ${borderColor};
        --authon-divider: ${dividerColor};
        --authon-input-bg: ${inputBg};
        --authon-overlay-bg: ${colorWithAlpha(bg, 0.92)};
        --authon-overlay-bg-solid: ${colorWithAlpha(bg, 0.97)};
        --authon-backdrop-bg: rgba(0,0,0,${dark ? "0.7" : "0.5"});
        --authon-shadow-opacity: ${dark ? "0.5" : "0.25"};
        --authon-radius: ${safeRadius(b.borderRadius)}px;
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
            <span>${escapeHtml(w.name)}</span>
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
          <div class="overlay-title">${this.t.enterEmail}</div>
          <div class="pwless-form">
            <input type="email" placeholder="you@example.com" class="input" id="pwless-email" autocomplete="email" />
            <button class="pwless-submit" id="pwless-submit-btn">${this.usesEmailCode() ? this.t.sendCode : this.t.sendMagicLink}</button>
          </div>
          ${errorHtml}
          <button class="cancel-link" id="overlay-cancel">${this.t.cancel}</button>
        `;
      }
      case "passwordless-sending": {
        return `
          <svg class="flow-spinner" width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" opacity="0.25"/>
            <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="var(--authon-primary-start, #7c3aed)" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="overlay-subtitle">${this.usesEmailCode() ? this.t.sendingCode : this.t.sendingMagicLink}</span>
        `;
      }
      case "magic-link-confirm": {
        return `
          <div class="overlay-title">${this.t.magicLinkConfirmTitle}</div>
          <span class="overlay-subtitle">${this.t.magicLinkConfirmBody.replace("{email}", () => this.escapeHtml(this.overlayEmail))}</span>
          ${errorHtml}
          <button class="pwless-submit" id="magic-link-confirm-btn">${this.t.magicLinkConfirmButton}</button>
          <button class="cancel-link" id="overlay-cancel">${this.t.cancel}</button>
        `;
      }
      case "passwordless-sent": {
        return `
          <div class="success-check" style="background:linear-gradient(135deg, var(--authon-primary-start, #7c3aed), var(--authon-primary-end, #4f46e5))">
            <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
              <path d="M5 10l3.5 3.5L15 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="overlay-title">${this.t.magicLinkSent}</div>
          <span class="overlay-subtitle">${this.t.checkInbox}</span>
        `;
      }
      case "otp-input": {
        const digitInputs = Array.from(
          { length: 6 },
          (_, i) => `<input type="text" inputmode="numeric" maxlength="1" class="otp-digit" data-idx="${i}" autocomplete="one-time-code" />`
        ).join("");
        return `
          <div class="otp-container">
            <div class="overlay-title">${this.t.enterCode}</div>
            <span class="overlay-subtitle">${this.t.codeSentTo.replace("{email}", () => this.escapeHtml(this.overlayEmail))}</span>
            <div class="otp-inputs">${digitInputs}</div>
            ${errorHtml}
            <button class="cancel-link" id="overlay-cancel">${this.t.cancel}</button>
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
      cancelBtn.addEventListener("click", () => {
        const confirmHandlers = this.currentOverlay === "magic-link-confirm" ? this.magicLinkConfirmHandlers : null;
        this.magicLinkConfirmHandlers = null;
        this.hideOverlay();
        confirmHandlers?.onCancel();
      });
    }
    const magicConfirmBtn = overlay.querySelector("#magic-link-confirm-btn");
    if (magicConfirmBtn) {
      magicConfirmBtn.addEventListener("click", () => {
        const handlers = this.magicLinkConfirmHandlers;
        this.magicLinkConfirmHandlers = null;
        handlers?.onConfirm();
      });
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
    return escapeHtml(str);
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
        this.setSubmitLoading(true);
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

// src/profile.ts
function formatRelativeTime(dateStr) {
  if (!dateStr) return "\u2014";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 6e4);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
function parseUserAgent(ua) {
  if (!ua) return "Unknown device";
  if (/iPhone|iPad/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Macintosh|Mac OS/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown device";
}
var ProfileRenderer = class {
  shadowRoot = null;
  hostElement = null;
  containerElement = null;
  containerId = null;
  mode;
  theme;
  branding;
  themeObserver = null;
  mediaQueryListener = null;
  t;
  user;
  sessions;
  isEditMode = false;
  onSave;
  onSignOut;
  onRevokeSession;
  onClose;
  escHandler = null;
  constructor(options) {
    this.mode = options.mode;
    this.theme = options.theme || "auto";
    this.branding = { ...DEFAULT_BRANDING, ...options.branding };
    this.t = getStrings(options.locale || "en");
    this.user = options.user;
    this.sessions = options.sessions || [];
    this.onSave = options.onSave;
    this.onSignOut = options.onSignOut;
    this.onRevokeSession = options.onRevokeSession;
    this.onClose = options.onClose;
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
  open() {
    this.resolveContainerElement();
    if (this.hostElement && !this.hostElement.isConnected) {
      this.hostElement = null;
      this.shadowRoot = null;
    }
    if (this.shadowRoot && this.hostElement) {
      this.rerender();
    } else {
      this.isEditMode = false;
      this.render();
    }
  }
  close() {
    this.stopThemeObserver();
    if (this.escHandler) {
      document.removeEventListener("keydown", this.escHandler);
      this.escHandler = null;
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
  }
  updateUser(user) {
    this.user = user;
    if (this.shadowRoot) this.rerender();
  }
  updateSessions(sessions) {
    this.sessions = sessions;
    if (this.shadowRoot) this.rerender();
  }
  setTheme(theme) {
    this.theme = theme;
    this.updateThemeCSS();
    if (theme === "auto") {
      this.startThemeObserver();
    } else {
      this.stopThemeObserver();
    }
  }
  showSaving() {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById("profile-save-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "...";
    }
  }
  showSaveError(message) {
    if (!this.shadowRoot) return;
    const btn = this.shadowRoot.getElementById("profile-save-btn");
    if (btn) {
      btn.disabled = false;
      btn.textContent = this.t.save;
    }
    this.showInlineError("profile-error", message);
  }
  showInlineError(id, message) {
    if (!this.shadowRoot) return;
    this.shadowRoot.getElementById(id)?.remove();
    const errEl = document.createElement("div");
    errEl.id = id;
    errEl.className = "error-msg";
    errEl.textContent = message;
    this.shadowRoot.querySelector(".profile-actions")?.appendChild(errEl);
  }
  updateThemeCSS() {
    if (!this.shadowRoot) return;
    const styleEl = this.shadowRoot.getElementById("authon-profile-theme-style");
    if (styleEl) styleEl.textContent = this.buildCSS();
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
  render() {
    const host = document.createElement("div");
    host.setAttribute("data-authon-profile", "");
    this.hostElement = host;
    if (this.mode === "popup") {
      document.body.appendChild(host);
    } else {
      const container = this.resolveContainerElement();
      if (!container) {
        this.hostElement = null;
        throw new Error(`Authon profile container "#${this.containerId}" not found`);
      }
      container.replaceChildren();
      container.appendChild(host);
    }
    this.shadowRoot = host.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = this.buildShell();
    this.attachEvents();
    if (this.mode === "popup") {
      this.escHandler = (e) => {
        if (e.key === "Escape") {
          this.onClose();
          this.close();
        }
      };
      document.addEventListener("keydown", this.escHandler);
    }
    if (this.theme === "auto") this.startThemeObserver();
  }
  rerender() {
    if (!this.shadowRoot) return;
    const inner = this.shadowRoot.getElementById("profile-inner");
    if (!inner) return;
    inner.style.opacity = "0";
    inner.style.transform = "translateY(-4px)";
    setTimeout(() => {
      inner.innerHTML = this.buildInnerContent();
      this.attachInnerEvents();
      void inner.offsetHeight;
      inner.style.opacity = "1";
      inner.style.transform = "translateY(0)";
    }, 120);
  }
  buildShell() {
    const popupWrapper = this.mode === "popup" ? `<div class="backdrop" id="profile-backdrop"></div>` : "";
    return `
      <style id="authon-profile-theme-style">${this.buildCSS()}</style>
      ${popupWrapper}
      <div class="profile-container" role="dialog" aria-modal="true" aria-label="${this.t.profile}">
        <div id="profile-inner" class="profile-inner">
          ${this.buildInnerContent()}
        </div>
      </div>
    `;
  }
  buildInnerContent() {
    const u = this.user;
    const initials = (u.displayName || u.email || "?").split(/\s+/).map((w) => w[0]?.toUpperCase() ?? "").slice(0, 2).join("");
    const avatarUrl = safeAvatarUrl(u.avatarUrl);
    const avatarHtml = avatarUrl ? `<img class="avatar-img" src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(u.displayName || "")}" />` : `<div class="avatar-placeholder">${escapeHtml(initials)}</div>`;
    const closeBtn = this.mode === "popup" ? `<button class="close-btn" id="profile-close-btn" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>` : "";
    if (this.isEditMode) {
      return this.buildEditContent(avatarHtml, closeBtn);
    }
    return this.buildViewContent(avatarHtml, closeBtn, u);
  }
  buildViewContent(avatarHtml, closeBtn, u) {
    const sessionsHtml = this.sessions.length > 0 ? `<div class="section">
          <div class="section-label">${this.t.sessions}</div>
          <div class="sessions-list">
            ${this.sessions.map((s) => `
              <div class="session-item" data-session-id="${escapeHtml(s.id)}">
                <div class="session-info">
                  <span class="session-device">${escapeHtml(parseUserAgent(s.userAgent))}</span>
                  <span class="session-meta">${escapeHtml(s.ipAddress || "")} &middot; ${escapeHtml(formatRelativeTime(s.lastActiveAt))}</span>
                </div>
                <button class="session-revoke-btn" data-session-id="${escapeHtml(s.id)}" aria-label="Revoke session">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            `).join("")}
          </div>
        </div>` : "";
    return `
      <div class="profile-header">
        <div class="avatar-wrap">${avatarHtml}</div>
        <div class="header-text">
          <div class="display-name">${escapeHtml(u.displayName || "\u2014")}</div>
          <div class="email">${escapeHtml(u.email || "\u2014")}</div>
        </div>
        ${closeBtn}
      </div>

      <div class="section">
        <div class="field-row">
          <span class="field-label">${this.t.emailAddress}</span>
          <span class="field-value readonly">${escapeHtml(u.email || "\u2014")}</span>
        </div>
        <div class="field-row">
          <span class="field-label">${this.t.displayName}</span>
          <span class="field-value">${escapeHtml(u.displayName || "\u2014")}</span>
        </div>
      </div>

      ${sessionsHtml}

      <div class="profile-actions">
        <button class="edit-btn" id="profile-edit-btn">${this.t.editProfile}</button>
        <button class="signout-btn" id="profile-signout-btn">${this.t.signOut}</button>
      </div>
    `;
  }
  buildEditContent(avatarHtml, closeBtn) {
    const u = this.user;
    return `
      <div class="profile-header">
        <div class="avatar-wrap">${avatarHtml}</div>
        <div class="header-text">
          <div class="display-name">${this.t.editProfile}</div>
          <div class="email">${escapeHtml(u.email || "\u2014")}</div>
        </div>
        ${closeBtn}
      </div>

      <div class="section">
        <div class="field-group">
          <label class="field-label" for="profile-displayname-input">${this.t.displayName}</label>
          <input
            id="profile-displayname-input"
            class="input"
            type="text"
            value="${escapeHtml(u.displayName || "")}"
            placeholder="${this.t.displayName}"
            autocomplete="name"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="profile-avatar-input">Avatar URL</label>
          <input
            id="profile-avatar-input"
            class="input"
            type="url"
            value="${escapeHtml(u.avatarUrl || "")}"
            placeholder="https://..."
            autocomplete="off"
          />
        </div>
        <div class="field-group">
          <label class="field-label">${this.t.emailAddress}</label>
          <input class="input readonly" type="email" value="${escapeHtml(u.email || "")}" disabled />
        </div>
      </div>

      <div class="profile-actions">
        <button class="save-btn" id="profile-save-btn">${this.t.save}</button>
        <button class="cancel-btn" id="profile-cancel-btn">Cancel</button>
      </div>
    `;
  }
  buildCSS() {
    const b = this.branding;
    const dark = this.isDark();
    const bg = dark ? safeColor(b.darkBg, "#0f172a") : safeColor(b.lightBg, "#ffffff");
    const text = dark ? safeColor(b.darkText, "#f1f5f9") : safeColor(b.lightText, "#111827");
    const primaryStart = safeColor(b.primaryColorStart, "#7c3aed");
    const mutedText = dark ? "#94a3b8" : "#6b7280";
    const dimText = dark ? "#64748b" : "#9ca3af";
    const borderColor = dark ? "#334155" : "#d1d5db";
    const dividerColor = dark ? "#334155" : "#e5e7eb";
    const inputBg = dark ? "#1e293b" : "#ffffff";
    const sectionBg = dark ? "#1e293b" : "#f9fafb";
    const sessionItemBg = dark ? "#263148" : "#f3f4f6";
    return `
      :host {
        --authon-primary-start: ${primaryStart};
        --authon-primary-end: ${safeColor(b.primaryColorEnd, "#4f46e5")};
        --authon-bg: ${bg};
        --authon-text: ${text};
        --authon-muted: ${mutedText};
        --authon-dim: ${dimText};
        --authon-border: ${borderColor};
        --authon-divider: ${dividerColor};
        --authon-input-bg: ${inputBg};
        --authon-section-bg: ${sectionBg};
        --authon-session-bg: ${sessionItemBg};
        --authon-backdrop-bg: rgba(0,0,0,${dark ? "0.7" : "0.5"});
        --authon-radius: ${safeRadius(b.borderRadius)}px;
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

      .profile-container {
        ${this.mode === "popup" ? "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 99999; max-height: 90vh; overflow-y: auto;" : ""}
        background: var(--authon-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: var(--authon-radius);
        padding: 24px;
        width: 380px; max-width: 100%;
        ${this.mode === "popup" ? `box-shadow: 0 25px 50px -12px rgba(0,0,0,${dark ? "0.5" : "0.25"}); animation: slideIn 0.3s ease;` : ""}
      }

      .profile-inner {
        transition: opacity 0.12s ease, transform 0.12s ease;
      }

      .profile-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 20px;
        position: relative;
      }

      .avatar-wrap { flex-shrink: 0; }

      .avatar-img {
        width: 52px; height: 52px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--authon-border);
      }

      .avatar-placeholder {
        width: 52px; height: 52px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        display: flex; align-items: center; justify-content: center;
        font-size: 18px; font-weight: 700; color: #fff;
        flex-shrink: 0;
      }

      .header-text { flex: 1; min-width: 0; }

      .display-name {
        font-size: 16px; font-weight: 600;
        color: var(--authon-text);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .email {
        font-size: 13px; color: var(--authon-muted);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        margin-top: 2px;
      }

      .close-btn {
        position: absolute; top: 0; right: 0;
        background: none; border: none;
        color: var(--authon-muted); cursor: pointer;
        padding: 4px; border-radius: 6px;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .close-btn:hover { color: var(--authon-text); background: var(--authon-divider); }

      .section {
        background: var(--authon-section-bg);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.67);
        padding: 12px 14px;
        margin-bottom: 12px;
        display: flex; flex-direction: column; gap: 10px;
      }

      .section-label {
        font-size: 11px; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.05em;
        color: var(--authon-dim); margin-bottom: 2px;
      }

      .field-row {
        display: flex; align-items: center; justify-content: space-between; gap: 8px;
      }

      .field-label {
        font-size: 12px; color: var(--authon-muted); flex-shrink: 0;
      }

      .field-value {
        font-size: 13px; color: var(--authon-text);
        text-align: right; min-width: 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .field-value.readonly { color: var(--authon-dim); }

      .field-group {
        display: flex; flex-direction: column; gap: 4px;
      }

      .input {
        width: 100%; padding: 9px 12px;
        background: var(--authon-input-bg);
        color: var(--authon-text);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 13px; font-family: var(--authon-font);
        outline: none; transition: border-color 0.15s;
      }
      .input::placeholder { color: var(--authon-dim); }
      .input:focus { border-color: var(--authon-primary-start); box-shadow: 0 0 0 3px ${colorWithAlpha(primaryStart, 0.15)}; }
      .input.readonly, .input:disabled { color: var(--authon-dim); cursor: not-allowed; background: var(--authon-section-bg); }

      .sessions-list { display: flex; flex-direction: column; gap: 6px; }

      .session-item {
        display: flex; align-items: center; justify-content: space-between;
        background: var(--authon-session-bg);
        border-radius: calc(var(--authon-radius) * 0.5);
        padding: 8px 10px; gap: 8px;
      }

      .session-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

      .session-device {
        font-size: 13px; font-weight: 500; color: var(--authon-text);
      }

      .session-meta {
        font-size: 11px; color: var(--authon-dim);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .session-revoke-btn {
        background: none; border: none;
        color: var(--authon-dim); cursor: pointer;
        padding: 4px; border-radius: 4px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s, background 0.15s;
      }
      .session-revoke-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

      .profile-actions {
        display: flex; flex-direction: column; gap: 8px;
        margin-top: 4px;
      }

      .edit-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .edit-btn:hover { opacity: 0.9; }

      .save-btn {
        width: 100%; padding: 10px;
        background: linear-gradient(135deg, var(--authon-primary-start), var(--authon-primary-end));
        color: #fff; border: none;
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 600; cursor: pointer;
        font-family: var(--authon-font); transition: opacity 0.15s;
      }
      .save-btn:hover { opacity: 0.9; }
      .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

      .cancel-btn {
        width: 100%; padding: 10px;
        background: none;
        color: var(--authon-muted);
        border: 1px solid var(--authon-border);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: background 0.15s, color 0.15s;
      }
      .cancel-btn:hover { background: var(--authon-divider); color: var(--authon-text); }

      .signout-btn {
        width: 100%; padding: 10px;
        background: none;
        color: #ef4444;
        border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.5);
        font-size: 14px; font-weight: 500; cursor: pointer;
        font-family: var(--authon-font); transition: background 0.15s;
      }
      .signout-btn:hover { background: rgba(239,68,68,0.08); }

      .error-msg {
        padding: 8px 12px;
        background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
        border-radius: calc(var(--authon-radius) * 0.33);
        font-size: 13px; color: #ef4444; text-align: center;
        animation: fadeIn 0.15s ease;
      }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideIn { from { opacity: 0; transform: translate(-50%, calc(-50% - 8px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
    `;
  }
  attachEvents() {
    this.attachBackdropEvent();
    this.attachInnerEvents();
  }
  attachBackdropEvent() {
    if (!this.shadowRoot || this.mode !== "popup") return;
    const backdrop = this.shadowRoot.getElementById("profile-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        this.onClose();
        this.close();
      });
    }
  }
  attachInnerEvents() {
    if (!this.shadowRoot) return;
    const closeBtn = this.shadowRoot.getElementById("profile-close-btn");
    closeBtn?.addEventListener("click", () => {
      this.onClose();
      this.close();
    });
    const editBtn = this.shadowRoot.getElementById("profile-edit-btn");
    editBtn?.addEventListener("click", () => {
      this.isEditMode = true;
      this.rerender();
    });
    const cancelBtn = this.shadowRoot.getElementById("profile-cancel-btn");
    cancelBtn?.addEventListener("click", () => {
      this.isEditMode = false;
      this.rerender();
    });
    const saveBtn = this.shadowRoot.getElementById("profile-save-btn");
    saveBtn?.addEventListener("click", async () => {
      const nameInput = this.shadowRoot.getElementById("profile-displayname-input");
      const avatarInput = this.shadowRoot.getElementById("profile-avatar-input");
      const displayName = nameInput?.value.trim();
      const avatarUrl = avatarInput?.value.trim();
      this.showSaving();
      this.shadowRoot.getElementById("profile-error")?.remove();
      try {
        await this.onSave({
          displayName: displayName || void 0,
          avatarUrl: avatarUrl || void 0
        });
        this.isEditMode = false;
        this.rerender();
      } catch (err) {
        this.showSaveError(err instanceof Error ? err.message : "Save failed");
      }
    });
    const signOutBtn = this.shadowRoot.getElementById("profile-signout-btn");
    signOutBtn?.addEventListener("click", async () => {
      if (signOutBtn instanceof HTMLButtonElement) {
        signOutBtn.disabled = true;
        signOutBtn.textContent = "...";
      }
      try {
        await this.onSignOut();
        this.close();
      } catch (_) {
        if (signOutBtn instanceof HTMLButtonElement) {
          signOutBtn.disabled = false;
          signOutBtn.textContent = this.t.signOut;
        }
      }
    });
    this.shadowRoot.querySelectorAll(".session-revoke-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const sessionId = btn.dataset.sessionId;
        if (!sessionId) return;
        btn.disabled = true;
        try {
          await this.onRevokeSession(sessionId);
          this.sessions = this.sessions.filter((s) => s.id !== sessionId);
          this.rerender();
        } catch (_) {
          btn.disabled = false;
        }
      });
    });
  }
};

// src/session.ts
var DEFAULT_API_URL = "https://api.authon.dev";
var STORAGE_SCHEMA_VERSION = 2;
function normalizeApiUrl(apiUrl) {
  try {
    const url = new URL(apiUrl);
    const pathname = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${pathname}`;
  } catch {
    return apiUrl.replace(/\/+$/, "");
  }
}
function stableDigest(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}
function tokenExpiration(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(padded));
    return typeof decoded.exp === "number" && Number.isFinite(decoded.exp) ? decoded.exp : null;
  } catch {
    return null;
  }
}
function isStoredSession(value) {
  if (!value || typeof value !== "object") return false;
  const session = value;
  return typeof session.accessToken === "string" && tokenExpiration(session.accessToken) !== null && typeof session.refreshToken === "string" && session.refreshToken.length > 0 && !!session.user && typeof session.user === "object" && typeof session.user.id === "string";
}
var SessionManager = class _SessionManager {
  accessToken = null;
  refreshToken = null;
  user = null;
  refreshTimer = null;
  apiUrl;
  publishableKey;
  storageKey;
  persistenceEnabled;
  refreshRetryCount = 0;
  refreshInFlight = null;
  listeners = /* @__PURE__ */ new Set();
  requestControllers = /* @__PURE__ */ new Set();
  ready = true;
  readinessPromise = Promise.resolve();
  destroyed = false;
  sessionGeneration = 0;
  static MAX_REFRESH_RETRIES = 3;
  static RETRY_DELAYS = [3, 10, 30];
  // seconds
  constructor(publishableKey, apiUrl, sessionMode = "browser") {
    this.publishableKey = publishableKey;
    this.apiUrl = normalizeApiUrl(apiUrl);
    this.storageKey = `authon_session_v${STORAGE_SCHEMA_VERSION}_${encodeURIComponent(this.apiUrl)}_${stableDigest(publishableKey)}`;
    this.persistenceEnabled = sessionMode === "browser";
    if (this.persistenceEnabled) this.restoreFromStorage();
  }
  restoreFromStorage() {
    if (typeof window === "undefined") return;
    let stored = null;
    let legacyKey = null;
    try {
      stored = localStorage.getItem(this.storageKey);
      if (!stored && this.apiUrl === DEFAULT_API_URL) {
        legacyKey = `authon_session_${this.publishableKey.slice(0, 16)}`;
        stored = localStorage.getItem(legacyKey);
      }
      if (!stored) return;
      const data = JSON.parse(stored);
      if (!isStoredSession(data)) {
        if (!legacyKey) localStorage.removeItem(this.storageKey);
        return;
      }
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.user = data.user;
      if (legacyKey && this.persistToStorage()) localStorage.removeItem(legacyKey);
      const expiration = tokenExpiration(data.accessToken);
      const remainingSeconds = expiration - Math.floor(Date.now() / 1e3);
      if (remainingSeconds > 0) {
        this.scheduleRefresh(remainingSeconds);
        return;
      }
      this.ready = false;
      this.readinessPromise = this.refresh().then(() => void 0).finally(() => {
        if (!this.destroyed) this.ready = true;
      });
    } catch {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
    }
  }
  persistToStorage() {
    if (!this.persistenceEnabled) return false;
    if (typeof window === "undefined") return false;
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
      return true;
    } catch {
      return false;
    }
  }
  isReady() {
    return this.ready;
  }
  waitUntilReady() {
    return this.readinessPromise;
  }
  getToken() {
    return !this.destroyed && this.ready && this.isTokenValid() ? this.accessToken : null;
  }
  isTokenValid() {
    if (this.destroyed || !this.accessToken) return false;
    const expiration = tokenExpiration(this.accessToken);
    return expiration !== null && expiration > Math.floor(Date.now() / 1e3);
  }
  getUser() {
    return this.getToken() ? this.user : null;
  }
  setSession(tokens, reason = "setSession") {
    if (this.destroyed) return;
    if (!this.persistenceEnabled) throw new Error("Browser token sessions are disabled in BFF mode");
    this.cancelRefreshTimer();
    if (reason === "setSession") this.invalidateRequests();
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = tokens.user;
    this.ready = true;
    this.refreshRetryCount = 0;
    this.persistToStorage();
    if (tokens.expiresIn > 0) this.scheduleRefresh(tokens.expiresIn);
    this.notify(reason);
  }
  subscribe(listener) {
    if (this.destroyed) return () => {
    };
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  updateUser(user) {
    if (this.destroyed) return;
    this.user = user;
    this.persistToStorage();
    this.notify("updateUser");
  }
  clearSession(reason = "clearSession") {
    if (this.destroyed) return;
    this.invalidateRequests();
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.ready = true;
    this.persistToStorage();
    this.cancelRefreshTimer();
    this.notify(reason);
  }
  scheduleRefresh(expiresIn) {
    this.cancelRefreshTimer();
    const refreshIn = Math.max((expiresIn - 60) * 1e3, 0);
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, refreshIn);
  }
  cancelRefreshTimer() {
    if (!this.refreshTimer) return;
    clearTimeout(this.refreshTimer);
    this.refreshTimer = null;
  }
  async refresh() {
    if (this.destroyed) return null;
    if (!this.persistenceEnabled) return null;
    if (this.refreshInFlight) return this.refreshInFlight;
    if (!this.refreshToken) {
      this.clearSession("refreshFailed");
      return null;
    }
    const generation = this.sessionGeneration;
    const inFlight = this.doRefresh(generation);
    this.refreshInFlight = inFlight;
    try {
      return await inFlight;
    } finally {
      if (this.refreshInFlight === inFlight) this.refreshInFlight = null;
    }
  }
  async doRefresh(generation) {
    if (!this.refreshToken || this.destroyed) return null;
    const controller = new AbortController();
    this.requestControllers.add(controller);
    try {
      const res = await fetch(`${this.apiUrl}/v1/auth/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.publishableKey
        },
        credentials: "include",
        body: JSON.stringify({ refreshToken: this.refreshToken }),
        signal: controller.signal
      });
      if (this.destroyed || generation !== this.sessionGeneration) return null;
      if (!res.ok) {
        if (res.status === 401) {
          this.refreshRetryCount = 0;
          this.clearSession("refreshFailed");
          return null;
        }
        this.retryRefresh();
        return null;
      }
      const tokens = await res.json();
      if (this.destroyed || generation !== this.sessionGeneration) return null;
      this.refreshRetryCount = 0;
      this.setSession(tokens, "tokenRefresh");
      return tokens;
    } catch {
      if (!this.destroyed && generation === this.sessionGeneration && !controller.signal.aborted) {
        this.retryRefresh();
      }
      return null;
    } finally {
      this.requestControllers.delete(controller);
    }
  }
  retryRefresh() {
    if (this.destroyed) return;
    const delay = this.refreshRetryCount < _SessionManager.MAX_REFRESH_RETRIES ? _SessionManager.RETRY_DELAYS[Math.min(this.refreshRetryCount, _SessionManager.RETRY_DELAYS.length - 1)] : 60;
    this.refreshRetryCount++;
    this.cancelRefreshTimer();
    this.refreshTimer = setTimeout(() => {
      this.refreshTimer = null;
      void this.refresh();
    }, delay * 1e3);
  }
  async signOut() {
    if (this.destroyed) return;
    const accessToken = this.accessToken;
    this.invalidateRequests();
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.ready = true;
    this.persistToStorage();
    this.cancelRefreshTimer();
    this.notify("signOut");
    const controller = new AbortController();
    this.requestControllers.add(controller);
    try {
      const request = fetch(`${this.apiUrl}/v1/auth/signout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.publishableKey,
          ...accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
        },
        credentials: "include",
        signal: controller.signal
      });
      void request.catch(() => void 0).finally(() => {
        this.requestControllers.delete(controller);
      });
    } catch {
      this.requestControllers.delete(controller);
    }
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.cancelRefreshTimer();
    this.invalidateRequests();
    this.listeners.clear();
  }
  invalidateRequests() {
    this.sessionGeneration++;
    for (const controller of this.requestControllers) controller.abort();
    this.requestControllers.clear();
    this.refreshInFlight = null;
  }
  notify(reason) {
    const change = {
      reason,
      accessToken: this.getToken(),
      user: this.getUser()
    };
    for (const listener of [...this.listeners]) {
      try {
        listener(change);
      } catch {
      }
    }
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

// src/wallet.ts
var AuthonWalletError = class extends Error {
  code;
  constructor(code, message) {
    super(message ?? code);
    this.name = "AuthonWalletError";
    this.code = code;
  }
};
var DEFAULT_TIMEOUT_MS = 3e4;
var DEFAULT_POPUP_TIMEOUT_MS = 18e4;
var POPUP_FEATURES = "popup=yes,width=420,height=620";
var FRAME_HIDDEN_STYLE = "position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none;";
var FRAME_VISIBLE_STYLE = "position:fixed;inset:0;width:100vw;height:100vh;border:0;opacity:1;pointer-events:auto;z-index:2147483647;background:transparent;color-scheme:normal;";
var toError = (error) => new AuthonWalletError(error?.code || "UNKNOWN", error?.message || error?.code || "Wallet request failed");
var toBigIntHex = (value) => typeof value === "bigint" ? `0x${value.toString(16)}` : value;
var WalletClient = class {
  options;
  listeners = /* @__PURE__ */ new Set();
  pending = /* @__PURE__ */ new Map();
  iframe = null;
  frameReady = null;
  abortFrame = null;
  listening = false;
  ensuring = null;
  counter = 0;
  constructor(options) {
    this.options = options;
  }
  async get() {
    try {
      return this.normalize(await this.call("wallet.status"));
    } catch (error) {
      if (error instanceof AuthonWalletError && error.code === "NOT_FOUND") return null;
      throw error;
    }
  }
  ensure() {
    if (this.ensuring) return this.ensuring;
    const run = (async () => {
      const existing = await this.get();
      if (existing) return existing;
      const created = this.normalize(await this.call("wallet.create"));
      if (!created) throw new AuthonWalletError("NOT_FOUND", "Wallet creation returned no wallet");
      this.notify(created);
      return created;
    })();
    this.ensuring = run;
    const clear = () => {
      if (this.ensuring === run) this.ensuring = null;
    };
    run.then(clear, clear);
    return run;
  }
  /** True when the wallet exists and has a passkey backup. See `EmbeddedWallet.protected`. */
  async isProtected() {
    return (await this.get())?.protected === true;
  }
  /**
   * Every signature needs the user's approval; a project can turn this off only in its
   * server-side wallet settings, never from the page.
   * - Low-risk requests (personal messages, typed data that grants nothing) show a card
   *   inside the wallet frame with the requesting site and the full text. Sign is
   *   enabled only after the text was scrolled to the end.
   * - High-risk requests (transactions with value or call data, approvals, permits,
   *   orders, meta-transactions) show a small card whose button opens an Authon window
   *   (`<wallet origin>/confirm`); the user approves there, outside this page. The click
   *   happens inside the frame, so this method does not need to run in a click handler.
   * Rejecting gives USER_CANCELLED; a blocked or closed window gives
   * CONFIRM_WINDOW_BLOCKED / CONFIRM_WINDOW_CLOSED; text over 16,384 characters gives
   * MESSAGE_TOO_LARGE. None of these ever signs.
   */
  async signMessage(message) {
    return this.call("wallet.signMessage", { message }, this.interactiveTimeout());
  }
  async signTypedData(typedData) {
    return this.call("wallet.signTypedData", { typedData }, this.interactiveTimeout());
  }
  async signTransaction(tx) {
    const normalized = {};
    for (const [key, value] of Object.entries(tx)) normalized[key] = toBigIntHex(value);
    return this.call("wallet.signTransaction", { tx: normalized }, this.interactiveTimeout());
  }
  /**
   * Creates a passkey and backs up the wallet. Must be called from a user click
   * handler: the browser only allows the passkey prompt (or the popup fallback)
   * during a user gesture.
   */
  async protect(options = {}) {
    await this.call("wallet.protect", { ui: options.ui ?? this.options.ui }, this.interactiveTimeout());
    await this.refresh();
  }
  /**
   * Replaces a legacy passkey backup (`backupUpgradeRecommended`) with a new passkey
   * whose public key the server keeps, so later restores are verified by the server.
   * Must be called from a user click handler, on a browser where the wallet works.
   * The key shares are rotated: other devices and sites restore once with the new
   * passkey. Not available in the popup fallback.
   */
  async upgradeBackup(options = {}) {
    await this.call("wallet.upgradeBackup", { ui: options.ui ?? this.options.ui }, this.interactiveTimeout());
    await this.refresh();
  }
  /**
   * Restores the wallet on this browser with the passkey (one confirmation tap and
   * the system prompt). By default this browser is added as another device and
   * other devices keep working. Pass `resetOtherDevices: true` when a device was
   * lost: the key is re-split and every other device must restore again. The reset
   * card always shows the wallet's own warning text (custom `ui` text is ignored),
   * and reset is not available in the popup fallback.
   */
  async restore(options = {}) {
    await this.call(
      "wallet.restore",
      { ui: options.ui ?? this.options.ui, reset: options.resetOtherDevices === true },
      this.interactiveTimeout()
    );
    await this.refresh();
  }
  /**
   * Revokes a device. Must run in a browser that holds a trusted device share (the
   * frame signs the request with it). The last device of an unprotected wallet
   * cannot be revoked (LAST_DEVICE).
   */
  async revokeDevice(deviceId) {
    await this.call("wallet.revokeDevice", { deviceId });
    await this.refresh();
  }
  onChange(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  provider(chainId) {
    const hexChainId = `0x${chainId.toString(16)}`;
    const unsupported = (method) => Object.assign(new AuthonWalletError("UNSUPPORTED_METHOD", `Method ${method} is not supported`), { code: 4200 });
    return {
      request: async ({ method, params }) => {
        const list = Array.isArray(params) ? params : [];
        switch (method) {
          case "eth_chainId":
            return hexChainId;
          case "eth_accounts": {
            const wallet = await this.get();
            return wallet ? [wallet.address] : [];
          }
          case "eth_requestAccounts":
            return [(await this.ensure()).address];
          case "personal_sign": {
            const data = list[0];
            if (typeof data !== "string") throw new AuthonWalletError("INVALID_PARAMS", "personal_sign requires a message");
            return this.signMessage({ raw: data });
          }
          case "eth_signTypedData_v4": {
            const raw = list[1];
            const typed = typeof raw === "string" ? JSON.parse(raw) : raw;
            if (!typed || typeof typed !== "object") throw new AuthonWalletError("INVALID_PARAMS", "eth_signTypedData_v4 requires typed data");
            return this.signTypedData(typed);
          }
          case "eth_signTransaction": {
            const tx = list[0];
            if (!tx || typeof tx !== "object") throw new AuthonWalletError("INVALID_PARAMS", "eth_signTransaction requires a transaction");
            return this.signTransaction({ chainId: hexChainId, ...tx });
          }
          default:
            throw unsupported(method);
        }
      }
    };
  }
  /** Removes the frame and rejects in-flight requests. Called on sign-out. */
  dispose() {
    for (const [id, entry] of this.pending) {
      clearTimeout(entry.timer);
      entry.reject(new AuthonWalletError("DISPOSED", "Wallet was disposed"));
      this.pending.delete(id);
    }
    if (this.listening && typeof window !== "undefined") window.removeEventListener("message", this.onMessage);
    this.listening = false;
    this.abortFrame?.(new AuthonWalletError("DISPOSED", "Wallet was disposed"));
    this.abortFrame = null;
    this.iframe?.remove();
    this.iframe = null;
    this.frameReady = null;
    this.ensuring = null;
    this.notify(null);
  }
  async refresh() {
    const wallet = await this.get();
    this.notify(wallet);
  }
  notify(wallet) {
    for (const listener of [...this.listeners]) {
      try {
        listener(wallet);
      } catch {
      }
    }
  }
  normalize(result) {
    if (!result || typeof result !== "object") return null;
    const raw = result;
    if (raw.exists === false || typeof raw.address !== "string") return null;
    return {
      address: raw.address,
      protected: !!raw.protected,
      needsRestore: !!raw.needsRestore,
      backupUpgradeRecommended: !!raw.backupUpgradeRecommended,
      devices: Array.isArray(raw.devices) ? raw.devices : []
    };
  }
  requireOrigin() {
    if (!this.options.walletOrigin) {
      throw new AuthonWalletError("NOT_CONFIGURED", "Set wallet.origin in AuthonConfig when using a custom apiUrl");
    }
    return this.options.walletOrigin;
  }
  frameUrl(path) {
    const origin = this.requireOrigin();
    const url = new URL(`/${path}`, origin);
    url.searchParams.set("pk", this.options.publishableKey);
    url.searchParams.set("origin", window.location.origin);
    return url.toString();
  }
  ensureFrame() {
    if (this.frameReady) return this.frameReady;
    const src = this.frameUrl("frame");
    const iframe = document.createElement("iframe");
    iframe.setAttribute("allow", "publickey-credentials-create; publickey-credentials-get");
    iframe.setAttribute("aria-hidden", "true");
    iframe.tabIndex = -1;
    iframe.title = "Authon wallet";
    iframe.style.cssText = FRAME_HIDDEN_STYLE;
    this.iframe = iframe;
    this.listen();
    this.frameReady = new Promise((resolve, reject) => {
      this.abortFrame = reject;
      const timer = setTimeout(() => reject(new AuthonWalletError("TIMEOUT", "Wallet frame did not load")), this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
      iframe.addEventListener("load", () => {
        clearTimeout(timer);
        if (iframe.contentWindow) resolve(iframe.contentWindow);
        else reject(new AuthonWalletError("NOT_CONFIGURED", "Wallet frame has no window"));
      }, { once: true });
    });
    this.frameReady.catch(() => {
      if (this.iframe === iframe) {
        iframe.remove();
        this.iframe = null;
        this.frameReady = null;
      }
    });
    iframe.src = src;
    document.body.appendChild(iframe);
    return this.frameReady;
  }
  setFrameVisible(visible) {
    const iframe = this.iframe;
    if (!iframe) return;
    iframe.style.cssText = visible ? FRAME_VISIBLE_STYLE : FRAME_HIDDEN_STYLE;
    if (visible) {
      iframe.removeAttribute("aria-hidden");
      iframe.tabIndex = 0;
      iframe.focus();
    } else {
      iframe.setAttribute("aria-hidden", "true");
      iframe.tabIndex = -1;
    }
  }
  listen() {
    if (this.listening) return;
    window.addEventListener("message", this.onMessage);
    this.listening = true;
  }
  onMessage = (event) => {
    if (event.origin !== this.options.walletOrigin) return;
    const ui = event.data;
    if (ui && ui.v === 1 && ui.type === "wallet.ui") {
      if (this.iframe && event.source === this.iframe.contentWindow) this.setFrameVisible(ui.state === "show");
      return;
    }
    const data = event.data;
    if (!data || data.v !== 1 || typeof data.id !== "string") return;
    const entry = this.pending.get(data.id);
    if (!entry) return;
    const expected = entry.source();
    if (expected && event.source !== expected) return;
    this.pending.delete(data.id);
    clearTimeout(entry.timer);
    if (data.ok) entry.resolve(data.result);
    else entry.reject(toError(data.error));
  };
  send(target, post, type, payload, timeoutMs) {
    const id = `w${Date.now().toString(36)}${(this.counter++).toString(36)}`;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new AuthonWalletError("TIMEOUT", `Wallet request ${type} timed out`));
      }, timeoutMs);
      this.pending.set(id, {
        resolve,
        reject,
        source: target,
        timer
      });
      post.postMessage({ v: 1, id, type, payload }, this.requireOrigin());
    });
  }
  /** Signing, protect, restore and upgrade wait for a person (in the frame or the Authon window). */
  interactiveTimeout() {
    return this.options.popupTimeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
  }
  async call(type, extra = {}, timeoutMs) {
    const token = await this.options.getToken();
    if (!token) throw new AuthonWalletError("NOT_SIGNED_IN", "Sign in before using the wallet");
    const payload = { ...extra, token };
    const frame = await this.ensureFrame();
    try {
      return await this.send(() => frame, frame, type, payload, timeoutMs ?? this.options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    } catch (error) {
      if (error instanceof AuthonWalletError && error.code === "NEEDS_POPUP") {
        return this.callViaPopup(type, payload);
      }
      throw error;
    }
  }
  async callViaPopup(type, payload) {
    const popup = window.open(this.frameUrl("passkey"), "authon-wallet", POPUP_FEATURES);
    if (!popup) throw new AuthonWalletError("POPUP_BLOCKED", "Call this from a user click so the passkey window can open");
    const popupTimeout = this.options.popupTimeoutMs ?? DEFAULT_POPUP_TIMEOUT_MS;
    try {
      await this.waitForPopupReady(popup, popupTimeout);
      const request = this.send(() => popup, popup, type, payload, popupTimeout);
      const closed = new Promise((_, reject) => {
        const poll = setInterval(() => {
          if (popup.closed) {
            clearInterval(poll);
            reject(new AuthonWalletError("USER_CANCELLED", "Passkey window was closed"));
          }
        }, 500);
        request.then(() => clearInterval(poll), () => clearInterval(poll));
      });
      return await Promise.race([request, closed]);
    } finally {
      if (!popup.closed) popup.close();
    }
  }
  waitForPopupReady(popup, timeoutMs) {
    return new Promise((resolve, reject) => {
      const done = (fn) => {
        clearTimeout(timer);
        clearInterval(poll);
        window.removeEventListener("message", handler);
        fn();
      };
      const handler = (event) => {
        if (event.origin !== this.options.walletOrigin || event.source !== popup) return;
        const data = event.data;
        if (data?.v === 1 && data.type === "wallet.ready") done(resolve);
      };
      const timer = setTimeout(() => done(() => reject(new AuthonWalletError("TIMEOUT", "Passkey window did not respond"))), timeoutMs);
      const poll = setInterval(() => {
        if (popup.closed) done(() => reject(new AuthonWalletError("USER_CANCELLED", "Passkey window was closed")));
      }, 500);
      window.addEventListener("message", handler);
    });
  }
};

// src/oauth-pkce.ts
var OAUTH_CODE_PARAM = "authon_code";
var OAUTH_STATE_PARAM = "authon_oauth_state";
var OAUTH_ERROR_PARAM = "authon_oauth_error";
var OAUTH_POPUP_PARAM = "authon_oauth_popup";
var VERIFIER_KEY_PREFIX = "authon-oauth-verifier:";
var HANDOFF_KEY_PREFIX = "authon-oauth-handoff:";
var STORED_TTL_MS = 10 * 60 * 1e3;
function base64Url(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function getCrypto() {
  const c = globalThis.crypto;
  if (!c?.getRandomValues || !c.subtle) {
    throw new Error("Authon OAuth needs the Web Crypto API (a secure https:// or localhost page)");
  }
  return c;
}
function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return base64Url(bytes);
}
async function computeCodeChallenge(verifier) {
  const digest = await getCrypto().subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return base64Url(new Uint8Array(digest));
}
async function createPkcePair() {
  const verifier = generateCodeVerifier();
  return { verifier, challenge: await computeCodeChallenge(verifier) };
}
function saveRedirectVerifier(state, verifier) {
  try {
    sessionStorage.setItem(VERIFIER_KEY_PREFIX + state, JSON.stringify({ v: verifier, at: Date.now() }));
  } catch {
  }
}
function takeRedirectVerifier(state) {
  try {
    const key = VERIFIER_KEY_PREFIX + state;
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.v !== "string" || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > STORED_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}
function handoffKey(state) {
  return HANDOFF_KEY_PREFIX + state;
}
function writeHandoff(state, value) {
  try {
    localStorage.setItem(handoffKey(state), JSON.stringify({ ...value, at: Date.now() }));
  } catch {
  }
}
function readHandoff(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > STORED_TTL_MS) return null;
    return {
      code: typeof parsed.code === "string" ? parsed.code : void 0,
      error: typeof parsed.error === "string" ? parsed.error : void 0,
      at: parsed.at
    };
  } catch {
    return null;
  }
}
function takeHandoff(state) {
  try {
    const key = handoffKey(state);
    const value = readHandoff(localStorage.getItem(key));
    if (value) localStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}
function pruneHandoffs() {
  try {
    const stale = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(HANDOFF_KEY_PREFIX) && !readHandoff(localStorage.getItem(key))) stale.push(key);
    }
    for (const key of stale) localStorage.removeItem(key);
  } catch {
  }
}
function currentReturnUrl() {
  const url = new URL(window.location.href);
  for (const param of [OAUTH_CODE_PARAM, OAUTH_STATE_PARAM, OAUTH_ERROR_PARAM, OAUTH_POPUP_PARAM]) {
    url.searchParams.delete(param);
  }
  url.hash = "";
  return url.toString();
}

// src/authon.ts
var DEFAULT_API_URL2 = "https://api.authon.dev";
var DEFAULT_WALLET_ORIGIN = "https://wallet.authon.dev";
var MAGIC_LINK_PARAM = "authon_magic_link";
function isMfaRequired(value) {
  return !!value && typeof value === "object" && value.mfaRequired === true && typeof value.mfaToken === "string";
}
function isMagicLinkConfirmation(value) {
  return !!value && typeof value === "object" && value.status === "confirmation_required" && typeof value.email === "string";
}
var magicLinkResponses = /* @__PURE__ */ new Map();
var pageMagicLinkTokens = /* @__PURE__ */ new Map();
var MAGIC_LINK_NONCE_KEY = "authon_magic_link_nonce:";
var Authon = class {
  publishableKey;
  config;
  session;
  wallet;
  walletAutoCreate;
  walletEnabled = true;
  modal = null;
  profile = null;
  listeners = /* @__PURE__ */ new Map();
  branding = null;
  providers = [];
  providerFlowModes = {};
  initialized = false;
  captchaEnabled = false;
  turnstileSiteKey = "";
  authorizationContext = null;
  verificationToken = null;
  magicLinkResult = null;
  pendingMagicLink = null;
  constructor(publishableKey, config) {
    this.publishableKey = publishableKey;
    this.config = {
      apiUrl: config?.apiUrl || DEFAULT_API_URL2,
      mode: config?.mode || "popup",
      theme: config?.theme || "auto",
      locale: config?.locale || "en",
      containerId: config?.containerId,
      appearance: config?.appearance,
      sessionMode: config?.sessionMode || "browser",
      autoHandleMagicLink: config?.autoHandleMagicLink !== false
    };
    this.session = new SessionManager(publishableKey, this.config.apiUrl, this.config.sessionMode);
    const walletOrigin = config?.wallet?.origin || (this.config.apiUrl.replace(/\/+$/, "") === DEFAULT_API_URL2 ? DEFAULT_WALLET_ORIGIN : null);
    this.walletAutoCreate = !!config?.wallet?.autoCreate;
    this.wallet = new WalletClient({
      publishableKey,
      walletOrigin: walletOrigin ? new URL(walletOrigin).origin : null,
      getToken: config?.wallet?.getToken ? async () => await config.wallet.getToken() ?? null : async () => await this.ensureValidToken() ? this.session.getToken() : null,
      ui: config?.wallet?.ui
    });
    this.wallet.onChange((wallet) => this.emit("walletChanged", wallet));
    this.session.subscribe((change) => {
      this.emit("sessionChanged", change);
      if (change.reason === "setSession" && change.user) {
        this.emit("signedIn", change.user);
        if (this.walletAutoCreate) void this.autoCreateWallet();
      } else if (change.reason === "tokenRefresh" && change.accessToken) {
        this.emit("tokenRefreshed", change.accessToken);
      } else if (change.reason === "clearSession" || change.reason === "signOut" || change.reason === "refreshFailed") {
        this.wallet.dispose();
        this.emit("signedOut");
      }
    });
    if (this.config.sessionMode === "browser") {
      this.consumeRedirectResultFromUrl();
      if (this.config.autoHandleMagicLink) this.magicLinkResult = this.consumeMagicLinkFromUrl();
    }
  }
  // ── Public API ──
  async getProviders() {
    await this.ensureInitialized();
    return [...this.providers];
  }
  async openSignIn(options) {
    await this.ensureInitialized();
    await this.prepareAuthorization(options);
    this.getModal().open("signIn");
  }
  async openSignUp(options) {
    await this.ensureInitialized();
    await this.prepareAuthorization(options);
    this.getModal().open("signUp");
  }
  async prepareAuthorization(options) {
    this.authorizationContext = null;
    this.verificationToken = null;
    if (!options || options.responseType !== "code") return;
    if (this.config.sessionMode !== "bff") {
      throw new Error("Authorization code flow requires sessionMode: 'bff'");
    }
    if (options.codeChallengeMethod !== "S256") throw new Error("Only S256 PKCE is supported");
    const result = await this.apiPost(
      "/v1/auth/authorize",
      options
    );
    this.authorizationContext = {
      options: { ...options },
      requestId: result.authorizationRequestId
    };
  }
  authorizationRequestBody() {
    return this.authorizationContext ? { authorizationRequestId: this.authorizationContext.requestId } : {};
  }
  /**
   * Every sign-in path (password, magic link, email code, wallet, passkey, OAuth) ends here. An
   * `mfaRequired` body is handled the same way for all of them: `mfaRequired` event +
   * AuthonMfaRequiredError carrying the token for `verifyMfa()`. In authorization code mode the
   * request stays open and `verifyMfa()` finishes it.
   */
  handleAuthCompletion(response) {
    if (isMfaRequired(response)) {
      this.emit("mfaRequired", response.mfaToken);
      throw new AuthonMfaRequiredError(response.mfaToken);
    }
    if (this.authorizationContext) {
      const candidate = response;
      if (candidate.accessToken || candidate.refreshToken || !candidate.authorizationCode) {
        throw new Error("Authon returned an unsafe token response for authorization code mode");
      }
      if (candidate.state !== this.authorizationContext.options.state) {
        throw new Error("Authorization state mismatch");
      }
      if (!Number.isFinite(candidate.expiresIn) || candidate.expiresIn <= 0 || candidate.expiresIn > 60) {
        throw new Error("Invalid authorization code expiry");
      }
      const result = {
        authorizationCode: candidate.authorizationCode,
        state: candidate.state,
        expiresIn: candidate.expiresIn
      };
      const redirect = new URL(this.authorizationContext.options.redirectUri);
      redirect.searchParams.set("code", result.authorizationCode);
      redirect.searchParams.set("state", result.state);
      redirect.searchParams.set("expires_in", String(result.expiresIn));
      this.authorizationContext = null;
      this.verificationToken = null;
      this.emit("authorizationCompleted", result);
      window.location.assign(redirect.toString());
      return result;
    }
    const tokens = response;
    if (!tokens.accessToken || !tokens.refreshToken || !tokens.user) throw new Error("Invalid token response");
    this.session.setSession(tokens);
    return tokens.user;
  }
  async openProfile() {
    const user = this.getUser();
    if (!user) throw new Error("Must be signed in to open profile");
    const token = this.session.getToken();
    let sessions = [];
    if (token) {
      try {
        sessions = await this.listSessions();
      } catch (_) {
      }
    }
    if (!this.profile) {
      this.profile = new ProfileRenderer({
        mode: this.config.mode,
        theme: this.config.theme,
        locale: this.config.locale,
        containerId: this.config.containerId,
        branding: this.branding || void 0,
        user,
        sessions,
        onSave: async (data) => {
          const updated = await this.updateProfile(data);
          this.profile?.updateUser(updated);
        },
        onSignOut: async () => {
          await this.signOut();
          this.profile = null;
        },
        onRevokeSession: async (sessionId) => {
          await this.revokeSession(sessionId);
        },
        onClose: () => {
          this.profile?.close();
          this.profile = null;
        }
      });
    } else {
      this.profile.updateUser(user);
      this.profile.updateSessions(sessions);
    }
    this.profile.open();
  }
  closeProfile() {
    this.profile?.close();
    this.profile = null;
  }
  /** Update theme at runtime without destroying form state */
  setTheme(theme) {
    this.getModal().setTheme(theme);
    this.profile?.setTheme(theme);
  }
  async signInWithOAuth(provider, options) {
    await this.ensureInitialized();
    await this.startOAuthFlow(provider, options);
  }
  async signInWithEmail(email, password, turnstileToken) {
    const body = { email, password, ...this.authorizationRequestBody() };
    if (turnstileToken) body.turnstileToken = turnstileToken;
    const res = await this.apiPost(
      "/v1/auth/signin",
      body
    );
    if (res.needsVerification) {
      const verificationEmail = res.email || email;
      this.verificationToken = res.verificationToken ?? null;
      this.emit("verificationRequired", verificationEmail);
      return { needsVerification: true, email: verificationEmail };
    }
    if (res.mfaRequired && res.mfaToken) {
      this.emit("mfaRequired", res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken);
    }
    return this.handleAuthCompletion(res);
  }
  async signUpWithEmail(email, password, meta) {
    const res = await this.apiPost("/v1/auth/signup", {
      email,
      password,
      ...meta,
      ...this.authorizationRequestBody()
    });
    if (res.needsVerification) {
      const verificationEmail = res.email || email;
      this.verificationToken = res.verificationToken ?? null;
      this.emit("verificationRequired", verificationEmail);
      return { needsVerification: true, email: verificationEmail };
    }
    return this.handleAuthCompletion(res);
  }
  async verifyEmail(email, code) {
    const res = await this.apiPost("/v1/auth/verify-email", {
      email,
      code,
      ...this.verificationToken ? { verificationToken: this.verificationToken } : {}
    });
    return this.handleAuthCompletion(res);
  }
  async resendVerificationCode(email) {
    const result = await this.apiPost("/v1/auth/resend-code", {
      email,
      ...this.authorizationRequestBody()
    });
    if (result.verificationToken) this.verificationToken = result.verificationToken;
  }
  async signOut() {
    await this.session.signOut();
  }
  getUser() {
    return this.session.getUser();
  }
  getToken() {
    return this.session.getToken();
  }
  /** Whether persisted session validation (including any required refresh) has completed. */
  isReady() {
    return this.session.isReady();
  }
  /** Wait until persisted session validation (including any required refresh) has completed. */
  waitUntilReady() {
    return this.session.waitUntilReady();
  }
  /** Check if the current access token is valid (JWT exp not passed) */
  isTokenValid() {
    return this.session.isTokenValid();
  }
  /** Ensure a valid token is available — refreshes if expired. Returns true if a valid token exists after the call. */
  async ensureValidToken() {
    if (this.session.isTokenValid()) return true;
    const result = await this.session.refresh();
    return result !== null;
  }
  on(event, listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, /* @__PURE__ */ new Set());
    const set = this.listeners.get(event);
    set.add(listener);
    return () => set.delete(listener);
  }
  /** Subscribe to every session mutation with its reason and validated public snapshot. */
  onSessionChange(listener) {
    return this.on("sessionChanged", listener);
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
    return this.handleAuthCompletion(res);
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
  async sendMagicLink(email, options) {
    const redirectUrl = options?.redirectUrl ?? this.magicLinkReturnUrl();
    const previousNonce = this.readMagicLinkNonce();
    const browserNonce = this.authorizationContext ? null : this.createMagicLinkNonce();
    try {
      await this.apiPost("/v1/auth/passwordless/magic-link", {
        email,
        ...redirectUrl ? { redirectUrl } : {},
        ...browserNonce ? { browserNonce } : {},
        ...this.authorizationRequestBody()
      });
    } catch (err) {
      if (browserNonce) this.restoreMagicLinkNonce(previousNonce);
      throw err;
    }
  }
  /**
   * Finish a magic link sign-in from the current URL. With `autoHandleMagicLink` on (default) this
   * returns the verification already started on page load. Resolves to null when the URL has no link,
   * the link could not be used (the reason is emitted as an `error` event), or the link needs the
   * person's confirmation first (see `getPendingMagicLink()` / `magicLinkConfirmationRequired`).
   */
  handleMagicLink() {
    if (!this.magicLinkResult) this.magicLinkResult = this.consumeMagicLinkFromUrl();
    return this.magicLinkResult;
  }
  /**
   * The magic link from this page that was not used automatically because it was requested in
   * another browser, or someone is already signed in here. Show "Sign in as {email}?" and call
   * `confirmMagicLink()` or `dismissMagicLink()`.
   */
  getPendingMagicLink() {
    if (!this.pendingMagicLink) return null;
    return { email: this.pendingMagicLink.email, reason: this.pendingMagicLink.reason };
  }
  /** Sign in with the pending magic link after the person agreed. Replaces any current session. */
  async confirmMagicLink() {
    const pending = this.pendingMagicLink;
    if (!pending) throw new Error("No magic link is waiting for confirmation");
    const user = await this.verifyPasswordless({ token: pending.token });
    if (this.pendingMagicLink?.token === pending.token) this.pendingMagicLink = null;
    return user;
  }
  /** Forget the pending magic link without signing in. The link itself stays unused. */
  dismissMagicLink() {
    this.pendingMagicLink = null;
  }
  async sendEmailOtp(email) {
    await this.apiPost("/v1/auth/passwordless/email-otp", { email, ...this.authorizationRequestBody() });
  }
  async verifyPasswordless(options) {
    if (options.token && !options.email && !options.code) {
      const base = this.magicLinkRequestKey(options.token);
      const onLoad = magicLinkResponses.get(`${base}|load`);
      if (onLoad) {
        const loaded = await onLoad.catch(() => null);
        if (loaded && !isMagicLinkConfirmation(loaded)) return this.handleAuthCompletion(loaded);
      }
      const res2 = await this.sharedMagicLinkRequest(`${base}|confirm`, { token: options.token });
      if (isMagicLinkConfirmation(res2)) throw new Error("Magic link needs confirmation");
      if (this.pendingMagicLink?.token === options.token) this.pendingMagicLink = null;
      return this.handleAuthCompletion(res2);
    }
    const res = await this.apiPost("/v1/auth/passwordless/verify", { ...options, mfaCapable: true });
    return this.handleAuthCompletion(res);
  }
  // ── Passkeys ──
  async registerPasskey(name) {
    const token = this.session.getToken();
    if (!token) throw new Error("Must be signed in to register a passkey");
    const options = await this.apiPostAuth(
      "/v1/auth/passkeys/register/options",
      void 0,
      token
    );
    const credential = await navigator.credentials.create({
      publicKey: this.deserializeCreationOptions(this.unwrapWebAuthnOptions(options))
    });
    if (!credential) throw new Error("Passkey registration was cancelled");
    const attestation = credential.response;
    const transports = typeof attestation.getTransports === "function" ? attestation.getTransports() : void 0;
    const result = await this.apiPostAuth(
      "/v1/auth/passkeys/register/verify",
      {
        response: {
          ...this.credentialBase(credential),
          response: {
            attestationObject: this.bufferToBase64url(attestation.attestationObject),
            clientDataJSON: this.bufferToBase64url(attestation.clientDataJSON),
            ...transports && transports.length > 0 ? { transports } : {}
          }
        },
        ...name ? { name } : {}
      },
      token
    );
    this.emit("passkeyRegistered", result);
    return result;
  }
  async authenticateWithPasskey(email) {
    const options = await this.apiPost(
      "/v1/auth/passkeys/authenticate/options",
      { ...email ? { email } : {}, ...this.authorizationRequestBody() }
    );
    const credential = await navigator.credentials.get({
      publicKey: this.deserializeRequestOptions(this.unwrapWebAuthnOptions(options))
    });
    if (!credential) throw new Error("Passkey sign-in was cancelled");
    const assertion = credential.response;
    const res = await this.apiPost("/v1/auth/passkeys/authenticate/verify", {
      response: {
        ...this.credentialBase(credential),
        response: {
          authenticatorData: this.bufferToBase64url(assertion.authenticatorData),
          clientDataJSON: this.bufferToBase64url(assertion.clientDataJSON),
          signature: this.bufferToBase64url(assertion.signature),
          ...assertion.userHandle ? { userHandle: this.bufferToBase64url(assertion.userHandle) } : {}
        }
      }
    });
    return this.handleAuthCompletion(res);
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
      ...chainId != null ? { chainId } : {},
      ...this.authorizationRequestBody()
    });
  }
  async web3Verify(message, signature, address, chain, walletType) {
    const res = await this.apiPost("/v1/auth/web3/verify", {
      message,
      signature,
      address,
      chain,
      walletType,
      mfaCapable: true
    });
    return this.handleAuthCompletion(res);
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
        return res.user;
      }
    };
  }
  destroy() {
    this.modal?.close();
    this.profile?.close();
    this.profile = null;
    this.session.destroy();
    this.wallet.dispose();
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
    for (const listener of [...this.listeners.get(event) ?? []]) {
      try {
        listener(...args);
      } catch {
      }
    }
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
      this.walletEnabled = branding.walletEnabled !== false;
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
  async autoCreateWallet() {
    try {
      await this.ensureInitialized();
      if (!this.walletEnabled) return;
      await this.wallet.ensure();
    } catch (err) {
      this.emit("walletError", err instanceof AuthonWalletError ? err : new AuthonWalletError("UNKNOWN", err instanceof Error ? err.message : String(err)));
    }
  }
  showBuiltInMagicLinkConfirm(email) {
    if (typeof document === "undefined") return;
    void this.openSignIn().then(() => {
      const modal = this.getModal();
      modal.showMagicLinkConfirm(
        email,
        () => {
          this.confirmMagicLink().then(() => modal.close()).catch((err) => modal.showOverlayError(err instanceof Error ? err.message : String(err)));
        },
        () => {
          this.dismissMagicLink();
          modal.close();
        }
      );
    }).catch(() => void 0);
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
          if (isSignUp) {
            this.signUpWithEmail(email, password, { turnstileToken }).then((result) => {
              if ("needsVerification" in result && result.needsVerification) {
                this.modal?.setSubmitLoading(false);
                this.modal?.showVerificationInput(email, async (code) => {
                  await this.verifyEmail(email, code);
                  this.modal?.close();
                }, async () => {
                  await this.resendVerificationCode(email);
                });
              } else {
                this.modal?.close();
              }
            }).catch((err) => {
              this.modal?.resetTurnstile?.();
              this.modal?.setSubmitLoading(false);
              const msg = err instanceof Error ? err.message : String(err);
              this.modal?.showError(msg || "Authentication failed");
              this.emit("error", err instanceof Error ? err : new Error(msg));
            });
          } else {
            this.signInWithEmail(email, password, turnstileToken).then((result) => {
              if ("needsVerification" in result && result.needsVerification) {
                this.modal?.setSubmitLoading(false);
                this.modal?.showVerificationInput(email, async (code) => {
                  await this.verifyEmail(email, code);
                  this.modal?.close();
                }, async () => {
                  await this.resendVerificationCode(email);
                });
              } else {
                this.modal?.close();
              }
            }).catch((err) => {
              this.modal?.resetTurnstile?.();
              this.modal?.setSubmitLoading(false);
              const msg = err instanceof Error ? err.message : String(err);
              this.modal?.showError(msg || "Authentication failed");
              this.emit("error", err instanceof Error ? err : new Error(msg));
            });
          }
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
      const codeMode = Boolean(this.authorizationContext);
      const pkce = codeMode ? null : await createPkcePair();
      const { url, state } = await this.requestOAuthAuthorization(
        provider,
        "popup",
        pkce ? currentReturnUrl() : void 0,
        pkce?.challenge
      );
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
      const storageKey = handoffKey(state);
      const closePopup = () => {
        try {
          if (popup && !popup.closed) popup.close();
        } catch {
        }
      };
      const resolve = (response) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        closePopup();
        this.handleAuthCompletion(response);
        this.modal?.close();
      };
      const handleError = (msg) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        closePopup();
        this.session.clearSession();
        this.modal?.hideLoading();
        this.modal?.showError(msg);
        this.emit("error", new Error(msg));
      };
      const redeem = async (code) => {
        if (resolved || !pkce) return;
        resolved = true;
        cleanup();
        closePopup();
        try {
          await this.redeemOAuthCode(code, pkce.verifier);
          this.modal?.close();
        } catch (err) {
          if (err instanceof AuthonMfaRequiredError) {
            this.modal?.close();
            return;
          }
          const msg = err instanceof Error ? err.message : String(err);
          this.modal?.hideLoading();
          this.modal?.showError(msg);
          this.emit("error", err instanceof Error ? err : new Error(msg));
        }
      };
      const pollStatus = async () => {
        if (resolved || cleaned) return;
        try {
          const result = await this.apiGet(
            `/v1/auth/oauth/poll?state=${encodeURIComponent(state)}`
          );
          if (result.status === "error") handleError(result.message || "Authentication failed");
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
      const expectedOrigin = new URL(this.config.apiUrl).origin;
      const messageHandler = (e) => {
        if (e.origin !== expectedOrigin || e.source !== popup) return;
        if (codeMode) {
          if (e.data?.type === "authon-oauth-error") {
            handleError("Authentication failed");
            return;
          }
          if (e.data?.type !== "authon-oauth-code") return;
          if (e.data.state !== this.authorizationContext?.options.state) return;
          if (e.data.accessToken || e.data.refreshToken || typeof e.data.authorizationCode !== "string" || !Number.isFinite(e.data.expiresIn) || e.data.expiresIn <= 0 || e.data.expiresIn > 60) return;
          resolve({ authorizationCode: e.data.authorizationCode, state: e.data.state, expiresIn: e.data.expiresIn });
          return;
        }
        if (e.data?.state !== state) return;
        if (e.data?.type === "authon-oauth-error") {
          handleError(typeof e.data.error === "string" ? e.data.error : "Authentication failed");
          return;
        }
        if (e.data?.type === "authon-oauth-pkce" && typeof e.data.code === "string") {
          void redeem(e.data.code);
        }
      };
      window.addEventListener("message", messageHandler);
      const consumeHandoff = (value) => {
        if (!value) return;
        if (value.code) void redeem(value.code);
        else if (value.error) handleError(value.error);
      };
      const storageHandler = (e) => {
        if (e.key !== storageKey || !e.newValue) return;
        consumeHandoff(takeHandoff(state));
      };
      if (!codeMode) {
        window.addEventListener("storage", storageHandler);
        consumeHandoff(takeHandoff(state));
        if (resolved) return;
      }
      const apiPollTimer = setInterval(pollStatus, 1500);
      const visibilityHandler = () => {
        if (document.visibilityState === "visible" && !resolved && !cleaned) {
          if (!codeMode) consumeHandoff(takeHandoff(state));
          void pollStatus();
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);
      const closePollTimer = setInterval(() => {
        if (resolved || cleaned) return;
        try {
          if (popup && popup.closed) {
            clearInterval(closePollTimer);
            void pollStatus();
            setTimeout(() => {
              if (resolved || cleaned) return;
              void pollStatus().then(() => {
                if (resolved || cleaned) return;
                if (codeMode) cleanup();
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
  /**
   * Exchanges a one-time OAuth code from Authon for a session. Requires the verifier generated by
   * the SDK instance that started the flow. A wrong verifier counts as a failed attempt; Authon
   * burns the code after 3. Throws AuthonMfaRequiredError (and emits `mfaRequired`) when the user
   * has MFA enabled; finish with verifyMfa(error.mfaToken, code).
   */
  async redeemOAuthCode(code, codeVerifier) {
    const res = await this.apiPost(
      "/v1/auth/oauth/token",
      { code, codeVerifier }
    );
    if (res.mfaRequired && res.mfaToken) {
      this.emit("mfaRequired", res.mfaToken);
      throw new AuthonMfaRequiredError(res.mfaToken);
    }
    return this.handleAuthCompletion(res);
  }
  normalizeFlowMode(mode) {
    if (mode === "popup" || mode === "redirect" || mode === "auto") {
      return mode;
    }
    return "auto";
  }
  async requestOAuthAuthorization(provider, flowMode, returnTo, codeChallenge) {
    const redirectUri = `${this.config.apiUrl}/v1/auth/oauth/redirect`;
    const params = new URLSearchParams({
      redirectUri,
      flow: flowMode
    });
    if (returnTo) {
      params.set("returnTo", returnTo);
    }
    if (this.authorizationContext) {
      params.set("authorizationRequestId", this.authorizationContext.requestId);
    } else if (codeChallenge) {
      params.set("codeChallenge", codeChallenge);
      params.set("codeChallengeMethod", "S256");
    }
    return this.apiGet(
      `/v1/auth/oauth/${provider}/url?${params.toString()}`
    );
  }
  async startRedirectOAuthFlow(provider) {
    const pkce = this.authorizationContext ? null : await createPkcePair();
    const { url, state } = await this.requestOAuthAuthorization(
      provider,
      "redirect",
      pkce ? currentReturnUrl() : window.location.href,
      pkce?.challenge
    );
    if (pkce) saveRedirectVerifier(state, pkce.verifier);
    window.location.assign(url);
  }
  /** Pending redirect sign-in started from this tab, if the page was opened with its result. */
  oauthRedirectResult = null;
  consumeRedirectResultFromUrl() {
    if (typeof window === "undefined") return;
    let currentUrl;
    try {
      currentUrl = new URL(window.location.href);
    } catch {
      return;
    }
    pruneHandoffs();
    const code = currentUrl.searchParams.get(OAUTH_CODE_PARAM);
    const state = currentUrl.searchParams.get(OAUTH_STATE_PARAM);
    const explicitError = currentUrl.searchParams.get(OAUTH_ERROR_PARAM);
    const fromPopup = currentUrl.searchParams.get(OAUTH_POPUP_PARAM) === "1";
    if (!code && !state && !explicitError) return;
    for (const param of [OAUTH_CODE_PARAM, OAUTH_STATE_PARAM, OAUTH_ERROR_PARAM, OAUTH_POPUP_PARAM]) {
      currentUrl.searchParams.delete(param);
    }
    window.history.replaceState({}, "", currentUrl.toString());
    if (fromPopup && state) {
      writeHandoff(state, code ? { code } : { error: explicitError || "Authentication failed" });
      try {
        window.close();
      } catch {
      }
      return;
    }
    if (code && state) {
      const verifier = takeRedirectVerifier(state);
      if (verifier) {
        this.oauthRedirectResult = this.redeemOAuthCode(code, verifier).catch((err) => {
          if (!(err instanceof AuthonMfaRequiredError)) {
            this.emit("error", err instanceof Error ? err : new Error(String(err)));
          }
          return null;
        });
        return;
      }
      void this.apiPost("/v1/auth/oauth/token", { code, codeVerifier: generateCodeVerifier() }).catch(() => void 0);
      return;
    }
    if (explicitError) {
      if (state) takeRedirectVerifier(state);
      this.emit("error", new Error(explicitError));
    }
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
  // ── Magic link helpers ──
  /** Current page (without hash or magic link params) as the link target, when this instance handles links. */
  magicLinkReturnUrl() {
    if (typeof window === "undefined") return void 0;
    if (this.config.sessionMode !== "browser" || !this.config.autoHandleMagicLink || this.authorizationContext) {
      return void 0;
    }
    try {
      const url = new URL(window.location.href);
      if (url.protocol !== "https:" && url.protocol !== "http:") return void 0;
      url.hash = "";
      url.searchParams.delete("token");
      url.searchParams.delete(MAGIC_LINK_PARAM);
      const full = url.toString();
      return full.length <= 2048 ? full : `${url.origin}${url.pathname}`.slice(0, 2048);
    } catch {
      return void 0;
    }
  }
  magicLinkRequestKey(token) {
    return `${this.config.apiUrl}|${this.publishableKey}|${token}`;
  }
  sharedMagicLinkRequest(key, body) {
    let pending = magicLinkResponses.get(key);
    if (!pending) {
      pending = this.apiPost("/v1/auth/passwordless/verify", { ...body, mfaCapable: true });
      magicLinkResponses.set(key, pending);
      pending.catch(() => void 0);
    }
    return pending;
  }
  magicLinkNonceKey() {
    return `${MAGIC_LINK_NONCE_KEY}${this.config.apiUrl}|${this.publishableKey}`;
  }
  /**
   * New random value for a link request, kept in this origin's localStorage (shared by its tabs, so
   * the link may open in a new tab). Null when there is no browser storage; such links always ask
   * for confirmation.
   */
  createMagicLinkNonce() {
    if (typeof window === "undefined" || this.config.sessionMode !== "browser") return null;
    try {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      let binary = "";
      for (const byte of bytes) binary += String.fromCharCode(byte);
      const nonce = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      localStorage.setItem(this.magicLinkNonceKey(), nonce);
      return localStorage.getItem(this.magicLinkNonceKey()) === nonce ? nonce : null;
    } catch {
      return null;
    }
  }
  readMagicLinkNonce() {
    try {
      return localStorage.getItem(this.magicLinkNonceKey());
    } catch {
      return null;
    }
  }
  restoreMagicLinkNonce(previous) {
    try {
      if (previous) localStorage.setItem(this.magicLinkNonceKey(), previous);
      else localStorage.removeItem(this.magicLinkNonceKey());
    } catch {
    }
  }
  clearMagicLinkNonce() {
    try {
      localStorage.removeItem(this.magicLinkNonceKey());
    } catch {
    }
  }
  /**
   * Read a magic link token from the URL (fragment form first, then the older query form) and
   * remove it from the address bar and history right away, before any request is made.
   */
  takeMagicLinkTokenFromUrl() {
    if (typeof window === "undefined") return null;
    let url;
    try {
      url = new URL(window.location.href);
    } catch {
      return null;
    }
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const inHash = hash.get(MAGIC_LINK_PARAM) === "1";
    const inQuery = url.searchParams.get(MAGIC_LINK_PARAM) === "1";
    if (!inHash && !inQuery) return null;
    const token = (inHash ? hash.get("token") : null) || (inQuery ? url.searchParams.get("token") : null);
    if (inQuery) {
      url.searchParams.delete("token");
      url.searchParams.delete(MAGIC_LINK_PARAM);
    }
    if (inHash) {
      hash.delete("token");
      hash.delete(MAGIC_LINK_PARAM);
      const rest = hash.toString();
      url.hash = rest ? `#${rest}` : "";
    }
    try {
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
    }
    return token || null;
  }
  /**
   * Page-load handling. The link finishes silently only when this browser holds the value sent with
   * the request and nobody is signed in; otherwise it is left unused and the app is asked to confirm.
   * That stops a link someone else requested (for their own account) from signing this browser in.
   */
  consumeMagicLinkFromUrl() {
    const pageKey = `${this.config.apiUrl}|${this.publishableKey}`;
    const fromUrl = this.takeMagicLinkTokenFromUrl();
    const token = fromUrl ?? pageMagicLinkTokens.get(pageKey) ?? null;
    if (!token) return Promise.resolve(null);
    const key = `${this.magicLinkRequestKey(token)}|load`;
    let pending = magicLinkResponses.get(key);
    if (!pending) {
      pageMagicLinkTokens.set(pageKey, token);
      pending = (async () => {
        try {
          await this.session.waitUntilReady();
        } catch {
        }
        const signedIn = this.session.getUser() !== null;
        const browserNonce = signedIn ? null : this.readMagicLinkNonce();
        const res = await this.apiPost("/v1/auth/passwordless/verify", {
          token,
          requireBrowserBinding: true,
          mfaCapable: true,
          ...browserNonce ? { browserNonce } : {}
        });
        if (isMagicLinkConfirmation(res)) return { ...res, reason: signedIn ? "signed_in" : "unrecognized_browser" };
        return res;
      })();
      magicLinkResponses.set(key, pending);
      pending.catch(() => void 0).finally(() => {
        if (pageMagicLinkTokens.get(pageKey) === token) pageMagicLinkTokens.delete(pageKey);
      });
    }
    return pending.then((res) => {
      if (isMagicLinkConfirmation(res)) {
        const reason = res.reason ?? "unrecognized_browser";
        this.pendingMagicLink = { token, email: res.email, reason };
        this.emit("magicLinkConfirmationRequired", { email: res.email, reason });
        if (!this.listeners.get("magicLinkConfirmationRequired")?.size) this.showBuiltInMagicLinkConfirm(res.email);
        return null;
      }
      this.clearMagicLinkNonce();
      return this.handleAuthCompletion(res);
    }).catch((err) => {
      if (!(err instanceof AuthonMfaRequiredError)) {
        this.emit("error", err instanceof Error ? err : new Error(String(err)));
      }
      return null;
    });
  }
  // ── WebAuthn helpers ──
  /** Authon returns WebAuthn options at the top level; very old servers wrapped them in `options`. */
  unwrapWebAuthnOptions(raw) {
    if (raw && typeof raw.challenge !== "string" && raw.options && typeof raw.options === "object") {
      return raw.options;
    }
    return raw;
  }
  credentialBase(credential) {
    let clientExtensionResults = {};
    try {
      clientExtensionResults = credential.getClientExtensionResults?.() ?? {};
    } catch {
      clientExtensionResults = {};
    }
    const attachment = credential.authenticatorAttachment;
    return {
      id: credential.id,
      rawId: this.bufferToBase64url(credential.rawId),
      type: credential.type,
      clientExtensionResults,
      ...attachment ? { authenticatorAttachment: attachment } : {}
    };
  }
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
  AuthonWalletError,
  MAGIC_LINK_PARAM,
  ProfileRenderer,
  WalletClient,
  generateQrSvg,
  getProviderButtonConfig,
  getStrings,
  safeHttpUrl,
  safeImageDataUrl,
  translations
});
//# sourceMappingURL=index.cjs.map