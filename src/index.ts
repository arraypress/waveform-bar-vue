/**
 * @module @arraypress/waveform-bar-vue
 * @description
 * Public entry point for the Vue 3 wrapper around
 * `@arraypress/waveform-bar`.
 *
 * Two components are exported:
 *
 *   - `WaveformBar`         — singleton mount, render once in your root
 *                             layout
 *   - `WaveformBarTrigger`  — polymorphic play / queue trigger, render
 *                             anywhere you want a clickable "play this
 *                             track" element
 *
 * ```vue
 * <script setup lang="ts">
 * import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-bar-vue';
 * </script>
 * ```
 */

export { WaveformBar } from './WaveformBar';
export { WaveformBarTrigger } from './WaveformBarTrigger';

export type {
	WaveformBarProps,
	WaveformBarConfig,
	WaveformBarTriggerProps,
	WaveformBarTrackData,
	WaveformBarMarker,
	WaveformBarActions,
	WaveformBarAction,
	WaveformBarTheme,
	RepeatMode,
	TriggerMode,
	WaveformStyle,
} from './types';
