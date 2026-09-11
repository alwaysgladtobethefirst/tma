/**
 * This file transcribes `window.Telegram.WebApp`, the object Telegram
 * injects into every Mini App, into TypeScript types. It's copied from the
 * official docs (https://core.telegram.org/bots/webapps), and covers
 * everything up to and including Bot API 8.0 — the version this package
 * assumes is present (see `isAtLeast`/`supportsVersion`). Nothing newer than
 * 8.0 belongs here; Telegram jumped straight from 8.0 to 9.0, so there's no
 * gap in between to worry about.
 */
export interface WebApp {
  // Launch data: how this Mini App was opened, and by whom.
  readonly initData: string;
  readonly initDataUnsafe: WebAppInitData;

  // Which Telegram client this is running in, and what it supports.
  /** The Bot API version this client supports, written as `"major.minor"` (for example `"8.0"`). */
  readonly version: string;
  readonly platform: Platform;
  readonly colorScheme: ColorScheme;
  readonly themeParams: ThemeParams;

  // The visible area of the Mini App, and how much of the screen it takes up.
  readonly isExpanded: boolean;
  readonly viewportHeight: number;
  readonly viewportStableHeight: number;
  readonly isFullscreen: boolean;
  readonly isOrientationLocked: boolean;
  readonly safeAreaInset: SafeAreaInset;
  readonly contentSafeAreaInset: ContentSafeAreaInset;

  // Colors Telegram is currently drawing around the Mini App.
  readonly headerColor: string;
  readonly backgroundColor: string;
  readonly bottomBarColor: string;

  // Behavior flags the Mini App can turn on or off.
  readonly isClosingConfirmationEnabled: boolean;
  readonly isVerticalSwipesEnabled: boolean;
  /** `false` while the Mini App is minimized or in the background. */
  readonly isActive: boolean;

  // The buttons Telegram itself draws around the Mini App.
  readonly MainButton: BottomButton;
  readonly SecondaryButton: BottomButton;
  readonly BackButton: BackButton;
  readonly SettingsButton: SettingsButton;

  // Optional device and platform features, each behind its own manager object.
  readonly HapticFeedback: HapticFeedback;
  readonly CloudStorage: CloudStorage;
  readonly BiometricManager: BiometricManager;
  readonly Accelerometer: Accelerometer;
  readonly DeviceOrientation: DeviceOrientation;
  readonly Gyroscope: Gyroscope;
  readonly LocationManager: LocationManager;

  // Starting up and closing.
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast(version: string): boolean;

  // Setting colors.
  setHeaderColor(color: BackgroundColorKey | string): void;
  setBackgroundColor(color: BackgroundColorKey | string): void;
  setBottomBarColor(color: BottomBarColorKey | string): void;

  // Turning behavior on or off.
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  enableVerticalSwipes(): void;
  disableVerticalSwipes(): void;

  // Fullscreen and screen orientation.
  requestFullscreen(): void;
  exitFullscreen(): void;
  lockOrientation(): void;
  unlockOrientation(): void;

  // Listening for events. See `TelegramEventMap` for the full list.
  onEvent<E extends EventType>(eventType: E, eventHandler: EventHandler<E>): void;
  offEvent<E extends EventType>(eventType: E, eventHandler: EventHandler<E>): void;

