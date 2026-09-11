import type { WebAppInitData } from './web-app.types';

/**
 * The only fields in `WebAppInitData` that require any real parsing (JSON
 * decoding for `user`/`receiver`/`chat`, numeric decoding for
 * `can_send_after`) and can therefore turn out to be malformed. Every other
 * optional field is a plain string with nothing to fail. `hash` and
 * `auth_date` are required, so a problem there fails the whole parse instead
 * of producing a warning — see `parseInitData`.
 */
export interface InitDataFieldWarning {
  field: 'user' | 'receiver' | 'chat' | 'can_send_after';
  reason: string;
}

/**
 * What `parseInitData`/`getInitData` return on success. `data` is always
 * a complete, valid `WebAppInitData` — any optional field that failed to
 * parse is simply missing from it, and shows up in `warnings` instead of
 * being silently indistinguishable from "this launch never had it".
 */
export interface ParsedInitData {
  data: WebAppInitData;
  warnings: InitDataFieldWarning[];
}
