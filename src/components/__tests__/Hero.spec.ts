import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Hero from '../Hero.vue';

describe('Hero.vue', () => {

    // Positive Tests
    it('renders the main heading "Your Next Chapter Awaits"', () => {
        const wrapper = mount(Hero);
        const h1 = wrapper.find('h1');
        expect(h1.exists()).toBe(true);
        expect(h1.text()).toContain('Your Next');
        expect(h1.text()).toContain('Chapter');
        expect(h1.text()).toContain('Awaits');
    });

    it('renders the hero image with correct alt text', () => {
        const wrapper = mount(Hero);
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('alt')).toBe('Bookstore Hero');
    });

    it('contains the expected structural CSS classes', () => {
        const wrapper = mount(Hero);
        expect(wrapper.find('section').classes()).toContain('mx-auto');
        expect(wrapper.find('section').classes()).toContain('max-w-8xl');
        expect(wrapper.find('div.bg-black\\/40').exists()).toBe(true);
    });

    // Negative Tests
    it('verify that only one h1 exists within the component', () => {
        const wrapper = mount(Hero);
        const h1s = wrapper.findAll('h1');
        expect(h1s.length).toBe(1);
    });

    it('verify that the hero image is not missing an alt attribute', () => {
        const wrapper = mount(Hero);
        const img = wrapper.find('img');
        expect(img.attributes('alt')).toBeDefined();
        expect(img.attributes('alt')).not.toBe('');
    });

    it('verify that the component does not contain any h2 elements', () => {
        const wrapper = mount(Hero);
        const h2 = wrapper.find('h2');
        expect(h2.exists()).toBe(false);
    });
});