  // Sending data back to the bot, and navigating away from the Mini App.
  /** Only works for a Mini App opened from a keyboard button. The data is limited to 4096 bytes. */
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: ChooseChatType[]): void;
  openLink(url: string, options?: OpenLinkOptions): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: (status: InvoiceStatus) => void): void;

  // Popups and prompts shown by the Telegram client itself.
  showPopup(params: PopupParams, callback?: (buttonId: string | null) => void): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (ok: boolean) => void): void;
  /** Return `true` from the callback to close the scanner automatically once a code is read. */
  showScanQrPopup(
    params: ScanQrPopupParams,
    callback?: (text: string) => boolean | undefined,
  ): void;
  closeScanQrPopup(): void;

  // Asking the user for something: clipboard access, permission to write to them, their contact card, and so on.
  readTextFromClipboard(callback?: (text: string | null) => void): void;
  requestWriteAccess(callback?: (granted: boolean) => void): void;
  requestContact(callback?: (shared: boolean) => void): void;
  shareToStory(media_url: string, params?: StoryShareParams): void;
  shareMessage(msg_id: string, callback?: (sent: boolean) => void): void;
  setEmojiStatus(
    custom_emoji_id: string,
    params?: EmojiStatusParams,
    callback?: (set: boolean) => void,
  ): void;
  requestEmojiStatusAccess(callback?: (granted: boolean) => void): void;
  downloadFile(params: DownloadFileParams, callback?: (accepted: boolean) => void): void;
  addToHomeScreen(): void;
  checkHomeScreenStatus(callback?: (status: HomeScreenStatus) => void): void;
}

/**
 * Which Telegram app this Mini App is running inside — the iOS app, the
 * desktop app, the web version, and so on. Telegram's own docs don't
 * actually list these values anywhere; this is the set the community has
 * observed in practice (it matches the widely-used `@twa-dev/types`
 * package), so treat it as reliable but not officially guaranteed.
 */
export type Platform =
  | 'android'
  | 'android_x'
  | 'ios'
  | 'macos'
  | 'tdesktop'
  | 'weba'
  | 'webk'
  | 'unigram'
  | 'unknown';

/** `'light'` or `'dark'`, matching the user's current Telegram theme. */
export type ColorScheme = 'light' | 'dark';

/** One of the app's two background colors — the primary one or the secondary one. Accepted by both `setHeaderColor` and `setBackgroundColor`; any other `#RRGGBB` string is also accepted. */
export type BackgroundColorKey = 'bg_color' | 'secondary_bg_color';

/** The color keys accepted by `setBottomBarColor`. Any other `#RRGGBB` string is also accepted. */
export type BottomBarColorKey = BackgroundColorKey | 'bottom_bar_bg_color';

/** The kinds of chats a user can be invited to pick from `switchInlineQuery`'s chat picker. */
export type ChooseChatType = 'users' | 'bots' | 'groups' | 'channels';

/** The outcome of a payment started with `openInvoice`, or reported by the matching `invoiceClosed` event. */
export type InvoiceStatus = 'paid' | 'cancelled' | 'failed' | 'pending';

/** Whether the Mini App has been added to the device's home screen. */
export type HomeScreenStatus = 'unsupported' | 'unknown' | 'added' | 'missed';

/** Extra options for `openLink`. */
export interface OpenLinkOptions {
  /** Open the link in Telegram's built-in Instant View reader when possible. */
  try_instant_view?: boolean;
}

// Theme

/**
 * The colors of the user's current Telegram theme. Every one of these
 * colors is also available live as a `--tg-theme-*` CSS variable that
 * Telegram sets on the page itself, and that variable updates automatically
 * when the user changes their theme — so most Mini Apps can just style with
 * plain CSS and never need to read this object directly.
 */
export interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
  section_separator_color?: string;
  bottom_bar_bg_color?: string;
}

// Launch data

/**
 * The information Telegram passes along when it opens a Mini App, once it's
 * been parsed into a plain object. This is convenient to read, but it isn't
 * verified — anyone could have forged it. Only the raw `initData` string
 * (via its `hash` or `signature`) can actually be checked for authenticity.
 */
