<div align="center">

# Waveform Bar for Vue

**Vue 3 components for a persistent bottom-bar audio player.** Mount `<WaveformBar>` once, then drop `<WaveformBarTrigger>` elements anywhere to play or queue tracks.

[![npm version](https://img.shields.io/npm/v/@arraypress/waveform-bar-vue?style=flat-square&labelColor=09090b&color=3f3f46)](https://www.npmjs.com/package/@arraypress/waveform-bar-vue)
[![license](https://img.shields.io/npm/l/@arraypress/waveform-bar-vue?style=flat-square&labelColor=09090b&color=3f3f46)](https://github.com/arraypress)

**[Documentation](https://docs.waveformplayer.com/)** &middot; [npm](https://www.npmjs.com/package/@arraypress/waveform-bar-vue)

</div>

---

## Install

```bash
npm install @arraypress/waveform-bar-vue @arraypress/waveform-bar @arraypress/waveform-player vue
```

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

## Documentation

Full guides, props, and examples live on the docs site.

### -> [docs.waveformplayer.com](https://docs.waveformplayer.com/)

[Vue guide](https://docs.waveformplayer.com/frameworks/vue/) — install, props, the imperative API, and SSR notes. All four Vue wrappers (player / bar / playlist) are on that page.

## License

MIT (c) [ArrayPress](https://github.com/arraypress)
