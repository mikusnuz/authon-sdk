import { BrandingConfig, AuthonUser, PasskeyCredential, Web3Wallet, OAuthProviderType, MfaSetupResponse, MfaStatus, Web3Chain, Web3WalletType, Web3NonceResponse, SessionInfo, OrganizationListResponse, CreateOrganizationParams, AuthonOrganization, UpdateOrganizationParams, OrganizationMember, InviteMemberParams, OrganizationInvitation } from '@authon/shared';

type OAuthFlowMode = 'auto' | 'popup' | 'redirect';
interface AuthonConfig {
    apiUrl?: string;
    mode?: 'popup' | 'embedded';
    containerId?: string;
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
    appearance?: Partial<BrandingConfig>;
}
interface OAuthSignInOptions {
    flowMode?: OAuthFlowMode;
}
interface AuthonEvents {
    signedIn: (user: AuthonUser) => void;
    signedOut: () => void;
    tokenRefreshed: (token: string) => void;
    mfaRequired: (mfaToken: string) => void;
    passkeyRegistered: (credential: PasskeyCredential) => void;
    web3Connected: (wallet: Web3Wallet) => void;
    error: (error: Error) => void;
}
type AuthonEventType = keyof AuthonEvents;
declare class AuthonMfaRequiredError extends Error {
    readonly mfaToken: string;
    constructor(mfaToken: string);
}

declare class Authon {
    private publishableKey;
    private config;
    private session;
    private modal;
    private listeners;
    private branding;
    private providers;
    private providerFlowModes;
    private initialized;
    private captchaEnabled;
    private turnstileSiteKey;
    constructor(publishableKey: string, config?: AuthonConfig);
    getProviders(): Promise<OAuthProviderType[]>;
    openSignIn(): Promise<void>;
    openSignUp(): Promise<void>;
    /** Update theme at runtime without destroying form state */
    setTheme(theme: 'light' | 'dark' | 'auto'): void;
    signInWithOAuth(provider: OAuthProviderType, options?: OAuthSignInOptions): Promise<void>;
    signInWithEmail(email: string, password: string, turnstileToken?: string): Promise<AuthonUser>;
    signUpWithEmail(email: string, password: string, meta?: {
        displayName?: string;
        turnstileToken?: string;
    }): Promise<AuthonUser>;
    signOut(): Promise<void>;
    getUser(): AuthonUser | null;
    getToken(): string | null;
    on<K extends AuthonEventType>(event: K, listener: AuthonEvents[K]): () => void;
    setupMfa(): Promise<MfaSetupResponse & {
        qrCodeSvg: string;
    }>;
    verifyMfaSetup(code: string): Promise<void>;
    verifyMfa(mfaToken: string, code: string): Promise<AuthonUser>;
    disableMfa(code: string): Promise<void>;
    getMfaStatus(): Promise<MfaStatus>;
    regenerateBackupCodes(code: string): Promise<string[]>;
    sendMagicLink(email: string): Promise<void>;
    sendEmailOtp(email: string): Promise<void>;
    verifyPasswordless(options: {
        token?: string;
        email?: string;
        code?: string;
    }): Promise<AuthonUser>;
    registerPasskey(name?: string): Promise<PasskeyCredential>;
    authenticateWithPasskey(email?: string): Promise<AuthonUser>;
    listPasskeys(): Promise<PasskeyCredential[]>;
    renamePasskey(passkeyId: string, name: string): Promise<PasskeyCredential>;
    revokePasskey(passkeyId: string): Promise<void>;
    web3GetNonce(address: string, chain: Web3Chain, walletType: Web3WalletType, chainId?: number): Promise<Web3NonceResponse>;
    web3Verify(message: string, signature: string, address: string, chain: Web3Chain, walletType: Web3WalletType): Promise<AuthonUser>;
    listWallets(): Promise<Web3Wallet[]>;
    linkWallet(params: {
        address: string;
        chain: Web3Chain;
        walletType: Web3WalletType;
        chainId?: number;
        message: string;
        signature: string;
    }): Promise<Web3Wallet>;
    unlinkWallet(walletId: string): Promise<void>;
    updateProfile(data: {
        displayName?: string;
        avatarUrl?: string;
        phone?: string;
        publicMetadata?: Record<string, unknown>;
    }): Promise<AuthonUser>;
    listSessions(): Promise<SessionInfo[]>;
    revokeSession(sessionId: string): Promise<void>;
    organizations: {
        list: () => Promise<OrganizationListResponse>;
        create: (params: CreateOrganizationParams) => Promise<AuthonOrganization>;
        get: (orgId: string) => Promise<AuthonOrganization>;
        update: (orgId: string, params: UpdateOrganizationParams) => Promise<AuthonOrganization>;
        delete: (orgId: string) => Promise<void>;
        getMembers: (orgId: string) => Promise<OrganizationMember[]>;
        invite: (orgId: string, params: InviteMemberParams) => Promise<OrganizationInvitation>;
        getInvitations: (orgId: string) => Promise<OrganizationInvitation[]>;
        acceptInvitation: (token: string) => Promise<OrganizationMember>;
        rejectInvitation: (token: string) => Promise<void>;
        removeMember: (orgId: string, memberId: string) => Promise<void>;
        updateMemberRole: (orgId: string, memberId: string, role: string) => Promise<OrganizationMember>;
        leave: (orgId: string) => Promise<void>;
    };
    /** Testing utilities — only available when initialized with a pk_test_ key */
    get testing(): {
        signIn(params: {
            email: string;
            nickname?: string;
        }): Promise<AuthonUser>;
    } | undefined;
    destroy(): void;
    private loadTurnstileScript;
    private emit;
    private ensureInitialized;
    private getModal;
    private startOAuthFlow;
    private normalizeFlowMode;
    private requestOAuthAuthorization;
    private startRedirectOAuthFlow;
    private consumeRedirectResultFromUrl;
    private apiGet;
    private apiPost;
    private apiPostAuth;
    private apiGetAuth;
    private apiPatchAuth;
    private apiDeleteAuth;
    private getWalletAddress;
    private requestWalletSignature;
    private bufferToBase64url;
    private base64urlToBuffer;
    private deserializeCreationOptions;
    private deserializeRequestOptions;
    private parseApiError;
}

