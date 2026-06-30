# @arraypress/waveform-bar-vue

Vue 3 component wrapper around [`@arraypress/waveform-bar`](https://github.com/arraypress/waveform-bar) — a persistent bottom-bar audio player. Two components: a singleton `<WaveformBar>` you render once, and a polymorphic `<WaveformBarTrigger>` you drop anywhere you want a clickable "play this track" element.

The core library stays a zero-dependency vanilla-JS package that works anywhere a `<script>` tag does. This package adds the framework-native ergonomics Vue developers expect.

```vue
<script setup lang="ts">
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-vue';
</script>

<template>
  <!-- render ONCE in your root layout -->
  <WaveformBar :config="{ persist: true, continuous: true }" />

  <!-- drop triggers anywhere -->
  <WaveformBarTrigger url="/audio/track.mp3" title="My Track" artist="The Artist" />
</template>
```

## Installation

```bash
npm install @arraypress/waveform-bar-vue @arraypress/waveform-bar @arraypress/waveform-player vue
```

`vue` (^3.5), `@arraypress/waveform-bar` (^1.3), and `@arraypress/waveform-player` (^1.7) are peer dependencies.

## Setup

The bar has a strict runtime dependency on the core player. Load both libraries' JS + CSS **once** in your app entry — **order matters** (the player installs `window.WaveformPlayer`, which the bar needs):

```ts
// main.ts
import '@arraypress/waveform-player/dist/waveform-player.css';
import '@arraypress/waveform-bar/dist/waveform-bar.css';
import '@arraypress/waveform-player'; // sets window.WaveformPlayer
import '@arraypress/waveform-bar';    // sets window.WaveformBar
```

The wrapper imports the core dynamically inside `onMounted`, so SSR / Nuxt environments don't trip over the browser-only audio APIs.

## `<WaveformBar>` — the singleton

Render exactly **once** in your root layout. It mounts a persist host, runs `init(config)`, and tears down on unmount.

```vue
<WaveformBar
  host-id="my-app-bar"
  :config="{
    persist: true,
    continuous: true,
    showQueue: true,
    maxMeta: 1,
    storageKey: 'my-app-bar',
    actions: {
      favorite: { endpoint: '/api/favorites' },
      cart:     { endpoint: '/api/cart' },
    },
  }"
/>
```

| Prop     | Type               | Default              |
| -------- | ------------------ | -------------------- |
| `config` | `WaveformBarConfig`| —                    |
| `persist`| `boolean`          | `true`               |
| `hostId` | `string`           | `'waveform-bar-host'`|

`init()` re-runs whenever the config's structural shape changes (compared via `JSON.stringify`), so passing a fresh object with the same shape on every render is safe. `class` / `style` fall through to the host `<div>` (base class `wb-host`).

> **Events.** The bar dispatches every state change as a bubbling `waveformbar:*` `CustomEvent` (e.g. `waveformbar:play`, `waveformbar:trackchange`). Listen with `addEventListener` — there are no callback props (a fresh inline function each render would needlessly re-init the bar).

## `<WaveformBarTrigger>` — the trigger

A polymorphic clickable element that tells the bar to play / queue a track via the `data-wb-*` attribute contract. The core library handles click delegation automatically.

```vue
<!-- default: a <button> with play/pause icons -->
<WaveformBarTrigger
  url="/audio/track.mp3"
  id="track-42"
  title="Midnight Dreams"
  artist="The Wavelength"
  artwork="/img/cover.jpg"
/>

<!-- queue mode, custom content -->
<WaveformBarTrigger mode="queue" url="/audio/track.mp3" title="Midnight Dreams">
  + Add to queue
</WaveformBarTrigger>

<!-- wrap a whole card (as="div"), suppress the default icons -->
<WaveformBarTrigger as="div" :url="track.url" :title="track.title" no-default-icons>
  <article class="product-card">…</article>
</WaveformBarTrigger>

<!-- DJ-mode markers -->
<WaveformBarTrigger
  url="/audio/guest-mix.mp3"
  title="Friday Night Mix"
  artist="DJ One"
  :markers="[
    { time: 0,   label: 'Intro', title: 'Opening Track' },
    { time: 180, label: 'Drop',  title: 'Big Tune', bpm: 174 },
  ]"
>
  Play mix
</WaveformBarTrigger>
```

Track-data props (`url`, `id`, `title`, `artist`, `album`, `artwork`, `link`, `duration`, `bpm`, `musicalKey`, `meta`, `waveform`, `markers`, `favorited`, `inCart`) map 1:1 to `data-wb-*` attributes — arrays are JSON-encoded, and absent props emit no attribute (so the library's defaults apply). Plus:

| Prop             | Type                                  | Default    |
| ---------------- | ------------------------------------- | ---------- |
| `mode`           | `'play' \| 'queue'`                   | `'play'`   |
| `as`             | `'button' \| 'a' \| 'div' \| 'span'`  | `'button'` |
| `href`           | `string` (for `as="a"`)               | —          |
| `noDefaultIcons` | `boolean`                             | `false`    |

`class`, native listeners (`@click`), and any other DOM attributes fall through to the rendered element; the base class `wb-icon-swap` is always applied, and an `aria-label` is auto-generated from `title` when you don't pass one.

## TypeScript

```ts
import type {
  WaveformBarConfig,
  WaveformBarProps,
  WaveformBarTriggerProps,
  WaveformBarTrackData,
  WaveformBarMarker,
  WaveformBarActions,
  RepeatMode,
  TriggerMode,
  WaveformStyle,
} from '@arraypress/waveform-bar-vue';
```

The package ships `.d.ts` for both ESM and CJS consumers.

## Testing

```bash
npm test          # one-shot
npm run typecheck
npm run build     # emit dist/index.js, dist/index.cjs, dist/index.d.ts
```

The core library is mocked at the module boundary (jsdom has no Web Audio API).

## License

MIT © ArrayPress
