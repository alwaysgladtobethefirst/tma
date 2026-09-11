import { afterEach, describe, expect, it, vi } from 'vitest';
import { getInitData, parseInitData } from './init-data';

function rawInitData(fields: Record<string, string>): string {
  return new URLSearchParams(fields).toString();
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('parseInitData', () => {
  it('parses the required fields with no optional fields present', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [],
    });
  });

  it('is undefined when hash is missing', () => {
    const raw = rawInitData({ auth_date: '1700000000' });
    expect(parseInitData(raw)).toBeUndefined();
  });

  it('is undefined when auth_date is missing', () => {
    const raw = rawInitData({ hash: 'abc123' });
    expect(parseInitData(raw)).toBeUndefined();
  });

  it('is undefined when auth_date is not a valid number', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: 'not-a-number' });
    expect(parseInitData(raw)).toBeUndefined();
  });

  it('is undefined when auth_date is an empty string', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '' });
    expect(parseInitData(raw)).toBeUndefined();
  });

  it('passes plain string fields through unchanged', () => {
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      query_id: 'q1',
      chat_type: 'private',
      chat_instance: 'ci1',
      start_param: 'sp1',
      signature: 'sig1',
    });

    expect(parseInitData(raw)).toEqual({
      data: {
        hash: 'abc123',
        auth_date: 1700000000,
        query_id: 'q1',
        chat_type: 'private',
        chat_instance: 'ci1',
        start_param: 'sp1',
        signature: 'sig1',
      },
      warnings: [],
    });
  });

  it('parses can_send_after as a number', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', can_send_after: '600' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000, can_send_after: 600 },
      warnings: [],
    });
  });

  it('drops can_send_after and warns when it is not a valid number', () => {
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      can_send_after: 'soon',
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'can_send_after', reason: 'not a valid number' }],
    });
  });

  it('drops can_send_after and warns when it is an empty string', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', can_send_after: '' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'can_send_after', reason: 'not a valid number' }],
    });
  });

  it('parses a valid user object', () => {
    const user = { id: 1, first_name: 'Ada' };
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      user: JSON.stringify(user),
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000, user },
      warnings: [],
    });
  });

  it('drops user and warns on invalid JSON', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', user: '{not json' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'user', reason: 'invalid JSON' }],
    });
  });

  it('drops user and warns when the JSON is not an object', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', user: 'null' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'user', reason: 'not an object' }],
    });
  });

  it('drops user and warns when a required field is missing', () => {
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      user: JSON.stringify({ id: 1 }),
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'user', reason: 'missing required field "first_name"' }],
    });
  });

  it('parses receiver the same way as user', () => {
    const receiver = { id: 2, first_name: 'Grace' };
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      receiver: JSON.stringify(receiver),
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000, receiver },
      warnings: [],
    });
  });

  it('parses a valid chat object', () => {
    const chat = { id: 10, type: 'group', title: 'Cool Group' };
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      chat: JSON.stringify(chat),
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000, chat },
      warnings: [],
    });
  });

  it('drops chat and warns on invalid JSON', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', chat: '{not json' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'chat', reason: 'invalid JSON' }],
    });
  });

  it('drops chat and warns when the JSON is not an object', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000', chat: '5' });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'chat', reason: 'not an object' }],
    });
  });

  it('drops chat and warns when a required field is missing', () => {
    const raw = rawInitData({
      hash: 'abc123',
      auth_date: '1700000000',
      chat: JSON.stringify({ id: 10, type: 'group' }),
    });

    expect(parseInitData(raw)).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [{ field: 'chat', reason: 'missing required field "title"' }],
    });
  });
});

describe('getInitData', () => {
  it('is undefined outside Telegram', () => {
    expect(getInitData()).toBeUndefined();
  });

  it('parses the current WebApp.initData', () => {
    const raw = rawInitData({ hash: 'abc123', auth_date: '1700000000' });
    vi.stubGlobal('window', { Telegram: { WebApp: { initData: raw } } });

    expect(getInitData()).toEqual({
      data: { hash: 'abc123', auth_date: 1700000000 },
      warnings: [],
    });
  });
});
