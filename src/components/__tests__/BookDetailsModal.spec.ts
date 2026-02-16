import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BookDetailsModal from '../BookDetailsModal.vue';
import { createStore } from 'vuex';

const mockBook = {
    id: 1,
    title: 'Modern Architecture',
    author: 'Frank Lloyd Wright',
    description: 'A comprehensive guide to modern architectural principles.\nDetailed with examples.',
    cover: 'https://example.com/cover.jpg',
    price: '49.99',
    category: 'Architecture',
    stock: 5,
};

const createMockStore = (stockValue: number | undefined, dispatchMock = vi.fn()) => {
    return createStore({
        getters: {
            getBookStock: () => () => stockValue,
        },
        actions: {
            addToCart: dispatchMock,
        }
    });
};

describe('BookDetailsModal.vue', () => {

    // --- Positive Test Cases (+ve) ---

    it('renders book details correctly', () => {
        const store = createMockStore(5);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        expect(wrapper.find('h2').text()).toBe(mockBook.title);
        expect(wrapper.find('.text-emerald-600').text()).toBe(mockBook.author);
        expect(wrapper.find('.bg-emerald-50').text()).toBe(mockBook.category);
        expect(wrapper.find('.prose').text()).toContain(mockBook.description);
        // Find price in the footer area to avoid title selector collision
        expect(wrapper.find('.mt-auto .text-gray-900').text()).toBe(`$${mockBook.price}`);
    });

    it('displays correct stock count when in stock', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });
        // Use more specific selector for stock text
        const stockDiv = wrapper.find('.text-sm.text-gray-500');
        expect(stockDiv.text()).toBe('Stock: 10');
    });

    it('emits "close" when backdrop is clicked', async () => {
        const store = createMockStore(5);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        await wrapper.find('.bg-black\\/60').trigger('click');
        expect(wrapper.emitted()).toHaveProperty('close');
    });

    it('emits "close" when close button is clicked', async () => {
        const store = createMockStore(5);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        await wrapper.find('button.absolute.top-4.right-4').trigger('click');
        expect(wrapper.emitted()).toHaveProperty('close');
    });

    it('dispatches addToCart and emits events on success', async () => {
        const updatedBook = { ...mockBook, stock: 4 };
        const dispatchMock = vi.fn().mockResolvedValue(updatedBook);
        const store = createMockStore(5, dispatchMock);

        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        await wrapper.find('button.w-full.sm\\:w-auto').trigger('click');

        expect(dispatchMock).toHaveBeenCalledWith(expect.anything(), mockBook);
        expect(wrapper.emitted('book-updated')).toBeTruthy();
        expect(wrapper.emitted('book-updated')![0]).toEqual([updatedBook]);
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    // --- Negative Test Cases (-ve) ---

    it('displays "Out of Stock" when stock is 0', () => {
        const store = createMockStore(0);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });
        expect(wrapper.find('.text-red-500').text()).toBe('Out of Stock');
    });

    it('disables "Add to Cart" button when stock is 0', () => {
        const store = createMockStore(0);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });
        const button = wrapper.find('button.w-full.sm\\:w-auto');
        expect(button.attributes()).toHaveProperty('disabled');
        expect(button.classes()).toContain('bg-gray-400');
    });

    it('shows "Out of Stock" for negative stock values', () => {
        const store = createMockStore(-5);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });
        expect(wrapper.find('.text-red-500').text()).toBe('Out of Stock');
    });

    it('does NOT emit events if addToCart failure', async () => {
        const dispatchMock = vi.fn().mockRejectedValue(new Error('Failed'));
        const store = createMockStore(5, dispatchMock);

        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        await wrapper.find('button.w-full.sm\\:w-auto').trigger('click');

        expect(wrapper.emitted('book-updated')).toBeFalsy();
        expect(wrapper.emitted('close')).toBeFalsy();
    });

    it('does NOT emit "close" when modal content is clicked', async () => {
        const store = createMockStore(5);
        const wrapper = mount(BookDetailsModal, {
            props: { book: mockBook },
            global: { plugins: [store] }
        });

        // Click on the modal content container
        await wrapper.find('.relative.w-full.max-w-4xl').trigger('click');
        expect(wrapper.emitted('close')).toBeFalsy();
    });

});
