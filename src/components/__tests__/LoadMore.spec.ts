import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoadMore from '../LoadMore.vue';

describe('LoadMore.vue', () => {
    // Mock IntersectionObserver
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();

    beforeEach(() => {
        global.IntersectionObserver = class {
            constructor(public callback: any, public options: any) { }
            observe = mockObserve;
            disconnect = mockDisconnect;
            unobserve = vi.fn();
            takeRecords = vi.fn();
        } as any;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    // Positive Tests
    it('renders "Load More" button when mode is button and hasMore is true', () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: null,
                mode: 'button'
            }
        });

        // ASSERT
        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.text()).toContain('Load More Books');
    });

    it('emits "load" when the button is clicked', async () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: null,
                mode: 'button'
            }
        });

        // ACT
        await wrapper.find('button').trigger('click');

        // ASSERT
        expect(wrapper.emitted('load')).toBeTruthy();
        expect(wrapper.emitted('load')?.length).toBe(1);
    });

    it('shows loading state and disables the button when isLoading is true', () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: true,
                error: null,
                mode: 'button'
            }
        });

        // ASSERT
        const button = wrapper.find('button');
        expect(button.text()).toContain('Loading...');
        expect(button.attributes('disabled')).toBeDefined();
        expect(wrapper.find('svg.animate-spin').exists()).toBe(true);
    });

    it('initializes IntersectionObserver and emits load on intersection', () => {
        // ACT
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: null,
                mode: 'infinite'
            }
        });

        // ASSERT
        expect(mockObserve).toHaveBeenCalled();

        // Simulate intersection
        const instance = (wrapper.vm as any);
        instance.handleIntersection([{ isIntersecting: true }]);
        expect(wrapper.emitted('load')).toBeTruthy();

        // Simulate non-intersection
        instance.handleIntersection([{ isIntersecting: false }]);
        expect(instance.isIntersecting).toBe(false);

        // Simulate empty intersection entries (guard clause)
        instance.handleIntersection([]);
    });

    it('renders end of collection message when route has no more books in button mode', () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: false,
                isLoading: false,
                error: null,
                mode: 'button'
            }
        });

        // ASSERT
        expect(wrapper.text()).toContain("You've reached the end of the collection.");
        expect(wrapper.find('button').exists()).toBe(false);
    });

    // Negative Tests
    it('does not emit "load" when the button is clicked while isLoading is true', async () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: true,
                error: null,
                mode: 'button'
            }
        });

        // ACT
        await wrapper.find('button').trigger('click');

        // ASSERT
        expect(wrapper.emitted('load')).toBeFalsy();
    });

    it('does not render "Load More" button when hasMore is false', () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: false,
                isLoading: false,
                error: null,
                mode: 'button'
            }
        });

        // ASSERT
        expect(wrapper.find('button').exists()).toBe(false);
    });

    it('displays error message UI when error prop is provided', () => {
        // ARRANGE
        const errorMessage = 'Failed to fetch more books';
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: errorMessage,
                mode: 'button'
            }
        });

        // ASSERT
        expect(wrapper.text()).toContain(errorMessage);
        expect(wrapper.find('div.text-red-500').exists()).toBe(true);
    });

    it('re-initializes observer when mode changes', async () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: null,
                mode: 'infinite'
            }
        });

        // Reset mocks after initial setup
        mockObserve.mockClear();
        mockDisconnect.mockClear();

        // ACT
        await wrapper.setProps({ mode: 'button' });

        // ASSERT
        expect(mockDisconnect).toHaveBeenCalled();
        // Since we switched to button, setupObserver won't call observe again
    });

    it('triggers load after a delay when loading finishes and still intersecting', async () => {
        vi.useFakeTimers();
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: true,
                error: null,
                mode: 'infinite'
            }
        });

        // Simulate intersection while loading
        const instance = (wrapper.vm as any);
        instance.isIntersecting = true;

        // ACT
        await wrapper.setProps({ isLoading: false });

        // ASSERT: Should not emit immediately
        expect(wrapper.emitted('load')).toBeFalsy();

        // ACT: Advance timers
        vi.advanceTimersByTime(100);

        // ASSERT: Should emit after delay
        expect(wrapper.emitted('load')).toBeTruthy();

        vi.useRealTimers();
    });
    it('disconnects IntersectionObserver on unmount', () => {
        // ARRANGE
        const wrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: false,
                error: null,
                mode: 'infinite'
            }
        });

        // ACT
        wrapper.unmount();

        // ASSERT
        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('renders correct state in infinite mode (loading and no more)', async () => {
        // ARRANGE: Loading
        const loadingWrapper = mount(LoadMore, {
            props: {
                hasMore: true,
                isLoading: true,
                error: null,
                mode: 'infinite'
            }
        });
        expect(loadingWrapper.text()).toContain('Discovering more books...');

        // ARRANGE: No more
        const noMoreWrapper = mount(LoadMore, {
            props: {
                hasMore: false,
                isLoading: false,
                error: null,
                mode: 'infinite'
            }
        });
        expect(noMoreWrapper.text()).toContain("You've explored all available books");
    });
});
