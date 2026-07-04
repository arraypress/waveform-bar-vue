/**
 * @module types
 * @description
 * Public TypeScript types for `@arraypress/waveform-bar-vue`.
 *
 * Two component shapes:
 *
 *   1. `<WaveformBar>`         — the persistent bottom-bar
 *                                singleton. Takes a `config` object
 *                                (every option `window.WaveformBar.init()`
 *                                accepts).
 *   2. `<WaveformBarTrigger>`  — polymorphic click trigger. Renders
 *                                a `<button>` by default; emits the
 *                                `data-wb-*` attribute contract the
 *                                core library scans for at runtime.
 *
 * Prop names match the library option / attribute names 1:1
 * (camelCase). The components handle the conversion (init-time
 * JSON for the bar, `data-wb-*` attributes for the trigger).
 *
 * Callbacks are deliberately NOT exposed as props. A fresh inline
 * function each render would re-init the bar, and the core library
 * dispatches every state change as a bubbling `waveformbar:*`
 * `CustomEvent` anyway. Listen via `addEventListener` in your own
 * code — that's framework-agnostic and avoids the re-init churn.
 *
 * @see {@link https://github.com/arraypress/waveform-bar} — core library
 */

/* Re-export the WaveformStyle alias for ergonomic consumer imports. */
export type { WaveformStyle } from './waveform-style';
import type { WaveformStyle } from './waveform-style';

/** Visual theme used by the bar. `null` auto-detects from the page. */
export type WaveformBarTheme = 'dark' | 'light' | null;

/**
 * Repeat-mode cycle position.
 *
 * - `off` — play the queue once, then stop
 * - `all` — loop the entire queue
 * - `one` — loop the current track indefinitely
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Trigger behaviour for `<WaveformBarTrigger>`.
 *
 * - `play`  — (default) immediate play. The core library starts
 *   playback as soon as the trigger is clicked.
 * - `queue` — append to the queue without changing the current
 *   track. Maps to the library's `data-wb-queue` attribute.
 */
export type TriggerMode = 'play' | 'queue';

/**
 * A clickable DJ-mode marker within a single track. Markers fire
 * as playback crosses each `time`; the bar updates its displayed
 * title / artist / artwork / metadata to the marker's values.
 */
export interface WaveformBarMarker {
	time: number;
	label: string;
	title?: string;
	artist?: string;
	artwork?: string;
	bpm?: string | number;
	key?: string;
	color?: string;
}

/**
 * Server-side action endpoint config for favourite / cart toggles.
 *
 * `endpoint` is a URL string. The library performs `fetch()` with
 * the configured `method` (default POST) + optional headers.
 *
 * Note: the core library also accepts a function for `endpoint`,
 * letting you intercept the request in-browser. That form works
 * here too — but keep the function reference stable across renders
 * (hoist it out of the render, or wrap your whole config in a
 * `computed`) so the bar doesn't re-init on every render.
 */
export interface WaveformBarAction {
	endpoint: string | ((payload: Record<string, unknown>) => void);
	method?: string;
	headers?: Record<string, string>;
}

export interface WaveformBarActions {
	favorite?: WaveformBarAction;
	cart?: WaveformBarAction;
}

/**
 * Full configuration object for the persistent bar. Mirrors the
 * options accepted by `window.WaveformBar.init(...)`. Every field
 * is optional — pass only the keys you want to override.
 */
export interface WaveformBarConfig {
	// ── Persistence + behaviour ────────────────────────────────────────
	persist?: boolean;
	autoResume?: boolean;
	continuous?: boolean;
	repeat?: RepeatMode;
	// ── UI toggles ─────────────────────────────────────────────────────
	showQueue?: boolean;
	showPrevNext?: boolean;
	showRepeat?: boolean;
	showVolume?: boolean;
	showMute?: boolean;
	showTime?: boolean;
	showTrackLink?: boolean;
	showMeta?: boolean;
	maxMeta?: number;
	// ── Layout + docking ───────────────────────────────────────────────
	wide?: boolean;
	position?: 'bottom' | 'top';
	collapsible?: boolean;
	/** Display mode: `'waveform'` (default layout + waveform, width-adjustable) or `'classic'` (Spotify-style centre layout + seekbar, full-width). @default 'waveform' */
	mode?: 'waveform' | 'classic';
	/** Show a shuffle toggle button in the transport cluster. @default false */
	showShuffle?: boolean;
	/** Start with shuffle (random queue advance) on. @default false */
	shuffle?: boolean;
	// ── Defaults + theming ─────────────────────────────────────────────
	defaultArtwork?: string | null;
	theme?: WaveformBarTheme;
	// ── Waveform visualisation ─────────────────────────────────────────
	waveform?: boolean;
	waveformStyle?: WaveformStyle;
	waveformHeight?: number;
	barWidth?: number;
	barSpacing?: number;
	waveformColor?: string | null;
	progressColor?: string | null;
	markerColor?: string;
	// ── Sharing + errors ───────────────────────────────────────────────
	share?: boolean;
	shareParam?: string;
	errorText?: string | null;
	// ── Localizable player strings (forwarded to the embedded player) ──
	/** Seek slider spoken `aria-valuetext` template — `%1$s` current, `%2$s` total. */
	seekValueText?: string | null;
	/** Media Session title fallback when a track has no title. */
	unknownTrackText?: string | null;
	/** Play button `aria-label`. Governs player UI the bar hides; forwarded for completeness. */
	playPauseLabel?: string | null;
	/** Speed control `aria-label`. Hidden UI; forwarded for completeness. */
	speedLabel?: string | null;
	/** Artwork image alt text. Hidden UI; forwarded for completeness. */
	artworkAlt?: string | null;
	// ── Volume + persistence keys ──────────────────────────────────────
	volume?: number;
	storageKey?: string;
	// ── Server-side actions ────────────────────────────────────────────
	actions?: WaveformBarActions | null;
}

