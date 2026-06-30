# Changelog

All notable changes to `@arraypress/waveform-bar-vue` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — Unreleased

Initial release.

### Added

- `<WaveformBar>` — singleton mount for the persistent bottom bar. Render
  once in your root layout. On mount it dynamically imports
  `@arraypress/waveform-bar` (SSR-safe) and calls
  `window.WaveformBar.init(config)`; re-inits when the config's structural
  shape changes (compared via `JSON.stringify`, so a fresh object with the
  same shape doesn't churn); relocates the bar element into a persist host
  `<div>`; and calls `destroy()` on unmount. `config`, `persist`, `hostId`
  props; `class` / `style` fall through to the host (base class `wb-host`).
- `<WaveformBarTrigger>` — polymorphic (`as="button" | "a" | "div" |
  "span"`, default `button`) click trigger that emits the `data-wb-*`
  attribute contract the core library scans for. Maps track-data props
  (`url`, `id`, `title`, `artist`, `album`, `artwork`, `link`, `duration`,
  `bpm`, `musicalKey`, `meta`, `waveform`, `markers`, `favorited`,
  `inCart`) to attributes (arrays JSON-encoded; absent props emit no
  attribute). `mode="play" | "queue"`, `href` (for `as="a"`),
  `noDefaultIcons`. Renders default play/pause SVGs unless slot content is
  provided. Auto-generates an `aria-label` from `title`. `class`, native
  listeners (`@click`), and other attributes fall through; the base class
  `wb-icon-swap` is always applied.
- No lifecycle callback props — the bar dispatches every state change as a
  bubbling `waveformbar:*` `CustomEvent`; listen with `addEventListener`.
  This keeps callbacks from forcing a bar re-init (matching the React
  wrapper).
- Public types mirroring the core surface: `WaveformBarConfig`,
  `WaveformBarProps`, `WaveformBarTriggerProps`, `WaveformBarTrackData`,
  `WaveformBarMarker`, `WaveformBarActions`, `WaveformBarAction`,
  `WaveformBarTheme`, `RepeatMode`, `TriggerMode`, `WaveformStyle`.
- Dual ESM + CJS build via `tsup` with `.d.ts` for both. Vue + the core
  libraries are peer dependencies.
- Vitest test suite (jsdom + `@vue/test-utils`, 13 tests) covering the
  singleton's host render + `init` / re-init / `destroy` lifecycle, and the
  trigger's `data-wb-*` contract, polymorphism, modes, default-icon
  handling, class merge, and click forwarding.
