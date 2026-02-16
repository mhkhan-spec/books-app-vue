import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BookCard from '../BookCard.vue';
import { createStore } from 'vuex';

const mockBook = {
    id: 1,
    title: 'Test Book Title',
    author: 'Test Author',
    description: 'A test description',
    cover: 'https://example.com/cover.jpg',
    price: '$19.99',
    category: 'Fiction',
    stock: 10,
};

const createMockStore = (stockValue: number | undefined) => {
    return createStore({
        getters: {
            getBookStock: () => () => stockValue,
        },
    });
};

describe('BookCard.vue', () => {

    it('renders the book title correctly', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        expect(wrapper.find('h3').text()).toBe(mockBook.title);
    });

    it('renders the book author correctly', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        expect(wrapper.find('p').text()).toContain(mockBook.author);
    });

    it('displays correct stock count when in stock', () => {
        const store = createMockStore(5);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        const badge = wrapper.find('.absolute.top-2.right-2');
        expect(badge.text()).toBe('Stock: 5');
        expect(badge.classes()).toContain('bg-white/90');
    });

    it('displays "Out of Stock" when stock is 0', () => {
        const store = createMockStore(0);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        const badge = wrapper.find('.absolute.top-2.right-2');
        expect(badge.text()).toBe('Out of Stock');
        expect(badge.classes()).toContain('bg-red-500/90');
    });

    it('has the perspective-container class', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        expect(wrapper.classes()).toContain('perspective-container');
    });


    it('renders correctly even with an empty title', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: { ...mockBook, title: '' } },
            global: { plugins: [store] },
        });
        expect(wrapper.find('h3').text()).toBe('');
    });

    it('renders correctly even with an empty author', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: { ...mockBook, author: '' } },
            global: { plugins: [store] },
        });
        expect(wrapper.find('p').text().trim()).toBe('');
    });

    it('shows "Out of Stock" for negative stock values', () => {
        const store = createMockStore(-1);
        const wrapper = mount(BookCard, {
            props: { book: mockBook },
            global: { plugins: [store] },
        });
        expect(wrapper.find('.absolute.top-2.right-2').text()).toBe('Out of Stock');
    });

    it('still renders the img tag with an empty cover URL', () => {
        const store = createMockStore(10);
        const wrapper = mount(BookCard, {
            props: { book: { ...mockBook, cover: '' } },
            global: { plugins: [store] },
        });
        const img = wrapper.find('img');
        expect(img.exists()).toBe(true);
        expect(img.attributes('src')).toBe('');
    });

    it('falls back to book.stock prop if store returns undefined', () => {
        const store = createMockStore(undefined);
        const wrapper = mount(BookCard, {
            props: { book: { ...mockBook, stock: 42 } },
            global: { plugins: [store] },
        });
        expect(wrapper.find('.absolute.top-2.right-2').text()).toBe('Stock: 42');
    });
});