export interface WebAppInitData {
  /** An identifier the bot's backend needs if it wants to send a message back in response to this launch. */
  query_id?: string;
  user?: WebAppUser;
  /** The other person in a private chat. Only present when launched from the attachment menu. */
  receiver?: WebAppUser;
  /** The chat the Mini App was opened from. Only present for direct-link launches. */
  chat?: WebAppChat;
  /** How the Mini App relates to the chat it was opened from. Only present for direct-link launches. */
  chat_type?: LaunchChatType;
  /** An opaque identifier for the chat. Only present for direct-link launches. */
  chat_instance?: string;
  /** A custom value the bot can attach to the launch link, to tell different launches apart. */
  start_param?: string;
  /** How many seconds are left before the Mini App is allowed to call `sendData` again. */
  can_send_after?: number;
  /** The Unix timestamp of when this launch data was generated. */
  auth_date: number;
  /** An HMAC-SHA-256 signature (a cryptographic checksum) over the rest of the fields, computed with the bot's own token. A bot's backend uses this to confirm the launch data really came from Telegram. */
  hash: string;
  /**
   * An Ed25519 digital signature over the same data, which anyone can check
   * against Telegram's published public keys — no bot token required. This
   * lets a third party (not just the bot itself) confirm the launch data is
   * genuine. Added in Bot API 8.0.
   */
  signature?: string;
}

/** How a Mini App launch relates to the chat it was opened from. */
export type LaunchChatType = 'sender' | 'private' | 'group' | 'supergroup' | 'channel';

export interface WebAppUser {
  /** A number up to 52 bits long, uniquely identifying this Telegram user. */
  id: number;
  /** Only present on `receiver`, never on `user`. */
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  /** Only present on `user`, never on `receiver`. */
  language_code?: string;
  is_premium?: true;
  added_to_attachment_menu?: true;
  allows_write_to_pm?: true;
  photo_url?: string;
}

export interface WebAppChat {
  id: number;
  type: WebAppChatType;
  title: string;
  username?: string;
  /** Only present when launched from the attachment menu. */
  photo_url?: string;
}

/** The kind of chat a Mini App can be launched from directly (as opposed to a private one-on-one chat). */
export type WebAppChatType = 'group' | 'supergroup' | 'channel';

// Viewport

/** The distance, in pixels, from each edge of the screen to the area that's safe to put content in without it being covered by system UI (like a phone's notch or home indicator). */
export interface SafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Like `SafeAreaInset`, but also accounting for Telegram's own UI (buttons, bars) on top of the device's system UI. */
export interface ContentSafeAreaInset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Buttons

export interface BackButton {
  readonly isVisible: boolean;
  /** Shorthand for subscribing to the `backButtonClicked` event yourself. */
  onClick(cb: () => void): BackButton;
  offClick(cb: () => void): BackButton;
  show(): BackButton;
  hide(): BackButton;
}

/** Which of the two bottom buttons this is. */
export type BottomButtonType = 'main' | 'secondary';

/** The shared shape of `WebApp.MainButton` and `WebApp.SecondaryButton` — the two buttons Telegram can draw at the bottom of a Mini App. */
export interface BottomButton {
  readonly type: BottomButtonType;
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  readonly isProgressVisible: boolean;
  hasShineEffect: boolean;
  /** Only meaningful for `SecondaryButton`; defaults to `'left'`. */
  position?: BottomButtonPosition;

  setText(text: string): BottomButton;
  /** Shorthand for subscribing to the click event yourself. */
  onClick(cb: () => void): BottomButton;
  offClick(cb: () => void): BottomButton;
  show(): BottomButton;
  hide(): BottomButton;
  enable(): BottomButton;
  disable(): BottomButton;
  showProgress(leaveActive?: boolean): BottomButton;
  hideProgress(): BottomButton;
  setParams(params: BottomButtonParams): BottomButton;
}

/** Where the secondary button is placed relative to the main button. */
export type BottomButtonPosition = 'left' | 'right' | 'top' | 'bottom';

export interface BottomButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  has_shine_effect?: boolean;
  position?: BottomButtonPosition;
  is_active?: boolean;
  is_visible?: boolean;
}

export interface SettingsButton {
  readonly isVisible: boolean;
  /** Shorthand for subscribing to the `settingsButtonClicked` event yourself. */
  onClick(cb: () => void): SettingsButton;
  offClick(cb: () => void): SettingsButton;
  show(): SettingsButton;
  hide(): SettingsButton;
}

// Feature managers

export type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type NotificationType = 'error' | 'success' | 'warning';

