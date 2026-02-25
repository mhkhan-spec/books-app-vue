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

    it('renders all categories fetched from the service', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        
        // ACT
        await flushPromises();

        // ASSERT
        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(mockCategories.length + 1);
        expect(wrapper.text()).toContain('Fiction');
        expect(wrapper.text()).toContain('Non-Fiction');
        expect(wrapper.text()).toContain('Science');
    });

    it('sets active category and updates URL query on click', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        await flushPromises();

        // ACT
        const fictionButton = wrapper.findAll('button').find(b => b.text() === 'Fiction');
        await fictionButton?.trigger('click');

        // ASSERT
        expect(mockPush).toHaveBeenCalledWith({
            query: { category: 'Fiction' }
        });
    });

    it('triggers search update with debounce and clears previous timeout', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        const input = wrapper.find('input');

        // ACT
        await input.setValue('Harry');
        vi.advanceTimersByTime(100);
        await input.setValue('Harry Potter'); // This triggers the clearTimeout logic
        vi.advanceTimersByTime(300);

        // ASSERT
        expect(mockPush).toHaveBeenCalledWith({
            query: { search: 'Harry Potter' }
        });
    });

    it('shows error UI and retry button when listCategories throws', async () => {
        // ARRANGE
        (listCategories as any).mockRejectedValue(new Error('API Error'));

        // ACT
        const wrapper = mount(Categories);
        await flushPromises();

        // ASSERT
        expect(wrapper.text()).toContain('Failed to load categories');
        const retryButton = wrapper.find('button.underline');
        expect(retryButton.exists()).toBe(true);
    });

    it('correctly handles empty category list (only shows "All Books")', async () => {
        // ARRANGE
        (listCategories as any).mockResolvedValue([]);

        // ACT
        const wrapper = mount(Categories);
        await flushPromises();

        // ASSERT
        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(1);
        expect(buttons[0]?.text()).toBe('All Books');
    });

    it('handles missing route queries gracefully', async () => {
        // ARRANGE
        (useRoute as any).mockReturnValue({ query: {} });

        // ACT
        const wrapper = mount(Categories);
        await flushPromises();

        // ASSERT
        const allBooksButton = wrapper.findAll('button').find(b => b.text() === 'All Books');
        expect(allBooksButton?.classes()).toContain('bg-primary');
        const input = wrapper.find('input');
        expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('deselects an active category when clicked again', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        await flushPromises();
        const fictionButton = wrapper.findAll('button').find(b => b.text() === 'Fiction');

        // ACT
        await fictionButton?.trigger('click'); // Select
        await fictionButton?.trigger('click'); // Deselect

        // ASSERT
        expect(mockPush).toHaveBeenLastCalledWith({
            query: { category: undefined }
        });
    });

    it('clears search query and updates URL when input is emptied', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        const input = wrapper.find('input');
        await input.setValue('Harry Potter');

        // ACT
        await input.setValue('');
        vi.advanceTimersByTime(300);

        // ASSERT
        expect(mockPush).toHaveBeenLastCalledWith({ query: {} });
    });

    it('clears search query when the clear button (X icon) is clicked', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        const input = wrapper.find('input');
        await input.setValue('Science');
        vi.advanceTimersByTime(300);

        // ACT
        const clearButton = wrapper.find('div.absolute.inset-y-0.right-0');
        await clearButton.trigger('click');
        vi.advanceTimersByTime(300);

        // ASSERT
        expect((input.element as HTMLInputElement).value).toBe('');
        expect(mockPush).toHaveBeenLastCalledWith({ query: {} });
    });

    it('clears search query via clearSearch function (Direct State Test)', async () => {
        // ARRANGE
        const wrapper = mount(Categories);
        await wrapper.find('input').setValue('Science');

        // ACT
        const clearButton = wrapper.find('div.absolute.right-0');
        await clearButton.trigger('click');

        // ASSERT
        expect((wrapper.vm as any).searchQuery).toBe('');
        vi.advanceTimersByTime(300);
        expect(mockPush).toHaveBeenLastCalledWith({ query: {} });
    });

    it('handles "All Books" click by setting category to empty string', async () => {
        // ARRANGE
        (useRoute as any).mockReturnValue({ query: { category: 'Fiction' } });
        const wrapper = mount(Categories);
        await flushPromises();

        // ACT
        const allBooksButton = wrapper.findAll('button').find(b => b.text() === 'All Books');
        await allBooksButton?.trigger('click');

        // ASSERT
        expect(mockPush).toHaveBeenCalledWith({ query: { category: '' } });
    });

    it('initializes with values from route query', async () => {
        // ARRANGE
        (useRoute as any).mockReturnValue({
            query: { category: 'Science', search: 'Plato' }
        });

        // ACT
        const wrapper = mount(Categories);
        await flushPromises();

        // ASSERT
        expect((wrapper.find('input').element as HTMLInputElement).value).toBe('Plato');
        const scienceButton = wrapper.findAll('button').find(b => b.text() === 'Science');
        expect(scienceButton?.classes()).toContain('bg-primary');
    });
});