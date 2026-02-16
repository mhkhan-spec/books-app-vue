import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BookForm from '../BookForm.vue';
import { createBook } from '@/services/books';
import { useRouter } from 'vue-router';

// Mock dependencies
vi.mock('@/services/books', () => ({
    createBook: vi.fn(),
}));

vi.mock('vue-router', () => ({
    useRouter: vi.fn(),
}));

describe('BookForm.vue', () => {
    const pushMock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({
            push: pushMock,
        });
    });

    const fillForm = async (wrapper: any) => {
        await wrapper.find('input[type="url"]').setValue('https://example.com/cover.jpg');
        await wrapper.find('input[placeholder="Title"]').setValue('Test Book');
        await wrapper.find('input[placeholder="Author"]').setValue('Test Author');
        await wrapper.find('input[placeholder="0.00"]').setValue('29.99');
        await wrapper.find('input[type="number"]').setValue(10);
        await wrapper.find('select').setValue('Fiction');
        await wrapper.find('textarea').setValue('Test description');
    };

    // --- Positive Test Cases (+ve) ---

    it('renders all input fields and labels correctly', () => {
        const wrapper = mount(BookForm);

        const labels = wrapper.findAll('label');
        const labelTexts = labels.map(l => l.text());

        expect(labelTexts).toContain('Image URL');
        expect(labelTexts).toContain('Title');
        expect(labelTexts).toContain('Author');
        expect(labelTexts).toContain('Price');
        expect(labelTexts).toContain('Stock');
        expect(labelTexts).toContain('Category');
        expect(labelTexts).toContain('Description');

        expect(wrapper.find('input[type="url"]').exists()).toBe(true);
        expect(wrapper.find('input[placeholder="Title"]').exists()).toBe(true);
        expect(wrapper.find('input[placeholder="Author"]').exists()).toBe(true);
        expect(wrapper.find('input[placeholder="0.00"]').exists()).toBe(true);
        expect(wrapper.find('input[type="number"]').exists()).toBe(true);
        expect(wrapper.find('select').exists()).toBe(true);
        expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('updates reactive form state when inputs are changed', async () => {
        const wrapper = mount(BookForm);
        const titleInput = wrapper.find('input[placeholder="Title"]');

        await titleInput.setValue('New Title');

        // Accessing reactive state indirectly via input value or mock calls later
        expect((titleInput.element as any).value).toBe('New Title');
    });

    it('calls createBook with correct data on submission', async () => {
        (createBook as any).mockResolvedValue({});
        const wrapper = mount(BookForm);

        await fillForm(wrapper);
        await wrapper.find('form').trigger('submit.prevent');

        expect(createBook).toHaveBeenCalledWith({
            title: 'Test Book',
            author: 'Test Author',
            price: '29.99',
            category: 'Fiction',
            cover: 'https://example.com/cover.jpg',
            description: 'Test description',
            stock: 10
        });
    });

    it('resets form fields after successful submission', async () => {
        (createBook as any).mockResolvedValue({});
        const wrapper = mount(BookForm);

        await fillForm(wrapper);
        await wrapper.find('form').trigger('submit.prevent');

        // After resolution of handleSubmit
        await vi.waitFor(() => {
            expect((wrapper.find('input[placeholder="Title"]').element as any).value).toBe('');
            expect((wrapper.find('input[type="number"]').element as any).value).toBe('0');
        });
    });

    it('calls onSuccess prop upon successful book creation', async () => {
        (createBook as any).mockResolvedValue({});
        const onSuccessMock = vi.fn();
        const wrapper = mount(BookForm, {
            props: { onSuccess: onSuccessMock }
        });

        await fillForm(wrapper);
        await wrapper.find('form').trigger('submit.prevent');

        await vi.waitFor(() => {
            expect(onSuccessMock).toHaveBeenCalled();
        });
    });

    // --- Negative Test Cases (-ve) ---

    it('logs error if createBook service fails', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        (createBook as any).mockRejectedValue(new Error('API Error'));
        // Mock alert to prevent test hanging
        vi.stubGlobal('alert', vi.fn());

        const wrapper = mount(BookForm);
        await fillForm(wrapper);
        await wrapper.find('form').trigger('submit.prevent');

        await vi.waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Failed to create book:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('disables submit button while submitting', async () => {
        let resolveSubmit: any;
        (createBook as any).mockReturnValue(new Promise((resolve) => {
            resolveSubmit = resolve;
        }));

        const wrapper = mount(BookForm);
        await fillForm(wrapper);
        await wrapper.find('form').trigger('submit.prevent');

        const button = wrapper.find('button[type="submit"]');
        expect(button.attributes()).toHaveProperty('disabled');
        expect(button.text()).toContain('Creating...');

        resolveSubmit({});
    });

    it('has required attribute on essential fields', () => {
        const wrapper = mount(BookForm);

        expect(wrapper.find('input[type="url"]').attributes()).toHaveProperty('required');
        expect(wrapper.find('input[placeholder="Title"]').attributes()).toHaveProperty('required');
        expect(wrapper.find('input[placeholder="Author"]').attributes()).toHaveProperty('required');
        expect(wrapper.find('input[placeholder="0.00"]').attributes()).toHaveProperty('required');
        expect(wrapper.find('input[type="number"]').attributes()).toHaveProperty('required');
        expect(wrapper.find('select').attributes()).toHaveProperty('required');
        expect(wrapper.find('textarea').attributes()).toHaveProperty('required');
    });

    it('has min="0" constraint on stock input', () => {
        const wrapper = mount(BookForm);
        expect(wrapper.find('input[type="number"]').attributes('min')).toBe('0');
    });

    it('does not render image preview when cover URL is empty', () => {
        const wrapper = mount(BookForm);
        // Initially empty
        expect(wrapper.find('img').exists()).toBe(false);
        expect(wrapper.find('.text-gray-400').text()).toContain('Preview');
    });

});
