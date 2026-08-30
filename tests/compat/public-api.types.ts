import type {
  AuditLogEntry,
  AuditLogListResponse,
  AuditLogQueryParams,
  AuditLogStats,
  AuthonOrganization,
  AuthonProvider,
  AuthonSession,
  AuthonUser,
  AuthTokens,
  BrandingConfig,
  CreateJwtTemplateParams,
  CreateOrganizationParams,
  InviteMemberParams,
  JwtClaimMapping,
  JwtPreviewResponse,
  JwtTemplate,
  MfaSetupResponse,
  MfaStatus,
  MfaVerifyResponse,
  OAuthProviderType,
  OrganizationInvitation,
  OrganizationListResponse,
  OrganizationMember,
  PasskeyCredential,
  PasswordlessResult,
  SessionConfig,
  SessionInfo,
  UpdateJwtTemplateParams,
  UpdateOrganizationParams,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
  WebhookEvent,
  WebhookEventType,
} from '../../packages/shared/src/index';
import type {
  AuthonConfig,
  AuthonEvents,
  AuthonEventType,
  AuthonLocale,
  OAuthFlowMode,
  OAuthSignInOptions,
  OpenSignInOptions,
  ProviderButtonConfig,
  TranslationStrings,
} from '../../packages/js/src/index';
import type {
  AuthonContextValue,
  BrandingState,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  InputProps,
  LinkWalletParams,
  SignInProps,
  SignUpProps,
  SocialButtonProps,
  SocialButtonsProps,
  UseAuthonMfaReturn,
  UseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn,
  UseAuthonSessionsReturn,
  UseAuthonWeb3Return,
  UseOrganizationListReturn,
  UseOrganizationReturn,
  UserButtonProps,
  UserProfileProps,
} from '../../packages/react/src/index';
import type {
  AuthonContextValue as NextAuthonContextValue,
  AuthonMiddlewareOptions,
  LinkWalletParams as NextLinkWalletParams,
  SocialButtonProps as NextSocialButtonProps,
  SocialButtonsProps as NextSocialButtonsProps,
  UseAuthonMfaReturn as NextUseAuthonMfaReturn,
  UseAuthonPasskeysReturn as NextUseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn as NextUseAuthonPasswordlessReturn,
  UseAuthonSessionsReturn as NextUseAuthonSessionsReturn,
  UseAuthonWeb3Return as NextUseAuthonWeb3Return,
  UserProfileProps as NextUserProfileProps,
} from '../../packages/nextjs/src/index';
import type {
  AuthonPluginOptions,
  AuthonState,
  LinkWalletParams as VueLinkWalletParams,
  UseAuthonPasskeysReturn as VueUseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn as VueUseAuthonPasswordlessReturn,
  UseAuthonWeb3Return as VueUseAuthonWeb3Return,
} from '../../packages/vue/src/index';
import type {
  AuthonModuleOptions,
  AuthonNuxtState,
  AuthonPluginState,
  LinkWalletParams as NuxtLinkWalletParams,
  SocialButtonsConfig as NuxtSocialButtonsConfig,
  UseAuthonPasskeysReturn as NuxtUseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn as NuxtUseAuthonPasswordlessReturn,
  UseAuthonWeb3Return as NuxtUseAuthonWeb3Return,
} from '../../packages/nuxt/src/index';
import type {
  AuthonStore,
  PasskeyCredential as SveltePasskeyCredential,
  SocialButtonsOptions,
  Web3Chain as SvelteWeb3Chain,
  Web3NonceResponse as SvelteWeb3NonceResponse,
  Web3Wallet as SvelteWeb3Wallet,
  Web3WalletType as SvelteWeb3WalletType,
} from '../../packages/svelte/src/index';
import type {
  AuthonServiceConfig,
  PasskeyCredential as AngularPasskeyCredential,
  SocialButtonsConfig,
  Web3Chain as AngularWeb3Chain,
  Web3NonceResponse as AngularWeb3NonceResponse,
  Web3Wallet as AngularWeb3Wallet,
  Web3WalletType as AngularWeb3WalletType,
} from '../../packages/angular/src/index';
import type {
  AuthonContextValue as ReactNativeAuthonContextValue,
  AuthonEvents as ReactNativeAuthonEvents,
  AuthonEventType as ReactNativeAuthonEventType,
  AuthonReactNativeConfig,
  AuthState,
  AuthonUser as ReactNativeAuthonUser,
  BrandingConfig as ReactNativeBrandingConfig,
  OAuthCompletedResponse,
  OAuthErrorResponse,
  OAuthFlowMode as ReactNativeOAuthFlowMode,
  OAuthProviderType as ReactNativeOAuthProviderType,
  SignInParams,
  SignUpParams,
  SocialButtonProps as ReactNativeSocialButtonProps,
  SocialButtonsProps as ReactNativeSocialButtonsProps,
  StartOAuthOptions,
  TokenPair,
  UseAuthonPasskeysReturn as ReactNativeUseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn as ReactNativeUseAuthonPasswordlessReturn,
  UseAuthonWeb3Return as ReactNativeUseAuthonWeb3Return,
  Web3LinkWalletParams,
} from '../../packages/react-native/src/index';

