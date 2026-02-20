import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createStore } from 'vuex';
import Navbar from '../Navbar.vue';
import CartPreview from '../CartPreview.vue';

// Mock RouterLink and Router
const mockRouterLink = {
    template: '<a><slot /></a>',
    props: ['to']
};

describe('Navbar.vue', () => {
    let store: any;
    let totalItems: number;

    const createMockStore = (items: number) => {
        return createStore({
            getters: {
                totalItems: () => items,
            },
        });
    };

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Positive Tests
    it('renders the logo and store name', () => {
        store = createMockStore(0);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': true
                }
            }
        });

        expect(wrapper.find('img').attributes('alt')).toBe('BookStore Logo');
        expect(wrapper.text()).toContain('BookStore');
    });

    it('displays the correct number of items in the cart badge from Vuex store', () => {
        totalItems = 5;
        store = createMockStore(totalItems);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': true
                }
            }
        });

        const badge = wrapper.find('.bg-emerald-500');
        expect(badge.exists()).toBe(true);
        expect(badge.text()).toBe('5');
    });

    it('shows CartPreview when mouse enters the cart container', async () => {
        store = createMockStore(2);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': { template: '<div class="cart-preview-stub">Cart Preview</div>' }
                }
            }
        });

        const cartContainer = wrapper.find('.relative.flex.items-center');
        await cartContainer.trigger('mouseenter');

        expect(wrapper.find('.cart-preview-stub').exists()).toBe(true);
    });

    // Negative Tests
    it('does not display the cart badge when totalItems is 0', () => {
        store = createMockStore(0);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': true
                }
            }
        });

        const badge = wrapper.find('.bg-emerald-500');
        expect(badge.exists()).toBe(false);
    });

    it('does not show CartPreview by default', () => {
        store = createMockStore(2);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': { template: '<div class="cart-preview-stub">Cart Preview</div>' }
                }
            }
        });

        expect(wrapper.find('.cart-preview-stub').exists()).toBe(false);
    });

    it('hides CartPreview after a delay on mouse leave', async () => {
        store = createMockStore(2);
        const wrapper = mount(Navbar, {
            global: {
                plugins: [store],
                stubs: {
                    'router-link': mockRouterLink,
                    'CartPreview': { template: '<div class="cart-preview-stub">Cart Preview</div>' }
                }
            }
        });

        const cartContainer = wrapper.find('.relative.flex.items-center');

        // Show it first
        await cartContainer.trigger('mouseenter');
        expect(wrapper.find('.cart-preview-stub').exists()).toBe(true);

        // Leave
        await cartContainer.trigger('mouseleave');

        // Should still be there before timeout
        expect(wrapper.find('.cart-preview-stub').exists()).toBe(true);

        // Advance timers
        vi.advanceTimersByTime(300);
        await wrapper.vm.$nextTick();

        // Should be gone
        expect(wrapper.find('.cart-preview-stub').exists()).toBe(false);
    });
});