export interface HapticFeedback {
  impactOccurred(style: ImpactStyle): HapticFeedback;
  notificationOccurred(type: NotificationType): HapticFeedback;
  selectionChanged(): HapticFeedback;
}

/**
 * A small key-value store the bot can use to remember things about this
 * user across sessions. Keys must be 1-128 characters, made only of
 * letters, digits, underscores and hyphens. Values can be up to 4096
 * characters. Each user can have at most 1024 keys stored at once.
 */
export interface CloudStorage {
  setItem(
    key: string,
    value: string,
    callback?: (error: string | null, success?: boolean) => void,
  ): CloudStorage;
  getItem(key: string, callback: (error: string | null, value?: string) => void): CloudStorage;
  getItems(
    keys: string[],
    callback: (error: string | null, values?: Record<string, string>) => void,
  ): CloudStorage;
  removeItem(
    key: string,
    callback?: (error: string | null, success?: boolean) => void,
  ): CloudStorage;
  removeItems(
    keys: string[],
    callback?: (error: string | null, success?: boolean) => void,
  ): CloudStorage;
  getKeys(callback: (error: string | null, keys?: string[]) => void): CloudStorage;
}

export type BiometricType = 'finger' | 'face' | 'unknown';

export interface BiometricRequestAccessParams {
  /** A short explanation shown to the user for why access is being requested. Up to 128 characters. */
  reason?: string;
}

export interface BiometricAuthenticateParams {
  /** A short explanation shown to the user for why authentication is being requested. Up to 128 characters. */
  reason?: string;
}

/** Fingerprint or face authentication. Call `init()` once before using anything else on this object. */
export interface BiometricManager {
  readonly isInited: boolean;
  readonly isBiometricAvailable: boolean;
  readonly biometricType: BiometricType;
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
  readonly isBiometricTokenSaved: boolean;
  readonly deviceId: string;

  init(callback?: () => void): BiometricManager;
  requestAccess(
    params: BiometricRequestAccessParams,
    callback?: (granted: boolean) => void,
  ): BiometricManager;
  authenticate(
    params: BiometricAuthenticateParams,
    callback?: (authenticated: boolean, biometricToken?: string) => void,
  ): BiometricManager;
  /** Pass an empty string to delete the stored token instead of setting one. */
  updateBiometricToken(token: string, callback?: (updated: boolean) => void): BiometricManager;
  /** Only works in direct response to a user action (a click or tap), not from background code. */
  openSettings(): BiometricManager;
}

export interface AccelerometerStartParams {
  /** How often to report new readings, in milliseconds. Must be between 20 and 1000; defaults to 1000. */
  refresh_rate?: number;
}

/** Reports how fast the device is accelerating along each axis. */
export interface Accelerometer {
  readonly isStarted: boolean;
  /** Acceleration along the X axis, in meters per second squared. */
  readonly x: number;
  /** Acceleration along the Y axis, in meters per second squared. */
  readonly y: number;
  /** Acceleration along the Z axis, in meters per second squared. */
  readonly z: number;
  start(params: AccelerometerStartParams, callback?: (started: boolean) => void): Accelerometer;
  stop(callback?: (stopped: boolean) => void): Accelerometer;
}

export interface DeviceOrientationStartParams {
  /** How often to report new readings, in milliseconds. Must be between 20 and 1000; defaults to 1000. */
  refresh_rate?: number;
  /** Report angles relative to the Earth's reference frame instead of the device's own starting position. Defaults to `false`. */
  need_absolute?: boolean;
}

/** Reports which way the device is facing. */
export interface DeviceOrientation {
  readonly isStarted: boolean;
  readonly absolute: boolean;
  /** Compass heading: rotation around the vertical axis, in radians. */
  readonly alpha: number;
  /** Front-to-back tilt, in radians. */
  readonly beta: number;
  /** Left-to-right tilt, in radians. */
  readonly gamma: number;
  start(
    params: DeviceOrientationStartParams,
    callback?: (started: boolean) => void,
  ): DeviceOrientation;
  stop(callback?: (stopped: boolean) => void): DeviceOrientation;
}

