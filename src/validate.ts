import type {
  SignableInitDataFields,
  ValidateSignatureOptions,
  ValidationResult,
} from './validate.types';

/** Telegram's published Ed25519 public keys, as raw 32-byte hex. */
const ED25519_PUBLIC_KEY_HEX = {
  production: 'e7bf03a2fa4602af4580703d88dda5bb59f32ed8b02a56c187fe7d34caed242d',
  test: '40055058a4ee38156a06562e52eece92a771bcd8346a8c4615cb7376eddf72ec',
};

/**
 * Builds the "data-check-string" both verification methods sign/verify:
 * every field in `params` except the ones in `exclude`, sorted alphabetically
 * by key, joined as `key=value` lines separated by `\n`. `prefixLine`, when
 * given, becomes its own first line (the Ed25519 method prepends
 * `"<bot_id>:WebAppData"`; the HMAC method has no prefix).
 */
function buildDataCheckString(
  params: URLSearchParams,
  exclude: string[],
  prefixLine?: string,
): string {
  const pairs = [...params.entries()].filter(([key]) => !exclude.includes(key));
  pairs.sort(([a], [b]) => a.localeCompare(b));

  const lines = pairs.map(([key, value]) => `${key}=${value}`);
  if (prefixLine !== undefined) lines.unshift(prefixLine);

  return lines.join('\n');
}

/** Imports raw bytes as an HMAC-SHA256 key for the given usage(s). */
function importHmacKey(rawKeyBytes: BufferSource, usages: KeyUsage[]): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    rawKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usages,
  );
}

/**
 * Derives the secret key Telegram uses for HMAC validation: the HMAC-SHA256
 * of the bot token, keyed by the constant string `"WebAppData"`.
 */
