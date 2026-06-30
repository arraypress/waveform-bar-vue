/**
 * WaveformBar.test.ts
 * -------------------
 *
 * The core `@arraypress/waveform-bar` library is mocked at the module
 * boundary, and the global it installs (`window.WaveformBar`) is
 * stubbed. These tests cover the wrapper's own responsibilities:
 *
 *   - `<WaveformBar>`         — renders the persist host, calls
 *                               `init(config)` on mount, re-inits on
 *                               config change, destroys on unmount.
 *   - `<WaveformBarTrigger>`  — renders the chosen element with the
 *                               correct `data-wb-*` attributes, honours
 *                               `as` / `mode` / `noDefaultIcons`, merges
 *                               fall-through class, and fires clicks.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

/* The component imports the library only for its global side effect and
 * then talks to window.WaveformBar — so the module mock can be empty. */
vi.mock('@arraypress/waveform-bar', () => ({ default: {}, WaveformBar: {} }));

import { WaveformBar, WaveformBarTrigger } from '../src';

const init = vi.fn();
const destroy = vi.fn();

beforeEach(() => {
	init.mockClear();
	destroy.mockClear();
	(window as unknown as { WaveformBar: unknown }).WaveformBar = { init, destroy };
});

describe('WaveformBar (Vue)', () => {
	it('renders the persist host div with id + base class', () => {
		const wrapper = mount(WaveformBar, { props: { hostId: 'my-bar' } });
		const host = wrapper.find('div#my-bar');
		expect(host.exists()).toBe(true);
		expect(host.classes()).toContain('wb-host');
		expect(host.attributes('data-wb-persist')).toBe('true');
	});

	it('calls init(config) on mount', async () => {
		const config = { persist: true, continuous: true };
		mount(WaveformBar, { props: { config } });
		await flushPromises();
		expect(init).toHaveBeenCalledTimes(1);
		expect(init).toHaveBeenCalledWith(config);
	});

	it('re-inits when the config shape changes', async () => {
		const wrapper = mount(WaveformBar, { props: { config: { continuous: true } } });
		await flushPromises();
		expect(init).toHaveBeenCalledTimes(1);
		await wrapper.setProps({ config: { continuous: false, showQueue: true } });
		await flushPromises();
		expect(init).toHaveBeenCalledTimes(2);
		expect(init).toHaveBeenLastCalledWith({ continuous: false, showQueue: true });
	});

	it('does NOT re-init when a fresh config object has the same shape', async () => {
		const wrapper = mount(WaveformBar, { props: { config: { continuous: true } } });
		await flushPromises();
		expect(init).toHaveBeenCalledTimes(1);
		await wrapper.setProps({ config: { continuous: true } });
		await flushPromises();
		expect(init).toHaveBeenCalledTimes(1);
	});

	it('destroys the bar on unmount', async () => {
		const wrapper = mount(WaveformBar);
		await flushPromises();
		wrapper.unmount();
		expect(destroy).toHaveBeenCalledTimes(1);
	});
});

describe('WaveformBarTrigger (Vue)', () => {
	it('renders a <button> by default with the data-wb-play contract', () => {
		const wrapper = mount(WaveformBarTrigger, {
			props: { url: '/a.mp3', title: 'Song A', artist: 'Artist' },
		});
		const btn = wrapper.find('button');
		expect(btn.exists()).toBe(true);
		expect(btn.attributes('type')).toBe('button');
		expect(btn.attributes('data-wb-play')).toBe('');
		expect(btn.attributes('data-wb-url')).toBe('/a.mp3');
		expect(btn.attributes('data-wb-id')).toBe('/a.mp3'); // falls back to url
		expect(btn.attributes('data-wb-title')).toBe('Song A');
		expect(btn.attributes('data-wb-artist')).toBe('Artist');
		expect(btn.classes()).toContain('wb-icon-swap');
		expect(btn.attributes('aria-label')).toBe('Play Song A');
	});

	it('omits data-wb-* attributes for absent props', () => {
		const wrapper = mount(WaveformBarTrigger, { props: { url: '/a.mp3' } });
		const btn = wrapper.find('button');
		expect(btn.attributes('data-wb-artist')).toBeUndefined();
		expect(btn.attributes('data-wb-album')).toBeUndefined();
		expect(btn.attributes('data-wb-markers')).toBeUndefined();
	});

	it('uses data-wb-queue + queue aria-label in queue mode', () => {
		const wrapper = mount(WaveformBarTrigger, {
			props: { url: '/a.mp3', title: 'Song A', mode: 'queue' },
		});
		const btn = wrapper.find('button');
		expect(btn.attributes('data-wb-queue')).toBe('');
		expect(btn.attributes('data-wb-play')).toBeUndefined();
		expect(btn.attributes('aria-label')).toBe('Add Song A to queue');
	});

	it('JSON-encodes meta / markers arrays', () => {
		const markers = [{ time: 0, label: 'Intro' }];
		const wrapper = mount(WaveformBarTrigger, {
			props: { url: '/a.mp3', meta: ['320kbps', 'WAV'], markers },
		});
		const btn = wrapper.find('button');
		expect(btn.attributes('data-wb-meta')).toBe(JSON.stringify(['320kbps', 'WAV']));
		expect(btn.attributes('data-wb-markers')).toBe(JSON.stringify(markers));
	});

	it('renders as an anchor with href when as="a"', () => {
		const wrapper = mount(WaveformBarTrigger, {
			props: { as: 'a', href: '/track/1', url: '/a.mp3' },
		});
		const a = wrapper.find('a');
		expect(a.exists()).toBe(true);
		expect(a.attributes('href')).toBe('/track/1');
		expect(a.attributes('data-wb-play')).toBe('');
	});

	it('renders default play/pause icons, suppressed by noDefaultIcons', () => {
		const withIcons = mount(WaveformBarTrigger, { props: { url: '/a.mp3' } });
		expect(withIcons.find('svg.wb-show-play').exists()).toBe(true);
		expect(withIcons.find('svg.wb-show-pause').exists()).toBe(true);

		const noIcons = mount(WaveformBarTrigger, { props: { url: '/a.mp3', noDefaultIcons: true } });
		expect(noIcons.find('svg').exists()).toBe(false);
	});

	it('renders slot content instead of default icons', () => {
		const wrapper = mount(WaveformBarTrigger, {
			props: { url: '/a.mp3' },
			slots: { default: '+ Queue' },
		});
		expect(wrapper.text()).toContain('+ Queue');
		expect(wrapper.find('svg').exists()).toBe(false);
	});

	it('merges fall-through class + forwards a click listener', async () => {
		const onClick = vi.fn();
		const wrapper = mount(WaveformBarTrigger, {
			props: { url: '/a.mp3' },
			attrs: { class: 'card-btn', onClick },
		});
		const btn = wrapper.find('button');
		expect(btn.classes()).toContain('wb-icon-swap');
		expect(btn.classes()).toContain('card-btn');
		await btn.trigger('click');
		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
