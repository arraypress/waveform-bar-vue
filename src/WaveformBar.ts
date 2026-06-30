/**
 * WaveformBar.ts
 * --------------
 *
 * Singleton mount component for `@arraypress/waveform-bar`.
 *
 * Render this **once** in your root layout / app entry. It renders
 * a persist host `<div>` and runs `window.WaveformBar.init(config)`
 * inside `onMounted` — the core library scans the page for
 * `[data-wb-play]` / `[data-wb-queue]` triggers (rendered by
 * `<WaveformBarTrigger>`) and binds click handlers automatically.
 *
 * Authored as a `defineComponent` with a render function (rather
 * than an SFC) so the package builds with `tsup` — the same dual
 * ESM/CJS + `.d.ts` toolchain as the React wrapper — and ships no
 * `.vue` compile step for consumers to worry about.
 *
 * ## Setup
 *
 * Load both core libraries' JS + CSS in your app entry (the bar has
 * a strict runtime dependency on the player). **Order matters** —
 * the player installs `window.WaveformPlayer`, which the bar needs:
 *
 * ```ts
 * // main.ts
 * import '@arraypress/waveform-player/dist/waveform-player.css';
 * import '@arraypress/waveform-bar/dist/waveform-bar.css';
 * import '@arraypress/waveform-player';   // sets window.WaveformPlayer
 * import '@arraypress/waveform-bar';      // sets window.WaveformBar
 * ```
 *
 * Then drop `<WaveformBar>` once in your layout:
 *
 * ```vue
 * <script setup lang="ts">
 * import { WaveformBar } from '@arraypress/waveform-bar-vue';
 * </script>
 *
 * <template>
 *   <RouterView />
 *   <WaveformBar :config="{ persist: true, continuous: true }" />
 * </template>
 * ```
 *
 * ## What the component does
 *
 * - Renders a `<div :id="hostId">` for the persist host.
 * - On mount, dynamically `import()`s the core library (SSR-safe)
 *   and calls `window.WaveformBar.init(config)`.
 * - When `config` (or `persist`) changes, calls `init()` again — the
 *   library handles destroy-and-recreate internally, so callers
 *   don't have to manage it.
 * - On unmount, calls `window.WaveformBar.destroy()` so the bar
 *   doesn't leak listeners across app remounts.
 *
 * @module WaveformBar
 */
import {
	defineComponent,
	h,
	onBeforeUnmount,
	onMounted,
	ref,
	watch,
	type PropType,
} from 'vue';
import type { WaveformBarConfig } from './types';

/** Minimal structural view of the global the wrapper drives. */
type BarGlobal = {
	init: (config?: unknown) => void;
	destroy?: () => void;
};

/**
 * Resolve the bar singleton the library installs on `window`. The
 * dynamic `import()` is awaited purely to trigger client-side
 * loading (the side-effecting import sets the global); the wrapper
 * always talks to the bar through `window.WaveformBar`, mirroring
 * the React wrapper.
 */
function getBarGlobal(): BarGlobal | null {
	return (
		(typeof window !== 'undefined' &&
			(window as unknown as { WaveformBar?: BarGlobal }).WaveformBar) ||
		null
	);
}

/**
 * Stable string key built from a config object so the re-init watch
 * can compare deep structure by value rather than by reference. A
 * consumer passing a fresh object with the same shape every render
 * therefore doesn't trigger churn. `JSON.stringify` is good enough —
 * the config is small (a few dozen primitive fields). Functions
 * inside `actions.endpoint` collapse to a sentinel (JSON can't
 * serialise them), so callers passing function endpoints should keep
 * the config object reference stable to avoid re-init.
 */
function configKey(config?: WaveformBarConfig): string {
	if (!config) return '';
	try {
		return JSON.stringify(config, (_key, value) =>
			typeof value === 'function' ? '<<fn>>' : value
		);
	} catch {
		return '';
	}
}