async function deriveSecretKeyBytes(botToken: string): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const key = await importHmacKey(enc.encode('WebAppData'), ['sign']);
  return crypto.subtle.sign('HMAC', key, enc.encode(botToken));
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^([0-9a-f]{2})*$/i.test(hex)) {
    throw new Error('invalid hex string');
  }
  const pairs = hex.match(/.{2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Decodes a base64url string (the `signature` field's encoding) to raw bytes. Tolerates missing padding. */
function base64UrlToBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Checks a raw `initData` string against your bot's own token, the way the
 * bot itself validates launches: HMAC-SHA256 of the data-check-string,
 * keyed by a secret derived from the bot token.
 *
 * Telegram recommends also checking `auth_date` for staleness — this
 * function deliberately doesn't, since there's no protocol-mandated max
 * age; read `auth_date` back via `parseInitData`/`getInitData` and apply
 * whatever freshness policy makes sense for your bot.
 */
export async function validateInitData(raw: string, botToken: string): Promise<ValidationResult> {
  const params = new URLSearchParams(raw);
  const hash = params.get('hash');
  if (hash === null) return { isValid: false, reason: 'missing hash field' };

  let hashBytes: Uint8Array<ArrayBuffer>;
  try {
    hashBytes = hexToBytes(hash);
  } catch {
    return { isValid: false, reason: 'hash is not valid hex' };
  }

  const dataCheckString = buildDataCheckString(params, ['hash']);

  const secretKeyBytes = await deriveSecretKeyBytes(botToken);
  const verifyKey = await importHmacKey(secretKeyBytes, ['verify']);

  // hmac verify can't really throw on decoded inputs, but diagnostics always flow through the return value
  let isValid: boolean;
  try {
    isValid = await crypto.subtle.verify(
      'HMAC',
      verifyKey,
      hashBytes,
      new TextEncoder().encode(dataCheckString),
    );
  } catch {
    return { isValid: false, reason: 'hash verification failed' };
  }

  return isValid ? { isValid: true } : { isValid: false, reason: 'hash mismatch' };
}

/**
 * Checks a raw `initData` string against Telegram's own Ed25519 public key —
 * the method a third party can use without ever knowing the bot's token,
 * given only the bot's numeric id (the part of the bot token before the
 * `:`, communicated out of band; it isn't present in `initData` itself).
 *
 * Telegram recommends also checking `auth_date` for staleness (worded more
 * strongly here than for the HMAC method) — same reasoning as
 * `validateInitData` for why that isn't built in here.
 */
export async function validateInitDataSignature(
  raw: string,
  botId: number,
  options: ValidateSignatureOptions = {},
): Promise<ValidationResult> {
  const params = new URLSearchParams(raw);
  const signature = params.get('signature');
  if (signature === null) return { isValid: false, reason: 'missing signature field' };

  let signatureBytes: Uint8Array<ArrayBuffer>;
  try {
    signatureBytes = base64UrlToBytes(signature);
  } catch {
    return { isValid: false, reason: 'signature is not valid base64url' };
  }
  if (signatureBytes.length !== 64) {
    return { isValid: false, reason: 'signature is not 64 bytes' };
  }

  const dataCheckString = buildDataCheckString(
    params,
    ['hash', 'signature'],
    `${botId}:WebAppData`,
  );

  const publicKeyHex = options.testEnvironment
    ? ED25519_PUBLIC_KEY_HEX.test
    : ED25519_PUBLIC_KEY_HEX.production;

  // decoded outside the try/catch below: a bad constant here is our bug, not an unsupported runtime
  const publicKeyBytes = hexToBytes(publicKeyHex);

  let publicKey: CryptoKey;
  try {
    publicKey = await crypto.subtle.importKey('raw', publicKeyBytes, { name: 'Ed25519' }, false, [
      'verify',
    ]);
  } catch {
    return { isValid: false, reason: 'Ed25519 is not supported in this runtime' };
  }

  // same as the hmac path: can't really throw, but diagnostics stay in the return value
  let isValid: boolean;
  try {
    isValid = await crypto.subtle.verify(
      { name: 'Ed25519' },
      publicKey,
      signatureBytes,
      new TextEncoder().encode(dataCheckString),
    );
  } catch {
    return { isValid: false, reason: 'signature verification failed' };
  }

  return isValid ? { isValid: true } : { isValid: false, reason: 'signature mismatch' };
}

/**
 * Builds a validly-signed raw `initData` string from plain fields, for
 * testing your own backend's `validateInitData` integration without a real
 * Telegram-issued example. `auth_date` defaults to the current time if you
 * don't give one; `user`/`receiver`/`chat` are JSON-encoded for you.
 */
export async function signInitData(
  fields: SignableInitDataFields,
  botToken: string,
): Promise<string> {
  const params = new URLSearchParams();

  params.set('auth_date', String(fields.auth_date ?? Math.floor(Date.now() / 1000)));
  if (fields.query_id !== undefined) params.set('query_id', fields.query_id);
  if (fields.user !== undefined) params.set('user', JSON.stringify(fields.user));
  if (fields.receiver !== undefined) params.set('receiver', JSON.stringify(fields.receiver));
  if (fields.chat !== undefined) params.set('chat', JSON.stringify(fields.chat));
  if (fields.chat_type !== undefined) params.set('chat_type', fields.chat_type);
  if (fields.chat_instance !== undefined) params.set('chat_instance', fields.chat_instance);
  if (fields.start_param !== undefined) params.set('start_param', fields.start_param);
  if (fields.can_send_after !== undefined)
    params.set('can_send_after', String(fields.can_send_after));
  if (fields.signature !== undefined) params.set('signature', fields.signature);

  const dataCheckString = buildDataCheckString(params, ['hash']);

  const secretKeyBytes = await deriveSecretKeyBytes(botToken);
  const signKey = await importHmacKey(secretKeyBytes, ['sign']);
  const hashBytes = await crypto.subtle.sign(
    'HMAC',
    signKey,
    new TextEncoder().encode(dataCheckString),
  );

  params.set('hash', bytesToHex(new Uint8Array(hashBytes)));
  return params.toString();
}
