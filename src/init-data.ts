import type { InitDataFieldWarning, ParsedInitData } from './init-data.types';
import { getWebApp } from './web-app';
import type { WebAppChat, WebAppInitData, WebAppUser } from './web-app.types';

/** The result of trying to parse one JSON-encoded, optional object field (`user`, `receiver`, or `chat`). */
interface ObjectFieldResult<T> {
  value?: T;
  warning?: InitDataFieldWarning;
}

/**
 * Decodes a JSON-encoded object field: JSON-parses it, then checks it has
 * every field in `requiredFields`, with the right primitive type. Anything
 * else in the object is trusted as-is, unchecked — this is deliberately not
 * a full schema validator, just enough to catch a broken launch.
 */
function parseObjectField<T>(
  raw: string | null,
  field: InitDataFieldWarning['field'],
  requiredFields: Array<[key: string, type: 'number' | 'string']>,
): ObjectFieldResult<T> {
  if (raw === null) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { warning: { field, reason: 'invalid JSON' } };
  }

  // `typeof null === 'object'`, so this also catches `JSON.parse('null')`
  if (typeof parsed !== 'object' || parsed === null) {
    return { warning: { field, reason: 'not an object' } };
  }

  const candidate = parsed as Record<string, unknown>;
  for (const [key, type] of requiredFields) {
    if (typeof candidate[key] !== type) {
      return { warning: { field, reason: `missing required field "${key}"` } };
    }
  }

  return { value: candidate as T };
}

/** Converts a raw query-string value to a number, rejecting `null`, empty strings, and anything that isn't a clean number (no silent truncation of trailing garbage). */
function parseFiniteNumber(raw: string | null): number {
  if (raw === null || raw === '') return Number.NaN;
  return Number(raw);
}

/**
 * Parses a raw `initData` query string into `WebAppInitData`. Pure and
 * total: never throws, and works on any string, whether it came from
 * `window.Telegram.WebApp.initData` or was sent to a server over the wire.
 *
 * Returns `undefined` only if a *required* field (`hash` or `auth_date`)
 * is missing or unusable — that's not a launch this package can make sense
 * of at all. Any other field that fails to parse is simply left out of
 * `data`, with a matching entry added to `warnings` explaining why, so a
 * "field wasn't there" and a "field was there but broken" don't look the
 * same to the caller.
 */
export function parseInitData(raw: string): ParsedInitData | undefined {
  const params = new URLSearchParams(raw);

  const hash = params.get('hash');
  const authDate = parseFiniteNumber(params.get('auth_date'));

  if (hash === null || !Number.isFinite(authDate)) return undefined;

  const data: WebAppInitData = { hash, auth_date: authDate };
  const warnings: InitDataFieldWarning[] = [];

  // optional numeric field
  const canSendAfterRaw = params.get('can_send_after');
  if (canSendAfterRaw !== null) {
    const canSendAfter = parseFiniteNumber(canSendAfterRaw);
    if (Number.isFinite(canSendAfter)) {
      data.can_send_after = canSendAfter;
    } else {
      warnings.push({ field: 'can_send_after', reason: 'not a valid number' });
    }
  }

  // optional json-encoded object fields
  const userResult = parseObjectField<WebAppUser>(params.get('user'), 'user', [
    ['id', 'number'],
    ['first_name', 'string'],
  ]);
  if (userResult.value) data.user = userResult.value;
  if (userResult.warning) warnings.push(userResult.warning);

  const receiverResult = parseObjectField<WebAppUser>(params.get('receiver'), 'receiver', [
    ['id', 'number'],
    ['first_name', 'string'],
  ]);
  if (receiverResult.value) data.receiver = receiverResult.value;
  if (receiverResult.warning) warnings.push(receiverResult.warning);

  const chatResult = parseObjectField<WebAppChat>(params.get('chat'), 'chat', [
    ['id', 'number'],
    ['type', 'string'],
    ['title', 'string'],
  ]);
  if (chatResult.value) data.chat = chatResult.value;
  if (chatResult.warning) warnings.push(chatResult.warning);

  // optional plain string fields
  const queryId = params.get('query_id');
  if (queryId !== null) data.query_id = queryId;

  const chatType = params.get('chat_type');
  if (chatType !== null) data.chat_type = chatType as WebAppInitData['chat_type'];

  const chatInstance = params.get('chat_instance');
  if (chatInstance !== null) data.chat_instance = chatInstance;

  const startParam = params.get('start_param');
  if (startParam !== null) data.start_param = startParam;

  const signature = params.get('signature');
  if (signature !== null) data.signature = signature;

  return { data, warnings };
}

/** Reads and parses the current launch's `initData`. `undefined` outside Telegram. */
export function getInitData(): ParsedInitData | undefined {
  const webApp = getWebApp();
  return webApp ? parseInitData(webApp.initData) : undefined;
}