/**
 * Props accepted by `<WaveformBar>` — render this **once** in your
 * root layout. The bar library installs a global on
 * `window.WaveformBar`; calling init() twice destroys the first
 * instance and creates a fresh one.
 *
 * `class` and `style` are intentionally not listed: Vue's attribute
 * fall-through applies them to the persist host `<div>` automatically
 * (the base class `wb-host` is always present and merges with any
 * consumer `class`).
 */
export interface WaveformBarProps {
	/**
	 * Bar configuration. Pass any subset of `WaveformBarConfig`.
	 * Re-runs `init()` whenever the config's structural shape changes
	 * (compared via `JSON.stringify`), so passing a fresh object with
	 * the same shape on every render is safe.
	 */
	config?: WaveformBarConfig;

	/**
	 * Relocate the bar element into the persist host `<div>` on mount
	 * so it survives across route changes / re-renders. Also emits a
	 * `data-wb-persist` attribute on the host for CSS targeting.
	 *
	 * @default true
	 */
	persist?: boolean;

	/**
	 * DOM `id` for the persist host.
	 *
	 * @default 'waveform-bar-host'
	 */
	hostId?: string;
}

/**
 * Track metadata the bar reads from `<WaveformBarTrigger>`. Every
 * field is optional except `url` (the unique identity / play
 * target).
 */
export interface WaveformBarTrackData {
	url: string;
	id?: string;
	title?: string;
	artist?: string;
	album?: string;
	artwork?: string;
	link?: string;
	duration?: string | number;
	bpm?: string | number;
	musicalKey?: string;
	meta?: string[];
	waveform?: number[] | string;
	markers?: WaveformBarMarker[];
	favorited?: boolean;
	inCart?: boolean;
}

/**
 * Props accepted by `<WaveformBarTrigger>`.
 *
 * The component is polymorphic via the `as` prop — defaults to
 * `<button>` because that gives keyboard focus + Space/Enter
 * activation for free.
 *
 * Any standard DOM attribute / native event listener not listed here
 * (e.g. `onClick`, `data-testid`, `role`, `tabindex`, `disabled`)
 * falls through to the rendered element via Vue's attribute
 * inheritance. The track-data props below still win where names
 * overlap — the component applies its own `data-wb-*` contract last.
 *
 * Note: when rendering `as="a"`, pass `href` (a first-class prop);
 * other anchor-only attributes (`target`, `rel`) fall through at
 * runtime.
 */
export interface WaveformBarTriggerProps extends WaveformBarTrackData {
	/**
	 * Whether clicking plays the track (`'play'`) or just appends
	 * to the queue (`'queue'`).
	 *
	 * @default 'play'
	 */
	mode?: TriggerMode;

	/**
	 * HTML tag for the rendered element. Override to `'a'` for a
	 * real link, `'div'` to wrap a whole card, `'span'` for inline
	 * usage.
	 *
	 * @default 'button'
	 */
	as?: 'button' | 'a' | 'div' | 'span';

	/** `href` when `as="a"`. Ignored otherwise. */
	href?: string;

	/** Accessible label. Auto-generated from `title` when absent. */
	'aria-label'?: string;

	/**
	 * Suppress the default play / pause SVG content the component
	 * injects. Use this when you want to wrap a whole card or
	 * provide a completely custom icon set via the default slot.
	 *
	 * @default false
	 */
	noDefaultIcons?: boolean;
}