/**
 * `WaveformBar` — Vue 3 component wrapping the persistent bottom-bar
 * singleton from `@arraypress/waveform-bar`.
 *
 * Render this exactly ONCE per app. Multiple mounts result in
 * repeated `init()` calls — the last one wins, the earlier ones get
 * torn down.
 *
 * `class` and `style` fall through to the persist host `<div>` via
 * Vue's attribute inheritance — the base class `wb-host` is always
 * applied.
 *
 * @example Bare
 *   <WaveformBar />
 *
 * @example With config
 *   <WaveformBar
 *     host-id="my-app-bar"
 *     :config="{
 *       persist: true,
 *       continuous: true,
 *       showQueue: true,
 *       maxMeta: 1,
 *       storageKey: 'my-app-bar',
 *       actions: {
 *         favorite: { endpoint: '/api/favorites' },
 *         cart:     { endpoint: '/api/cart' },
 *       },
 *     }"
 *   />
 */
export const WaveformBar = defineComponent({
	name: 'WaveformBar',
	props: {
		/** Bar configuration. Pass any subset of `WaveformBarConfig`. */
		config: { type: Object as PropType<WaveformBarConfig>, default: undefined },
		/** Relocate the bar into the persist host so it survives routing. */
		persist: { type: Boolean, default: true },
		/** DOM `id` for the persist host. */
		hostId: { type: String, default: 'waveform-bar-host' },
	},
	setup(props) {
		const host = ref<HTMLDivElement | null>(null);
		/* Monotonic token: every (re)init bumps it; an in-flight async
		 * import whose token is stale (superseded by a newer init or by
		 * unmount) bails instead of acting on a torn-down component. */
		let initToken = 0;

		/**
		 * Relocate the bar element under our persist host so routing
		 * changes / view transitions don't tear it down. The library
		 * appends `.waveform-bar` to `<body>` by default; we move it
		 * under our host.
		 */
		function relocate() {
			if (!props.persist) return;
			const el = host.value;
			const bar = document.querySelector('.waveform-bar');
			if (el && bar && bar.parentElement !== el) {
				el.appendChild(bar);
			}
		}

		/**
		 * Init / re-init. Runs on mount and whenever the config key (or
		 * `persist`) changes. The library's `init()` is idempotent — it
		 * destroys the previous instance before creating a new one.
		 */
		function init() {
			const myToken = ++initToken;

			/* Browser-only library — defer the import to the client so
			 * SSR doesn't evaluate the audio + canvas + fetch surface. */
			void import('@arraypress/waveform-bar')
				.then(() => {
					if (myToken !== initToken) return; // superseded

					const bar = getBarGlobal();
					if (!bar) {
						console.warn(
							'[WaveformBarVue] window.WaveformBar is undefined after import. ' +
								'Make sure @arraypress/waveform-player is loaded BEFORE @arraypress/waveform-bar.'
						);
						return;
					}

					try {
						bar.init(props.config);
					} catch (err) {
						console.error('[WaveformBarVue] init() failed:', err);
						return;
					}

					relocate();
				})
				.catch((err) => {
					console.error('[WaveformBarVue] Failed to load core library:', err);
				});
		}

		/** Tear the bar down so remounts / route changes don't leak listeners. */
		function destroy() {
			const bar = getBarGlobal();
			try {
				bar?.destroy?.();
			} catch (err) {
				console.warn('[WaveformBarVue] destroy() threw during cleanup:', err);
			}
		}

		onMounted(init);
		onBeforeUnmount(() => {
			initToken++; // invalidate any in-flight import
			destroy();
		});

		/* Re-init when the config's structural shape (or `persist`)
		 * changes. Comparing a derived string by value means a fresh
		 * config object with the same shape doesn't churn the bar. */
		watch(
			() => `${configKey(props.config)}::${props.persist}`,
			() => {
				init();
			}
		);

		return () =>
			h('div', {
				ref: host,
				id: props.hostId,
				class: 'wb-host',
				'data-wb-persist': props.persist ? 'true' : undefined,
			});
	},
});

export default WaveformBar;