interface ProviderButtonConfig {
    provider: OAuthProviderType;
    label: string;
    bgColor: string;
    textColor: string;
    iconSvg: string;
}
declare function getProviderButtonConfig(provider: OAuthProviderType): ProviderButtonConfig;

/**
 * Minimal QR Code SVG generator — byte mode, EC Level L, versions 1–13.
 * Zero dependencies. Produces a standalone SVG string.
 */
declare function generateQrSvg(text: string, moduleSize?: number): string;

type AuthonLocale = keyof typeof translations;
declare const translations: {
    readonly en: {
        readonly welcomeBack: "Welcome back";
        readonly createAccount: "Create your account";
        readonly alreadyHaveAccount: "Already have an account?";
        readonly dontHaveAccount: "Don't have an account?";
        readonly signIn: "Sign in";
        readonly signUp: "Sign up";
        readonly or: "or";
        readonly emailAddress: "Email address";
        readonly password: "Password";
        readonly passwordHint: "Must contain uppercase, lowercase, and a number (min 8 chars)";
        readonly continueWith: "Continue with";
        readonly connectWallet: "Connect Wallet";
        readonly magicLink: "Continue with Magic Link";
        readonly passkey: "Sign in with Passkey";
        readonly securedBy: "Secured by";
        readonly backToSignIn: "Back to sign in";
    };
    readonly ko: {
        readonly welcomeBack: "다시 오신 걸 환영합니다";
        readonly createAccount: "계정 만들기";
        readonly alreadyHaveAccount: "이미 계정이 있으신가요?";
        readonly dontHaveAccount: "계정이 없으신가요?";
        readonly signIn: "로그인";
        readonly signUp: "회원가입";
        readonly or: "또는";
        readonly emailAddress: "이메일 주소";
        readonly password: "비밀번호";
        readonly passwordHint: "대문자, 소문자, 숫자 포함 (최소 8자)";
        readonly continueWith: "(으)로 계속하기";
        readonly connectWallet: "지갑 연결";
        readonly magicLink: "매직 링크로 계속하기";
        readonly passkey: "패스키로 로그인";
        readonly securedBy: "보안 제공";
        readonly backToSignIn: "로그인으로 돌아가기";
    };
    readonly ja: {
        readonly welcomeBack: "おかえりなさい";
        readonly createAccount: "アカウントを作成";
        readonly alreadyHaveAccount: "すでにアカウントをお持ちですか？";
        readonly dontHaveAccount: "アカウントをお持ちでないですか？";
        readonly signIn: "ログイン";
        readonly signUp: "新規登録";
        readonly or: "または";
        readonly emailAddress: "メールアドレス";
        readonly password: "パスワード";
        readonly passwordHint: "大文字、小文字、数字を含む（8文字以上）";
        readonly continueWith: "で続行";
        readonly connectWallet: "ウォレット接続";
        readonly magicLink: "マジックリンクで続行";
        readonly passkey: "パスキーでログイン";
        readonly securedBy: "セキュリティ提供";
        readonly backToSignIn: "ログインに戻る";
    };
    readonly 'zh-CN': {
        readonly welcomeBack: "欢迎回来";
        readonly createAccount: "创建账户";
        readonly alreadyHaveAccount: "已有账户？";
        readonly dontHaveAccount: "没有账户？";
        readonly signIn: "登录";
        readonly signUp: "注册";
        readonly or: "或";
        readonly emailAddress: "邮箱地址";
        readonly password: "密码";
        readonly passwordHint: "需包含大写、小写字母和数字（至少8位）";
        readonly continueWith: "继续使用";
        readonly connectWallet: "连接钱包";
        readonly magicLink: "使用魔法链接继续";
        readonly passkey: "使用通行密钥登录";
        readonly securedBy: "安全保障";
        readonly backToSignIn: "返回登录";
    };
    readonly 'zh-TW': {
        readonly welcomeBack: "歡迎回來";
        readonly createAccount: "建立帳戶";
        readonly alreadyHaveAccount: "已有帳戶？";
        readonly dontHaveAccount: "沒有帳戶？";
        readonly signIn: "登入";
        readonly signUp: "註冊";
        readonly or: "或";
        readonly emailAddress: "電子郵件";
        readonly password: "密碼";
        readonly passwordHint: "需包含大寫、小寫字母和數字（至少8位）";
        readonly continueWith: "繼續使用";
        readonly connectWallet: "連接錢包";
        readonly magicLink: "使用魔法連結繼續";
        readonly passkey: "使用通行金鑰登入";
        readonly securedBy: "安全保障";
        readonly backToSignIn: "返回登入";
    };
    readonly 'pt-BR': {
        readonly welcomeBack: "Bem-vindo de volta";
        readonly createAccount: "Crie sua conta";
        readonly alreadyHaveAccount: "Ja tem uma conta?";
        readonly dontHaveAccount: "Nao tem uma conta?";
        readonly signIn: "Entrar";
        readonly signUp: "Cadastrar";
        readonly or: "ou";
        readonly emailAddress: "Endereco de e-mail";
        readonly password: "Senha";
        readonly passwordHint: "Deve conter maiusculas, minusculas e numeros (min 8 caracteres)";
        readonly continueWith: "Continuar com";
        readonly connectWallet: "Conectar carteira";
        readonly magicLink: "Continuar com Magic Link";
        readonly passkey: "Entrar com Passkey";
        readonly securedBy: "Protegido por";
        readonly backToSignIn: "Voltar ao login";
    };
    readonly es: {
        readonly welcomeBack: "Bienvenido de nuevo";
        readonly createAccount: "Crea tu cuenta";
        readonly alreadyHaveAccount: "Ya tienes una cuenta?";
        readonly dontHaveAccount: "No tienes una cuenta?";
        readonly signIn: "Iniciar sesion";
        readonly signUp: "Registrarse";
        readonly or: "o";
        readonly emailAddress: "Correo electronico";
        readonly password: "Contrasena";
        readonly passwordHint: "Debe contener mayusculas, minusculas y numeros (min 8 caracteres)";
        readonly continueWith: "Continuar con";
        readonly connectWallet: "Conectar billetera";
        readonly magicLink: "Continuar con Magic Link";
        readonly passkey: "Iniciar con Passkey";
        readonly securedBy: "Protegido por";
        readonly backToSignIn: "Volver al inicio de sesion";
    };
    readonly de: {
        readonly welcomeBack: "Willkommen zuruck";
        readonly createAccount: "Konto erstellen";
        readonly alreadyHaveAccount: "Bereits ein Konto?";
        readonly dontHaveAccount: "Noch kein Konto?";
        readonly signIn: "Anmelden";
        readonly signUp: "Registrieren";
        readonly or: "oder";
        readonly emailAddress: "E-Mail-Adresse";
        readonly password: "Passwort";
        readonly passwordHint: "Gross-/Kleinbuchstaben und Zahl erforderlich (mind. 8 Zeichen)";
        readonly continueWith: "Weiter mit";
        readonly connectWallet: "Wallet verbinden";
        readonly magicLink: "Weiter mit Magic Link";
        readonly passkey: "Mit Passkey anmelden";
        readonly securedBy: "Gesichert durch";
        readonly backToSignIn: "Zuruck zur Anmeldung";
    };
    readonly fr: {
        readonly welcomeBack: "Bon retour";
        readonly createAccount: "Creez votre compte";
        readonly alreadyHaveAccount: "Vous avez deja un compte ?";
        readonly dontHaveAccount: "Vous n'avez pas de compte ?";
        readonly signIn: "Se connecter";
        readonly signUp: "S'inscrire";
        readonly or: "ou";
        readonly emailAddress: "Adresse e-mail";
        readonly password: "Mot de passe";
        readonly passwordHint: "Doit contenir majuscules, minuscules et chiffres (min 8 caracteres)";
        readonly continueWith: "Continuer avec";
        readonly connectWallet: "Connecter le portefeuille";
        readonly magicLink: "Continuer avec Magic Link";
        readonly passkey: "Se connecter avec Passkey";
        readonly securedBy: "Securise par";
        readonly backToSignIn: "Retour a la connexion";
    };
    readonly hi: {
        readonly welcomeBack: "वापसी पर स्वागत है";
        readonly createAccount: "अपना खाता बनाएं";
        readonly alreadyHaveAccount: "पहले से खाता है?";
        readonly dontHaveAccount: "खाता नहीं है?";
        readonly signIn: "साइन इन";
        readonly signUp: "साइन अप";
        readonly or: "या";
        readonly emailAddress: "ईमेल पता";
        readonly password: "पासवर्ड";
        readonly passwordHint: "बड़े, छोटे अक्षर और संख्या आवश्यक (कम से कम 8 अक्षर)";
        readonly continueWith: "से जारी रखें";
        readonly connectWallet: "वॉलेट कनेक्ट करें";
        readonly magicLink: "मैजिक लिंक से जारी रखें";
        readonly passkey: "पासकी से साइन इन";
        readonly securedBy: "सुरक्षा प्रदाता";
        readonly backToSignIn: "साइन इन पर वापस जाएं";
    };
    readonly tr: {
        readonly welcomeBack: "Tekrar hos geldiniz";
        readonly createAccount: "Hesap olusturun";
        readonly alreadyHaveAccount: "Zaten bir hesabiniz var mi?";
        readonly dontHaveAccount: "Hesabiniz yok mu?";
        readonly signIn: "Giris yap";
        readonly signUp: "Kaydol";
        readonly or: "veya";
        readonly emailAddress: "E-posta adresi";
        readonly password: "Sifre";
        readonly passwordHint: "Buyuk, kucuk harf ve rakam icermeli (en az 8 karakter)";
        readonly continueWith: "ile devam et";
        readonly connectWallet: "Cuzdan bagla";
        readonly magicLink: "Magic Link ile devam et";
        readonly passkey: "Passkey ile giris yap";
        readonly securedBy: "Guvenlik saglayici";
        readonly backToSignIn: "Girise don";
    };
    readonly id: {
        readonly welcomeBack: "Selamat datang kembali";
        readonly createAccount: "Buat akun Anda";
        readonly alreadyHaveAccount: "Sudah punya akun?";
        readonly dontHaveAccount: "Belum punya akun?";
        readonly signIn: "Masuk";
        readonly signUp: "Daftar";
        readonly or: "atau";
        readonly emailAddress: "Alamat email";
        readonly password: "Kata sandi";
        readonly passwordHint: "Harus mengandung huruf besar, kecil, dan angka (min 8 karakter)";
        readonly continueWith: "Lanjutkan dengan";
        readonly connectWallet: "Hubungkan dompet";
        readonly magicLink: "Lanjutkan dengan Magic Link";
        readonly passkey: "Masuk dengan Passkey";
        readonly securedBy: "Diamankan oleh";
        readonly backToSignIn: "Kembali ke login";
    };
    readonly vi: {
        readonly welcomeBack: "Chao mung tro lai";
        readonly createAccount: "Tao tai khoan";
        readonly alreadyHaveAccount: "Da co tai khoan?";
        readonly dontHaveAccount: "Chua co tai khoan?";
        readonly signIn: "Dang nhap";
        readonly signUp: "Dang ky";
        readonly or: "hoac";
        readonly emailAddress: "Dia chi email";
        readonly password: "Mat khau";
        readonly passwordHint: "Can chu hoa, chu thuong va so (toi thieu 8 ky tu)";
        readonly continueWith: "Tiep tuc voi";
        readonly connectWallet: "Ket noi vi";
        readonly magicLink: "Tiep tuc voi Magic Link";
        readonly passkey: "Dang nhap voi Passkey";
        readonly securedBy: "Bao mat boi";
        readonly backToSignIn: "Quay lai dang nhap";
    };
    readonly th: {
        readonly welcomeBack: "ยินดีต้อนรับกลับ";
        readonly createAccount: "สร้างบัญชี";
        readonly alreadyHaveAccount: "มีบัญชีอยู่แล้ว?";
        readonly dontHaveAccount: "ยังไม่มีบัญชี?";
        readonly signIn: "เข้าสู่ระบบ";
        readonly signUp: "สมัครสมาชิก";
        readonly or: "หรือ";
        readonly emailAddress: "อีเมล";
        readonly password: "รหัสผ่าน";
        readonly passwordHint: "ต้องมีตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และตัวเลข (อย่างน้อย 8 ตัว)";
        readonly continueWith: "ดำเนินการต่อด้วย";
        readonly connectWallet: "เชื่อมต่อกระเป๋า";
        readonly magicLink: "ดำเนินการต่อด้วย Magic Link";
        readonly passkey: "เข้าสู่ระบบด้วย Passkey";
        readonly securedBy: "รักษาความปลอดภัยโดย";
        readonly backToSignIn: "กลับไปเข้าสู่ระบบ";
    };
    readonly ru: {
        readonly welcomeBack: "С возвращением";
        readonly createAccount: "Создайте аккаунт";
        readonly alreadyHaveAccount: "Уже есть аккаунт?";
        readonly dontHaveAccount: "Нет аккаунта?";
        readonly signIn: "Войти";
        readonly signUp: "Зарегистрироваться";
        readonly or: "или";
        readonly emailAddress: "Электронная почта";
        readonly password: "Пароль";
        readonly passwordHint: "Заглавные, строчные буквы и цифры (мин. 8 символов)";
        readonly continueWith: "Продолжить с";
        readonly connectWallet: "Подключить кошелек";
        readonly magicLink: "Продолжить с Magic Link";
        readonly passkey: "Войти с Passkey";
        readonly securedBy: "Защищено";
        readonly backToSignIn: "Вернуться к входу";
    };
    readonly it: {
        readonly welcomeBack: "Bentornato";
        readonly createAccount: "Crea il tuo account";
        readonly alreadyHaveAccount: "Hai gia un account?";
        readonly dontHaveAccount: "Non hai un account?";
        readonly signIn: "Accedi";
        readonly signUp: "Registrati";
        readonly or: "o";
        readonly emailAddress: "Indirizzo email";
        readonly password: "Password";
        readonly passwordHint: "Deve contenere maiuscole, minuscole e numeri (min 8 caratteri)";
        readonly continueWith: "Continua con";
        readonly connectWallet: "Connetti portafoglio";
        readonly magicLink: "Continua con Magic Link";
        readonly passkey: "Accedi con Passkey";
        readonly securedBy: "Protetto da";
        readonly backToSignIn: "Torna all'accesso";
    };
    readonly pl: {
        readonly welcomeBack: "Witaj ponownie";
        readonly createAccount: "Utworz konto";
        readonly alreadyHaveAccount: "Masz juz konto?";
        readonly dontHaveAccount: "Nie masz konta?";
        readonly signIn: "Zaloguj sie";
        readonly signUp: "Zarejestruj sie";
        readonly or: "lub";
        readonly emailAddress: "Adres e-mail";
        readonly password: "Haslo";
        readonly passwordHint: "Wielkie, male litery i cyfry (min 8 znakow)";
        readonly continueWith: "Kontynuuj z";
        readonly connectWallet: "Polacz portfel";
        readonly magicLink: "Kontynuuj z Magic Link";
        readonly passkey: "Zaloguj sie z Passkey";
        readonly securedBy: "Zabezpieczone przez";
        readonly backToSignIn: "Powrot do logowania";
    };
    readonly nl: {
        readonly welcomeBack: "Welkom terug";
        readonly createAccount: "Maak je account aan";
        readonly alreadyHaveAccount: "Heb je al een account?";
        readonly dontHaveAccount: "Nog geen account?";
        readonly signIn: "Inloggen";
        readonly signUp: "Registreren";
        readonly or: "of";
        readonly emailAddress: "E-mailadres";
        readonly password: "Wachtwoord";
        readonly passwordHint: "Hoofdletters, kleine letters en cijfers vereist (min 8 tekens)";
        readonly continueWith: "Doorgaan met";
        readonly connectWallet: "Portemonnee verbinden";
        readonly magicLink: "Doorgaan met Magic Link";
        readonly passkey: "Inloggen met Passkey";
        readonly securedBy: "Beveiligd door";
        readonly backToSignIn: "Terug naar inloggen";
    };
    readonly ar: {
        readonly welcomeBack: "مرحبًا بعودتك";
        readonly createAccount: "أنشئ حسابك";
        readonly alreadyHaveAccount: "لديك حساب بالفعل؟";
        readonly dontHaveAccount: "ليس لديك حساب؟";
        readonly signIn: "تسجيل الدخول";
        readonly signUp: "إنشاء حساب";
        readonly or: "أو";
        readonly emailAddress: "البريد الإلكتروني";
        readonly password: "كلمة المرور";
        readonly passwordHint: "يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام (8 أحرف على الأقل)";
        readonly continueWith: "المتابعة باستخدام";
        readonly connectWallet: "ربط المحفظة";
        readonly magicLink: "المتابعة باستخدام Magic Link";
        readonly passkey: "تسجيل الدخول باستخدام Passkey";
        readonly securedBy: "محمي بواسطة";
        readonly backToSignIn: "العودة لتسجيل الدخول";
    };
    readonly sv: {
        readonly welcomeBack: "Valkommen tillbaka";
        readonly createAccount: "Skapa ditt konto";
        readonly alreadyHaveAccount: "Har du redan ett konto?";
        readonly dontHaveAccount: "Har du inget konto?";
        readonly signIn: "Logga in";
        readonly signUp: "Registrera dig";
        readonly or: "eller";
        readonly emailAddress: "E-postadress";
        readonly password: "Losenord";
        readonly passwordHint: "Stora, sma bokstaver och siffror kravs (minst 8 tecken)";
        readonly continueWith: "Fortsatt med";
        readonly connectWallet: "Anslut planbok";
        readonly magicLink: "Fortsatt med Magic Link";
        readonly passkey: "Logga in med Passkey";
        readonly securedBy: "Sakrad av";
        readonly backToSignIn: "Tillbaka till inloggning";
    };
    readonly uk: {
        readonly welcomeBack: "З поверненням";
        readonly createAccount: "Створіть обліковий запис";
        readonly alreadyHaveAccount: "Вже є обліковий запис?";
        readonly dontHaveAccount: "Немає облікового запису?";
        readonly signIn: "Увійти";
        readonly signUp: "Зареєструватися";
        readonly or: "або";
        readonly emailAddress: "Електронна пошта";
        readonly password: "Пароль";
        readonly passwordHint: "Великі, малі літери та цифри (мін. 8 символів)";
        readonly continueWith: "Продовжити з";
        readonly connectWallet: "Підключити гаманець";
        readonly magicLink: "Продовжити з Magic Link";
        readonly passkey: "Увійти з Passkey";
        readonly securedBy: "Захищено";
        readonly backToSignIn: "Повернутися до входу";
    };
};
interface TranslationStrings {
    welcomeBack: string;
    createAccount: string;
    alreadyHaveAccount: string;
    dontHaveAccount: string;
    signIn: string;
    signUp: string;
    or: string;
    emailAddress: string;
    password: string;
    passwordHint: string;
    continueWith: string;
    connectWallet: string;
    magicLink: string;
    passkey: string;
    securedBy: string;
    backToSignIn: string;
}
declare function getStrings(locale: string): TranslationStrings;

export { Authon, type AuthonConfig, type AuthonEventType, type AuthonEvents, type AuthonLocale, AuthonMfaRequiredError, type OAuthFlowMode, type OAuthSignInOptions, type ProviderButtonConfig, generateQrSvg, getProviderButtonConfig, getStrings, translations };
