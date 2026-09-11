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