export interface GyroscopeStartParams {
  /** How often to report new readings, in milliseconds. Must be between 20 and 1000; defaults to 1000. */
  refresh_rate?: number;
}

/** Reports how fast the device is rotating around each axis. */
export interface Gyroscope {
  readonly isStarted: boolean;
  /** Rotation speed around the X axis, in radians per second. */
  readonly x: number;
  /** Rotation speed around the Y axis, in radians per second. */
  readonly y: number;
  /** Rotation speed around the Z axis, in radians per second. */
  readonly z: number;
  start(params: GyroscopeStartParams, callback?: (started: boolean) => void): Gyroscope;
  stop(callback?: (stopped: boolean) => void): Gyroscope;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  /** Direction of travel in degrees, where 0 is north, 90 is east, 180 is south, and 270 is west. */
  course: number | null;
  /** Speed of travel, in meters per second. */
  speed: number | null;
  /** How accurate the latitude/longitude reading is, in meters. */
  horizontal_accuracy: number | null;
  /** How accurate the altitude reading is, in meters. */
  vertical_accuracy: number | null;
  /** How accurate the course reading is, in degrees. */
  course_accuracy: number | null;
  /** How accurate the speed reading is, in meters per second. */
  speed_accuracy: number | null;
}

/** The device's current location. Call `init()` once before using anything else on this object. */
export interface LocationManager {
  readonly isInited: boolean;
  readonly isLocationAvailable: boolean;
  readonly isAccessRequested: boolean;
  readonly isAccessGranted: boolean;
  init(callback?: () => void): LocationManager;
  getLocation(callback: (data: LocationData | null) => void): LocationManager;
  /** Only works in direct response to a user action (a click or tap), not from background code. */
  openSettings(): LocationManager;
}

// Method parameter types

export interface PopupParams {
  /** Up to 64 characters. */
  title?: string;
  /** 1 to 256 characters, required. */
  message: string;
  /** 1 to 3 buttons. Defaults to a single close button. */
  buttons?: PopupButton[];
}

export interface PopupButton {
  /** Up to 64 characters, identifying which button was pressed. Defaults to an empty string. */
  id?: string;
  /** Defaults to `'default'`. */
  type?: PopupButtonType;
  /** The button's label. Required when `type` is `'default'` or `'destructive'`. */
  text?: string;
}

/** The visual style of a popup button. */
export type PopupButtonType = 'default' | 'ok' | 'close' | 'cancel' | 'destructive';

export interface ScanQrPopupParams {
  /** Instructions shown above the scanner. Up to 64 characters. */
  text?: string;
}

export interface StoryWidgetLink {
  url: string;
  /** Up to 48 characters. */
  name?: string;
}

export interface StoryShareParams {
  /** Up to 200 characters (or 2048 for Telegram Premium users). */
  text?: string;
  /** A clickable link shown on the story. Only available to Telegram Premium users. */
  widget_link?: StoryWidgetLink;
}

export interface EmojiStatusParams {
  /** How many seconds the emoji status should last before reverting. */
  duration?: number;
}

export interface DownloadFileParams {
  /** Must be an HTTPS URL. */
  url: string;
  file_name: string;
}

// Events

/**
 * Every event name `onEvent`/`offEvent` accepts, mapped to the shape of the
 * payload its handler is called with — matching Bot API 8.0 and everything
 * before it. `undefined` means the handler is called with no arguments at
 * all, not with an `undefined` argument.
 */
