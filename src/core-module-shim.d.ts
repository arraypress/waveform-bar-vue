/**
 * @module core-module-shim
 * @description
 * Ambient declaration for `@arraypress/waveform-bar`. The bar core
 * library does not ship `.d.ts` types; without this shim `tsc`
 * errors on the dynamic `import('@arraypress/waveform-bar')` inside
 * `<WaveformBar>`.
 *
 * The wrapper never touches the module's exports directly — it drives
 * the bar through the `window.WaveformBar` global the library installs
 * — so `unknown` is sufficient here.
 *
 * Delete this file once the core library ships its own types —
 * TypeScript will pick those up automatically.
 */
declare module '@arraypress/waveform-bar' {
	const WaveformBar: unknown;
	export default WaveformBar;
	export { WaveformBar };
}
