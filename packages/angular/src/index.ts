export { AuthonService, AUTHON_CONFIG, type AuthonServiceConfig } from './service';
export { authGuard } from './guard';
export { provideAuthon } from './helpers';
export { renderSocialButtons } from './SocialButtons';
export type { SocialButtonsConfig } from './SocialButtons';
export { AuthonSignInComponent } from './components/sign-in.component';
export { AuthonSignUpComponent } from './components/sign-up.component';
export type {
  PasskeyCredential,
  Web3Chain,
  Web3NonceResponse,
  Web3Wallet,
  Web3WalletType,
} from '@authon/shared';