export interface TelegramEventMap {
  themeChanged: undefined;
  viewportChanged: { isStateStable: boolean };
  mainButtonClicked: undefined;
  secondaryButtonClicked: undefined;
  backButtonClicked: undefined;
  settingsButtonClicked: undefined;
  invoiceClosed: { url: string; status: InvoiceStatus };
  popupClosed: { button_id: string | null };
  qrTextReceived: { data: string };
  /** `data` is an empty string if the clipboard held something other than text, and `null` if clipboard access was denied. */
  clipboardTextReceived: { data: string | null };
  writeAccessRequested: { status: AccessRequestStatus };
  contactRequested: { status: ContactRequestStatus };
  biometricManagerUpdated: undefined;
  biometricAuthRequested: { isAuthenticated: boolean; biometricToken?: string };
  biometricTokenUpdated: { isUpdated: boolean };
  scanQrPopupClosed: undefined;
  activated: undefined;
  deactivated: undefined;
  /** Fired when `WebApp.safeAreaInset` changes; read that property to get the new value. */
  safeAreaChanged: undefined;
  /** Fired when `WebApp.contentSafeAreaInset` changes; read that property to get the new value. */
  contentSafeAreaChanged: undefined;
  /** Fired when `WebApp.isFullscreen` changes; read that property to get the new value. */
  fullscreenChanged: undefined;
  fullscreenFailed: { error: FullscreenError };
  homeScreenAdded: undefined;
  homeScreenChecked: { status: HomeScreenStatus };
  accelerometerStarted: undefined;
  accelerometerStopped: undefined;
  /** Fired on every new reading; read `WebApp.Accelerometer.x`/`y`/`z` to get the values. */
  accelerometerChanged: undefined;
  accelerometerFailed: { error: SensorUnsupportedError };
  deviceOrientationStarted: undefined;
  deviceOrientationStopped: undefined;
  /** Fired on every new reading; read `WebApp.DeviceOrientation.alpha`/`beta`/`gamma` to get the values. */
  deviceOrientationChanged: undefined;
  deviceOrientationFailed: { error: SensorUnsupportedError };
  gyroscopeStarted: undefined;
  gyroscopeStopped: undefined;
  /** Fired on every new reading; read `WebApp.Gyroscope.x`/`y`/`z` to get the values. */
  gyroscopeChanged: undefined;
  gyroscopeFailed: { error: SensorUnsupportedError };
  locationManagerUpdated: undefined;
  locationRequested: { locationData: LocationData };
  shareMessageSent: undefined;
  shareMessageFailed: { error: ShareMessageError };
  emojiStatusSet: undefined;
  emojiStatusFailed: { error: EmojiStatusError };
  emojiStatusAccessRequested: { status: AccessRequestStatus };
  fileDownloadRequested: { status: FileDownloadStatus };
}

/** Whether the user allowed or denied a permission request. */
export type AccessRequestStatus = 'allowed' | 'cancelled';

/** Whether the user chose to share their contact card or dismissed the prompt. */
export type ContactRequestStatus = 'sent' | 'cancelled';

/** Why a fullscreen request failed. */
export type FullscreenError = 'UNSUPPORTED' | 'ALREADY_FULLSCREEN';

/** Why a sensor (accelerometer, gyroscope, or device orientation) failed to start — currently the only reason Telegram reports is that the device or client doesn't support it. */
export type SensorUnsupportedError = 'UNSUPPORTED';

/** Why sharing a prepared message failed. */
export type ShareMessageError =
  | 'UNSUPPORTED'
  | 'MESSAGE_EXPIRED'
  | 'MESSAGE_SEND_FAILED'
  | 'USER_DECLINED'
  | 'UNKNOWN_ERROR';

/** Why setting the user's emoji status failed. */
export type EmojiStatusError =
  | 'UNSUPPORTED'
  | 'SUGGESTED_EMOJI_INVALID'
  | 'DURATION_INVALID'
  | 'USER_DECLINED'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/** Whether the user agreed to download the file `downloadFile` offered them. */
export type FileDownloadStatus = 'downloading' | 'cancelled';

export type EventType = keyof TelegramEventMap;
export type EventPayload<E extends EventType> = TelegramEventMap[E];

/** A zero-argument handler for an event with no payload, or a one-argument handler for an event that does have one. */
export type EventHandler<E extends EventType> = TelegramEventMap[E] extends undefined
  ? () => void
  : (payload: TelegramEventMap[E]) => void;
