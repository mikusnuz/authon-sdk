export { AuthonBackend } from './authon';
export { expressMiddleware, fastifyPlugin } from './middleware';
export type { AuthonMiddlewareOptions } from './middleware';
export type {
  Web3Chain,
  Web3Wallet,
  Web3WalletType,
  Web3NonceResponse,
  PasskeyCredential,
  PasswordlessResult,
  AuditLogEntry,
  AuditLogQueryParams,
  AuditLogListResponse,
  AuditLogStats,
  JwtClaimMapping,
  JwtTemplate,
  CreateJwtTemplateParams,
  UpdateJwtTemplateParams,
  JwtPreviewResponse,
} from '@authon/shared';
export { AUDIT_EVENTS } from '@authon/shared';