type PublicTypes = [
  AuditLogEntry,
  AuditLogListResponse,
  AuditLogQueryParams,
  AuditLogStats,
  AuthonOrganization,
  AuthonProvider,
  AuthonSession,
  AuthonUser,
  AuthTokens,
  BrandingConfig,
  CreateJwtTemplateParams,
  CreateOrganizationParams,
  InviteMemberParams,
  JwtClaimMapping,
  JwtPreviewResponse,
  JwtTemplate,
  MfaSetupResponse,
  MfaStatus,
  MfaVerifyResponse,
  OAuthProviderType,
  OrganizationInvitation,
  OrganizationListResponse,
  OrganizationMember,
  PasskeyCredential,
  PasswordlessResult,
  SessionConfig,
  SessionInfo,
  UpdateJwtTemplateParams,
  UpdateOrganizationParams,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
  WebhookEvent,
  WebhookEventType,
  AuthonConfig,
  AuthonEvents,
  AuthonEventType,
  AuthonLocale,
  OAuthFlowMode,
  OAuthSignInOptions,
  ProviderButtonConfig,
  TranslationStrings,
  AuthonContextValue,
  BrandingState,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  InputProps,
  LinkWalletParams,
  SignInProps,
  SignUpProps,
  SocialButtonProps,
  SocialButtonsProps,
  UseAuthonMfaReturn,
  UseAuthonPasskeysReturn,
  UseAuthonPasswordlessReturn,
  UseAuthonSessionsReturn,
  UseAuthonWeb3Return,
  UseOrganizationListReturn,
  UseOrganizationReturn,
  UserButtonProps,
  UserProfileProps,
  AuthonMiddlewareOptions,
  AuthonPluginOptions,
  AuthonState,
  AuthonModuleOptions,
  AuthonNuxtState,
  AuthonPluginState,
  AuthonStore,
  SocialButtonsOptions,
  AuthonServiceConfig,
  SocialButtonsConfig,
  AuthonReactNativeConfig,
  AuthState,
  OAuthCompletedResponse,
  OAuthErrorResponse,
  SignInParams,
  SignUpParams,
  StartOAuthOptions,
  TokenPair,
  Web3LinkWalletParams,
];

type PublicValues = [
  typeof import('../../packages/shared/src/index'),
  typeof import('../../packages/js/src/index'),
  typeof import('../../packages/react/src/index'),
  typeof import('../../packages/nextjs/src/index'),
  typeof import('../../packages/vue/src/index'),
  typeof import('../../packages/nuxt/src/index'),
  typeof import('../../packages/svelte/src/index'),
  typeof import('../../packages/angular/src/index'),
  typeof import('../../packages/react-native/src/index'),
];

type AdapterEntryPointReexportedTypes = [
  // @authon/nextjs
  NextAuthonContextValue,
  AuthonMiddlewareOptions,
  NextLinkWalletParams,
  NextSocialButtonProps,
  NextSocialButtonsProps,
  NextUseAuthonMfaReturn,
  NextUseAuthonPasskeysReturn,
  NextUseAuthonPasswordlessReturn,
  NextUseAuthonSessionsReturn,
  NextUseAuthonWeb3Return,
  NextUserProfileProps,
  // @authon/vue
  AuthonPluginOptions,
  AuthonState,
  VueLinkWalletParams,
  VueUseAuthonPasskeysReturn,
  VueUseAuthonPasswordlessReturn,
  VueUseAuthonWeb3Return,
  // @authon/nuxt
  AuthonModuleOptions,
  AuthonPluginState,
  NuxtLinkWalletParams,
  NuxtSocialButtonsConfig,
  NuxtUseAuthonPasskeysReturn,
  NuxtUseAuthonPasswordlessReturn,
  NuxtUseAuthonWeb3Return,
  // @authon/svelte
  AuthonStore,
  SveltePasskeyCredential,
  SocialButtonsOptions,
  SvelteWeb3Chain,
  SvelteWeb3NonceResponse,
  SvelteWeb3Wallet,
  SvelteWeb3WalletType,
  // @authon/angular
  AngularPasskeyCredential,
  AuthonServiceConfig,
  SocialButtonsConfig,
  AngularWeb3Chain,
  AngularWeb3NonceResponse,
  AngularWeb3Wallet,
  AngularWeb3WalletType,
  // @authon/react-native
  ReactNativeAuthonContextValue,
  ReactNativeAuthonEvents,
  ReactNativeAuthonEventType,
  AuthonReactNativeConfig,
  AuthState,
  ReactNativeAuthonUser,
  ReactNativeBrandingConfig,
  OAuthCompletedResponse,
  OAuthErrorResponse,
  ReactNativeOAuthFlowMode,
  ReactNativeOAuthProviderType,
  SignInParams,
  SignUpParams,
  ReactNativeSocialButtonProps,
  ReactNativeSocialButtonsProps,
  StartOAuthOptions,
  TokenPair,
  ReactNativeUseAuthonPasskeysReturn,
  ReactNativeUseAuthonPasswordlessReturn,
  ReactNativeUseAuthonWeb3Return,
  Web3LinkWalletParams,
];

