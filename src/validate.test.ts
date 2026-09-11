import { describe, expect, it } from 'vitest';
import { signInitData, validateInitData, validateInitDataSignature } from './validate';

function bytesToBase64Url(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Independently computed via Node's own `crypto` module (not this package's
// implementation) — a known-answer fixture, not a self-consistency check.
// See the generating script referenced in the PR/commit for this file.
const FIXTURE_BOT_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11';
const FIXTURE_RAW = new URLSearchParams({
  auth_date: '1700000000',
  query_id: 'AAHtest',
  user: '{"id":123,"first_name":"Test"}',
  hash: '4d403c0bca010c4badc38239b8c91eacc3ab67e3ce5d88ab038e0cd0162fd6c6',
}).toString();

describe('validateInitData', () => {
  it('accepts a correctly signed initData string', async () => {
    await expect(validateInitData(FIXTURE_RAW, FIXTURE_BOT_TOKEN)).resolves.toEqual({
      isValid: true,
    });
  });

  it('rejects when the bot token is wrong', async () => {
    await expect(validateInitData(FIXTURE_RAW, 'wrong:token')).resolves.toEqual({
      isValid: false,
      reason: 'hash mismatch',
    });
  });

  it('rejects when a field was tampered with after signing', async () => {
    const tampered = new URLSearchParams({
      auth_date: '1700000000',
      query_id: 'AAHtampered',
      user: '{"id":123,"first_name":"Test"}',
      hash: '4d403c0bca010c4badc38239b8c91eacc3ab67e3ce5d88ab038e0cd0162fd6c6',
    }).toString();

    await expect(validateInitData(tampered, FIXTURE_BOT_TOKEN)).resolves.toEqual({
      isValid: false,
      reason: 'hash mismatch',
    });
  });

  it('rejects when hash is missing', async () => {
    const raw = new URLSearchParams({ auth_date: '1700000000' }).toString();
    await expect(validateInitData(raw, FIXTURE_BOT_TOKEN)).resolves.toEqual({
      isValid: false,
      reason: 'missing hash field',
    });
  });

  it('rejects when hash is not valid hex', async () => {
    const raw = new URLSearchParams({ auth_date: '1700000000', hash: 'not-hex!' }).toString();
    await expect(validateInitData(raw, FIXTURE_BOT_TOKEN)).resolves.toEqual({
      isValid: false,
      reason: 'hash is not valid hex',
    });
  });
});

// There's no way to test the "correctly signed → isValid: true" path here:
// verification only ever runs against Telegram's own published public keys,
// and we don't have (and can't have) the matching private key. Every other
// branch — the only ones a unit test can actually exercise without a real
// Telegram-issued initData capture — is covered below.
describe('validateInitDataSignature', () => {
  const BOT_ID = 12345678;

  it('rejects when signature is missing', async () => {
    const raw = new URLSearchParams({ auth_date: '1700000000' }).toString();
    await expect(validateInitDataSignature(raw, BOT_ID)).resolves.toEqual({
      isValid: false,
      reason: 'missing signature field',
    });
  });

  it('rejects when signature is not valid base64url', async () => {
    const raw = new URLSearchParams({
      auth_date: '1700000000',
      signature: 'not base64url!!',
    }).toString();

    await expect(validateInitDataSignature(raw, BOT_ID)).resolves.toEqual({
      isValid: false,
      reason: 'signature is not valid base64url',
    });
  });

  it('rejects when the decoded signature is not 64 bytes', async () => {
    const shortSignature = bytesToBase64Url(new TextEncoder().encode('too short'));
    const raw = new URLSearchParams({
      auth_date: '1700000000',
      signature: shortSignature,
    }).toString();

    await expect(validateInitDataSignature(raw, BOT_ID)).resolves.toEqual({
      isValid: false,
      reason: 'signature is not 64 bytes',
    });
  });

  it('rejects a well-formed but incorrect signature', async () => {
    const fakeSignature = bytesToBase64Url(new Uint8Array(64));
    const raw = new URLSearchParams({
      auth_date: '1700000000',
      signature: fakeSignature,
    }).toString();

    await expect(validateInitDataSignature(raw, BOT_ID)).resolves.toEqual({
      isValid: false,
      reason: 'signature mismatch',
    });
  });
});

describe('signInitData', () => {
  it('produces a string validateInitData accepts', async () => {
    const raw = await signInitData(
      { auth_date: 1700000000, user: { id: 1, first_name: 'Ada' } },
      FIXTURE_BOT_TOKEN,
    );

    await expect(validateInitData(raw, FIXTURE_BOT_TOKEN)).resolves.toEqual({ isValid: true });
  });

  it('JSON-encodes user/receiver/chat and preserves auth_date/other fields', async () => {
    const raw = await signInitData(
      {
        auth_date: 1700000000,
        query_id: 'q1',
        user: { id: 1, first_name: 'Ada' },
        chat: { id: 2, type: 'group', title: 'Group' },
      },
      FIXTURE_BOT_TOKEN,
    );

    const params = new URLSearchParams(raw);
    expect(params.get('auth_date')).toBe('1700000000');
    expect(params.get('query_id')).toBe('q1');
    expect(params.get('user')).toBe('{"id":1,"first_name":"Ada"}');
    expect(params.get('chat')).toBe('{"id":2,"type":"group","title":"Group"}');
  });

  it('defaults auth_date to now when omitted', async () => {
    const before = Math.floor(Date.now() / 1000);
    const raw = await signInitData({}, FIXTURE_BOT_TOKEN);
    const after = Math.floor(Date.now() / 1000);

    const authDate = Number(new URLSearchParams(raw).get('auth_date'));
    expect(authDate).toBeGreaterThanOrEqual(before);
    expect(authDate).toBeLessThanOrEqual(after);
  });
});
