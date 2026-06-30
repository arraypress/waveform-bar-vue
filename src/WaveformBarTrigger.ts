/**
 * WaveformBarTrigger.ts
 * ---------------------
 *
 * Polymorphic Vue trigger that wires an element up to the persistent
 * `<WaveformBar>`. Emits the `data-wb-*` attribute contract the core
 * library scans for at runtime — the library handles its own click
 * delegation, so we just put the attributes on the element and the
 * rest is plumbed automatically.
 *
 * Authored as a `defineComponent` with a render function (rather than
 * an SFC) so the package builds with `tsup` — the same toolchain as
 * the rest of the family.
 *
 * ## What it renders
 *
 * Defaults to a `<button>` (the most accessible choice — keyboard
 * focus, Space / Enter activation, implicit `role="button"`). Override
 * via `as`:
 *
 * ```vue
 * <WaveformBarTrigger as="div" :url="track.url">
 *   <article class="product-card">…</article>
 * </WaveformBarTrigger>
 * ```
 *
 * ## Default content
 *
 * Without slot content, the component renders two SVGs the library's
 * `.wb-icon-swap` CSS toggles (`.wb-show-play` / `.wb-show-pause`).
 * Provide default-slot content to replace them, or set `noDefaultIcons`
 * to suppress the defaults entirely.
 *
 * `class`, `style`, native listeners (`@click`), and any other DOM
 * attributes fall through to the rendered element via Vue's attribute
 * inheritance (`inheritAttrs: false` + a manual spread, so the
 * component's own `data-wb-*` contract is applied last and always wins).
 *
 * @module WaveformBarTrigger
 */
import { defineComponent, h, type PropType } from 'vue';
import type { TriggerMode, WaveformBarMarker } from './types';

/**
 * Stringify a value into a `data-*` attribute. Returns `undefined`
 * for nullish so the attribute isn't emitted at all (letting the
 * library apply its defaults), and JSON-stringifies arrays / objects
 * so the library can `JSON.parse()` them.
 */
function toAttr(value: unknown): string | undefined {
	if (value === undefined || value === null) return undefined;
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	if (typeof value === 'string') return value;
	return JSON.stringify(value);
}

/**
 * Default play / pause SVG pair. The library's `.wb-icon-swap` CSS
 * toggles their visibility based on whether this trigger's track is
 * currently active.
 */
function defaultIcons() {
	return [
		h(
			'svg',
			{ class: 'wb-show-play', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' },
			[h('path', { d: 'M8 5v14l11-7z' })]
		),
		h(
			'svg',
			{ class: 'wb-show-pause', viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': 'true' },
			[h('path', { d: 'M6 5h4v14H6zM14 5h4v14h-4z' })]
		),
	];
}

/**
 * `WaveformBarTrigger` — clickable element that tells the persistent
 * `<WaveformBar>` to play / queue a track.
 *
 * @example Card with play button
 *   <WaveformBarTrigger :url="previewUrl" :title="title" :artist="artist" :artwork="cover" />
 *
 * @example Add-to-queue with custom content
 *   <WaveformBarTrigger mode="queue" :url="track.url" :title="track.title">+ Queue</WaveformBarTrigger>
 */
export const WaveformBarTrigger = defineComponent({
	name: 'WaveformBarTrigger',
	inheritAttrs: false,
	props: {
		/** Whether clicking plays the track (`'play'`) or queues it (`'queue'`). */
		mode: { type: String as PropType<TriggerMode>, default: 'play' },
		/** HTML tag for the rendered element. */
		as: { type: String as PropType<'button' | 'a' | 'div' | 'span'>, default: 'button' },
		/** Audio file URL / play target (the track's identity). */
		url: { type: String, default: undefined },
		id: { type: String, default: undefined },
		title: { type: String, default: undefined },
		artist: { type: String, default: undefined },
		album: { type: String, default: undefined },
		artwork: { type: String, default: undefined },
		link: { type: String, default: undefined },
		duration: { type: [String, Number], default: undefined },
		bpm: { type: [String, Number], default: undefined },
		musicalKey: { type: String, default: undefined },
		meta: { type: Array as PropType<string[]>, default: undefined },
		waveform: { type: [Array, String] as PropType<number[] | string>, default: undefined },
		markers: { type: Array as PropType<WaveformBarMarker[]>, default: undefined },
		favorited: { type: Boolean, default: undefined },
		inCart: { type: Boolean, default: undefined },
		/** `href` when `as="a"`. Ignored otherwise. */
		href: { type: String, default: undefined },
		/** Suppress the default play / pause SVGs (slot content still renders). */
		noDefaultIcons: { type: Boolean, default: false },
	},
	setup(props, { slots, attrs }) {
		return () => {
			const tag = props.as;

			/* Build the `data-wb-*` attribute map by hand so omitted props
			 * don't emit empty attributes (which the library would treat as
			 * "set but blank"). */
			const dataAttrs: Record<string, string | undefined> = {
				[props.mode === 'queue' ? 'data-wb-queue' : 'data-wb-play']: '',
				'data-wb-url': toAttr(props.url),
				'data-wb-id': toAttr(props.id ?? props.url),
				'data-wb-title': toAttr(props.title),
				'data-wb-artist': toAttr(props.artist),
				'data-wb-album': toAttr(props.album),
				'data-wb-artwork': toAttr(props.artwork),
				'data-wb-link': toAttr(props.link),
				'data-wb-duration': toAttr(props.duration),
				'data-wb-bpm': toAttr(props.bpm),
				'data-wb-key': toAttr(props.musicalKey),
				'data-wb-meta':
					Array.isArray(props.meta) && props.meta.length > 0 ? JSON.stringify(props.meta) : undefined,
				'data-wb-waveform': Array.isArray(props.waveform)
					? JSON.stringify(props.waveform)
					: toAttr(props.waveform),
				'data-wb-markers':
					Array.isArray(props.markers) && props.markers.length > 0
						? JSON.stringify(props.markers)
						: undefined,
				'data-wb-favorited': toAttr(props.favorited),
				'data-wb-in-cart': toAttr(props.inCart),
			};

			/* Auto-generate an accessible label when the consumer didn't
			 * supply one (matches the reference theme's wording). */
			const ariaLabel =
				(attrs['aria-label'] as string | undefined) ??
				(props.mode === 'queue'
					? props.title
						? `Add ${props.title} to queue`
						: 'Add to queue'
					: props.title
						? `Play ${props.title}`
						: 'Play');

			const mergedClass = ['wb-icon-swap', attrs.class as string | undefined]
				.filter(Boolean)
				.join(' ');

			/* Fall-through attrs (`@click`, `style`, `role`, …) are spread
			 * FIRST so the component's own contract below always wins. */
			const elAttrs: Record<string, unknown> = {
				...attrs,
				...dataAttrs,
				class: mergedClass,
				'aria-label': ariaLabel,
			};
			if (tag === 'a') elAttrs.href = props.href;
			if (tag === 'button') elAttrs.type = 'button';

			const content = slots.default
				? slots.default()
				: props.noDefaultIcons
					? undefined
					: defaultIcons();

			return h(tag, elAttrs, content);
		};
	},
});

export default WaveformBarTrigger;