export type AuthonPublicApiCompatibilityFixture = {
  types: PublicTypes;
  values: PublicValues;
  adapterEntryPointReexports: AdapterEntryPointReexportedTypes;
};

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2)
    ? true
    : false;
type Expect<Value extends true> = Value;
type HasShape<Value, Shape> = Value extends Shape ? true : false;

// Shared data contracts used by every framework adapter.
type SharedUserIdentityContract = Expect<Equal<
  Pick<AuthonUser, 'id' | 'email' | 'displayName' | 'publicMetadata'>,
  {
    id: string;
    email: string | null;
    displayName: string | null;
    publicMetadata: Record<string, unknown> | null;
  }
>>;
type SharedTokenContract = Expect<Equal<
  Pick<AuthTokens, 'accessToken' | 'refreshToken' | 'expiresIn' | 'user'>,
  {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthonUser;
  }
>>;

// Core browser SDK constructor, configuration, and event callback contracts.
type CoreConstructorContract = Expect<Equal<
  ConstructorParameters<typeof import('../../packages/js/src/index').Authon>,
  [publishableKey: string, config?: AuthonConfig]
>>;
type CoreConfigContract = Expect<Equal<
  Pick<AuthonConfig, 'apiUrl' | 'mode' | 'theme' | 'locale'>,
  {
    apiUrl?: string;
    mode?: 'popup' | 'embedded';
    theme?: 'light' | 'dark' | 'auto';
    locale?: string;
  }
>>;
type CoreSignedInEventContract = Expect<Equal<
  AuthonEvents['signedIn'],
  (user: AuthonUser) => void
>>;
type CoreErrorEventContract = Expect<Equal<AuthonEvents['error'], (error: Error) => void>>;
type CoreSessionMethodsContract = Expect<Equal<
  Pick<
    InstanceType<typeof import('../../packages/js/src/index').Authon>,
    'getToken' | 'getUser' | 'signOut'
  >,
  {
    getToken: () => string | null;
    getUser: () => AuthonUser | null;
    signOut: () => Promise<void>;
  }
>>;

// React and Next.js documented provider, hook, middleware, and server helpers.
type ReactProviderProps = Parameters<
  typeof import('../../packages/react/src/index').AuthonProvider
>[0];
type ReactProviderContract = Expect<HasShape<
  ReactProviderProps,
  { publishableKey: string; config?: Omit<AuthonConfig, 'mode'> }
>>;
type ReactHookContract = Expect<Equal<
  ReturnType<typeof import('../../packages/react/src/index').useAuthon>,
  AuthonContextValue
>>;
type ReactContextActionsContract = Expect<Equal<
  Pick<AuthonContextValue, 'signOut' | 'openSignIn' | 'openSignUp' | 'getToken'>,
  {
    signOut: () => Promise<void>;
    openSignIn: (options?: OpenSignInOptions) => Promise<void>;
    openSignUp: (options?: OpenSignInOptions) => Promise<void>;
    getToken: () => string | null;
  }
>>;
type NextMiddlewareOptionsContract = Expect<Equal<
  Parameters<typeof import('../../packages/nextjs/src/index').authonMiddleware>[0],
  AuthonMiddlewareOptions | undefined
>>;
type NextMiddlewareResponseContract = Expect<HasShape<
  Awaited<ReturnType<ReturnType<typeof import('../../packages/nextjs/src/index').authonMiddleware>>>,
  Response
>>;
type NextCurrentUserContract = Expect<Equal<
  ReturnType<typeof import('../../packages/nextjs/src/server').currentUser>,
  Promise<AuthonUser | null>
>>;
type NextAuthContract = Expect<HasShape<
  Awaited<ReturnType<typeof import('../../packages/nextjs/src/server').auth>>,
  {
    userId: string | null;
    user: AuthonUser | null;
    getToken: () => string | null;
  }
>>;

