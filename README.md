# @skrynnyk/tma

Typed bridge to the Telegram Mini App platform, with React hooks and thin wrapper components.

- `@skrynnyk/tma` – the core: typed, no dependencies.
- `@skrynnyk/tma/react` – hooks and wrapper components on top of the core.

You can develop your Mini App in a normal browser – without Telegram, its calls simply do nothing instead of crashing.

## Requirements

`validateInitData` (the HMAC method) works everywhere Web Crypto does – no caveats.

`validateInitDataSignature` (the Ed25519 method) needs a runtime with `crypto.subtle` Ed25519 support:

- **Node**: >= 22.13.0
- **Browsers**: Chrome/Edge 137+, Firefox 129+, Safari 17+ – older browsers don't support it.

## Install

```bash
npm i @skrynnyk/tma
```

`@skrynnyk/tma/react` requires React 19.

## React

Mount the provider once, near the root. It tells Telegram the Mini App is ready to display, and every hook needs it somewhere above.

```tsx
import { TmaProvider, useInitData, useTheme } from '@skrynnyk/tma/react';

function App() {
  return (
    <TmaProvider>
      <Greeting />
    </TmaProvider>
  );
}

function Greeting() {
  const initData = useInitData();
  const theme = useTheme();

  return <h1 style={{ color: theme?.themeParams.text_color }}>Hi, {initData?.user?.first_name}</h1>;
}
```

Every hook returns `undefined` outside Telegram and while rendering on a server, so the same tree runs in a plain browser tab without special-casing.

| Hook | Returns |
| --- | --- |
| `useInitData()` | how this Mini App was opened, and by whom |
| `useTheme()` | `colorScheme` and `themeParams` |
| `useViewport()` | `height`, `stableHeight`, `isExpanded`, `isStateStable` |
| `useSafeArea()` | the inset the device imposes – notch, home indicator |
| `useContentSafeArea()` | the inset Telegram's own interface imposes |
| `useFullscreen()` | whether the Mini App is drawn fullscreen |
| `useIsActive()` | whether the user is looking at the Mini App right now |
| `useWebApp()` | the raw `WebApp` object, for anything not wrapped yet |
| `useWebAppEvent(event, handler)` | subscribes for as long as the component lives |

These hooks only read. Acting on the platform – `ready()`, `expand()` – stays in the core and is imported from `@skrynnyk/tma` directly.
