<!--
  examples/basic.vue
  ------------------

  Reference Vue 3 component demonstrating <WaveformBar> + <WaveformBarTrigger>.
  Copy/paste into your own Vue app (Vite, Nuxt, anywhere).

  Library setup (do this ONCE in your app entry — e.g. `main.ts`).
  ORDER MATTERS — the player installs window.WaveformPlayer, which the bar needs:

    import '@arraypress/waveform-player/dist/waveform-player.css';
    import '@arraypress/waveform-bar/dist/waveform-bar.css';
    import '@arraypress/waveform-player';   // sets window.WaveformPlayer
    import '@arraypress/waveform-bar';      // sets window.WaveformBar
-->
<script setup lang="ts">
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-vue';

const tracks = [
	{ url: '/audio/track-1.mp3', title: 'Midnight Dreams', artist: 'The Wavelength', artwork: '/img/1.jpg' },
	{ url: '/audio/track-2.mp3', title: 'Solar Flare', artist: 'Aurora', artwork: '/img/2.jpg' },
];
</script>

<template>
	<!-- A grid of cards, each with a play trigger -->
	<div class="grid">
		<article v-for="t in tracks" :key="t.url" class="card">
			<img :src="t.artwork" :alt="`${t.title} cover`" />
			<h3>{{ t.title }}</h3>
			<p>{{ t.artist }}</p>
			<WaveformBarTrigger
				:url="t.url"
				:title="t.title"
				:artist="t.artist"
				:artwork="t.artwork"
				class="play-btn"
			/>
			<WaveformBarTrigger mode="queue" :url="t.url" :title="t.title">+ Queue</WaveformBarTrigger>
		</article>
	</div>

	<!-- The persistent bar — render ONCE, typically in your root layout -->
	<WaveformBar :config="{ persist: true, continuous: true, showQueue: true }" />
</template>