// Vue and Nuxt installation/composable contracts.
type VuePluginInputContract = Expect<Equal<
  Parameters<typeof import('../../packages/vue/src/index').createAuthon>,
  [options: AuthonPluginOptions]
>>;
type VuePluginOutputContract = Expect<Equal<
  ReturnType<
    ReturnType<typeof import('../../packages/vue/src/index').createAuthon>['install']
  >,
  void
>>;
type VueComposableContract = Expect<HasShape<
  ReturnType<typeof import('../../packages/vue/src/index').useAuthon>,
  AuthonState & {
    signOut: () => Promise<void>;
    getToken: () => string | null;
  }
>>;
type NuxtModuleInputContract = Expect<HasShape<
  Exclude<Parameters<typeof import('../../packages/nuxt/src/index').authonModule>[0], undefined | false>,
  Partial<AuthonModuleOptions>
>>;
type NuxtComposableContract = Expect<Equal<
  ReturnType<typeof import('../../packages/nuxt/src/index').useAuthon>,
  AuthonNuxtState
>>;
type NuxtPluginContract = Expect<Equal<
  typeof import('../../packages/nuxt/src/index').createAuthonPlugin,
  (
    publishableKey: string,
    config?: Omit<AuthonConfig, 'mode'>,
  ) => AuthonPluginState
>>;

// Svelte store and Angular service/guard contracts.
type SvelteStoreFactoryContract = Expect<Equal<
  typeof import('../../packages/svelte/src/index').createAuthonStore,
  (publishableKey: string, config?: Omit<AuthonConfig, 'mode'>) => AuthonStore
>>;
type SvelteStoreActionsContract = Expect<Equal<
  Pick<AuthonStore, 'signOut' | 'openSignIn' | 'openSignUp' | 'getToken' | 'destroy'>,
  {
    signOut: () => Promise<void>;
    openSignIn: () => Promise<void>;
    openSignUp: () => Promise<void>;
    getToken: () => string | null;
    destroy: () => void;
  }
>>;
type AngularServiceConstructorContract = Expect<Equal<
  ConstructorParameters<typeof import('../../packages/angular/src/index').AuthonService>,
  [config: AuthonServiceConfig]
>>;
type AngularGuardContract = Expect<Equal<
  typeof import('../../packages/angular/src/index').authGuard,
  (
    authonService: import('../../packages/angular/src/index').AuthonService,
    redirectTo?: string,
  ) => boolean | { path: string }
>>;

// React Native client configuration, state, and auth operation contracts.
type ReactNativeClientConstructorContract = Expect<Equal<
  ConstructorParameters<typeof import('../../packages/react-native/src/index').AuthonMobileClient>,
  [config: AuthonReactNativeConfig]
>>;
type ReactNativeStateContract = Expect<Equal<
  Pick<AuthState, 'isLoaded' | 'isSignedIn' | 'userId' | 'sessionId' | 'accessToken'>,
  {
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string | null;
    sessionId: string | null;
    accessToken: string | null;
  }
>>;
type ReactNativeSignInInputContract = Expect<Equal<
  Parameters<import('../../packages/react-native/src/index').AuthonMobileClient['signIn']>,
  [params: SignInParams]
>>;
type ReactNativeSignInOutputContract = Expect<Equal<
  Awaited<ReturnType<import('../../packages/react-native/src/index').AuthonMobileClient['signIn']>>,
  | { tokens: TokenPair; user: AuthonUser }
  | { needsVerification: true; email: string }
  | { mfaRequired: true; mfaToken: string }
>>;
type ReactNativeOAuthContract = Expect<Equal<
  Parameters<
    import('../../packages/react-native/src/index').AuthonContextValue['startOAuth']
  >,
  [provider: OAuthProviderType, options?: string | StartOAuthOptions]
>>;

export type AuthonDocumentedApiShapeAssertions = [
  SharedUserIdentityContract,
  SharedTokenContract,
  CoreConstructorContract,
  CoreConfigContract,
  CoreSignedInEventContract,
  CoreErrorEventContract,
  CoreSessionMethodsContract,
  ReactProviderContract,
  ReactHookContract,
  ReactContextActionsContract,
  NextMiddlewareOptionsContract,
  NextMiddlewareResponseContract,
  NextCurrentUserContract,
  NextAuthContract,
  VuePluginInputContract,
  VuePluginOutputContract,
  VueComposableContract,
  NuxtModuleInputContract,
  NuxtPluginContract,
  SvelteStoreFactoryContract,
  SvelteStoreActionsContract,
  AngularServiceConstructorContract,
  AngularGuardContract,
  ReactNativeClientConstructorContract,
  ReactNativeStateContract,
  ReactNativeSignInInputContract,
  ReactNativeSignInOutputContract,
  ReactNativeOAuthContract,
];
