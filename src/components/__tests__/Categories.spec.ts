import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Categories from '../Categories.vue';
import { listCategories } from '@/services/categories';
import { useRouter, useRoute } from 'vue-router';

// Mock services and hooks
vi.mock('@/services/categories', () => ({
    listCategories: vi.fn()
}));

vi.mock('vue-router', () => ({
    useRouter: vi.fn(),
    useRoute: vi.fn()
}));

describe('Categories.vue', () => {
    const mockPush = vi.fn();
    const mockCategories = ['Fiction', 'Non-Fiction', 'Science'];

    beforeEach(() => {
        vi.useFakeTimers();
        (useRouter as any).mockReturnValue({
            push: mockPush
        });
        (useRoute as any).mockReturnValue({
            query: {}
        });
        (listCategories as any).mockResolvedValue(mockCategories);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    // Positive Tests
    it('renders all categories fetched from the service', async () => {
        const wrapper = mount(Categories);
        await flushPromises();

        const buttons = wrapper.findAll('button');
        // 'All Books' + mockCategories
        expect(buttons.length).toBe(mockCategories.length + 1);
        expect(wrapper.text()).toContain('Fiction');
        expect(wrapper.text()).toContain('Non-Fiction');
        expect(wrapper.text()).toContain('Science');
    });

    it('sets active category and updates URL query on click', async () => {
        const wrapper = mount(Categories);
        await flushPromises();

        const fictionButton = wrapper.findAll('button').find(b => b.text() === 'Fiction');
        await fictionButton?.trigger('click');

        expect(mockPush).toHaveBeenCalledWith({
            query: { category: 'Fiction' }
        });
    });

    it('triggers search update with debounce', async () => {
        const wrapper = mount(Categories);
        const input = wrapper.find('input');

        await input.setValue('Harry Potter');

        // Should not have called push yet due to debounce
        expect(mockPush).not.toHaveBeenCalled();

        // Advance timers by 300ms
        vi.advanceTimersByTime(300);

        expect(mockPush).toHaveBeenCalledWith({
            query: { search: 'Harry Potter' }
        });
    });

    // Negative Tests
    it('shows error UI and retry button when listCategories throws', async () => {
        (listCategories as any).mockRejectedValue(new Error('API Error'));

        const wrapper = mount(Categories);
        await flushPromises();

        expect(wrapper.text()).toContain('Failed to load categories');
        const retryButton = wrapper.find('button.underline');
        expect(retryButton.exists()).toBe(true);
        expect(retryButton.text()).toBe('Retry');
    });

    it('correctly handles empty category list (only shows "All Books")', async () => {
        (listCategories as any).mockResolvedValue([]);

        const wrapper = mount(Categories);
        await flushPromises();

        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(1);
        expect(buttons[0]?.text()).toBe('All Books');
    });

    it('handles missing route queries gracefully', async () => {
        // Mock route with missing query params
        (useRoute as any).mockReturnValue({
            query: {}
        });

        const wrapper = mount(Categories);
        await flushPromises();

        const allBooksButton = wrapper.findAll('button').find(b => b.text() === 'All Books');
        // 'All Books' should be active by default if no category in query
        expect(allBooksButton?.classes()).toContain('bg-primary');

        const input = wrapper.find('input');
        expect((input.element as HTMLInputElement).value).toBe('');
    });
});
