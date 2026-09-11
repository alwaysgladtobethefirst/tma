import type { WebAppInitData } from './web-app.types';

/**
 * What `validateInitData` and `validateInitDataSignature` resolve to.
 * `isValid` is the only thing to branch on for security decisions; `reason`
 * is there to help a developer debug a `false` result (a forged launch and
 * a broken integration look identical as a bare boolean), not something to
 * show a user or treat as anything more precise than a hint.
 */
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

/** Options for `validateInitDataSignature`. */
export interface ValidateSignatureOptions {
  /** Verify against Telegram's test-environment public key instead of production. Defaults to `false`. */
  testEnvironment?: boolean;
}

/**
 * The fields `signInitData` accepts: everything `WebAppInitData` can hold
 * except `hash`, which `signInitData` computes itself. `user`/`receiver`/
 * `chat` are given as real objects here, not pre-JSON-stringified strings —
 * `signInitData` handles that encoding for you.
 */
export type SignableInitDataFields = Omit<Partial<WebAppInitData>, 'hash'>;
