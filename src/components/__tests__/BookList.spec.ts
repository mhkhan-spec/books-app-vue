import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import BookList from '../BookList.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { listBooks } from '@/services/books';
import type { Book, PaginatedResponse } from '@/types';


vi.mock('@/services/books', () => ({
    listBooks: vi.fn(),
}));


vi.mock('../BookCard.vue', () => ({
    width: '100',
    height: '100',
    name: 'BookCard',
    template: '<div class="book-card-mock" @click="$emit(\'click\')"></div>',
    props: ['book']
}));

vi.mock('../BookDetailsModal.vue', () => ({
    name: 'BookDetailsModal',
    template: '<div class="book-details-modal-mock"></div>',
    props: ['book'],
    emits: ['close']
}));

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', component: { template: '<div>Home</div>' } }
    ]
});

describe('BookList.vue', () => {


    const mockBooks: Book[] = [
        {
            id: '1',
            title: 'Test Book 1',
            author: 'Author 1',
            description: 'Desc 1',
            cover: 'http://example.com/cover1.jpg',
            price: '$10.00',
            category: 'Fiction'
        },
        {
            id: '2',
            title: 'Test Book 2',
            author: 'Author 2',
            description: 'Desc 2',
            cover: 'http://example.com/cover2.jpg',
            price: '$20.00',
            category: 'Science'
        }
    ];

    const mockResponse: PaginatedResponse<Book> = {
        data: mockBooks,
        pagination: {
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        (listBooks as any).mockResolvedValue(mockResponse);
    });

    it('renders loading state initially', async () => {

        let resolvePromise: (value: any) => void;
        const promise = new Promise((resolve) => { resolvePromise = resolve; });
        (listBooks as any).mockReturnValue(promise);

        const wrapper = mount(BookList, {
            global: {
                plugins: [router],
                stubs: {
                    BookCard: true,
                    BookDetailsModal: true
                }
            }
        });


        expect(wrapper.find('.animate-pulse').exists()).toBe(true);

        resolvePromise!(mockResponse);
        await flushPromises();
    });

    it('fetches and renders books successfully', async () => {
        const wrapper = mount(BookList, {
            global: {
                plugins: [router]
            }
        });


        await flushPromises();

        expect(listBooks).toHaveBeenCalledTimes(1);


        const bookCards = wrapper.findAll('.book-card-mock');
        expect(bookCards.length).toBe(2);
    });

    it('displays error state when fetch fails', async () => {
        const errorMsg = 'Network Error';
        (listBooks as any).mockRejectedValue(new Error(errorMsg));

        const wrapper = mount(BookList, {
            global: {
                plugins: [router]
            }
        });

        await flushPromises();

        expect(wrapper.text()).toContain('Oops! Something went wrong');
    });

    it('shows empty state when no books found', async () => {
        (listBooks as any).mockResolvedValue({
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });

        const wrapper = mount(BookList, {
            global: {
                plugins: [router]
            }
        });

        await flushPromises();

        expect(wrapper.text()).toContain('No books found');
    });

    it('loads more books when load more button is clicked', async () => {

        const page1Response = {
            data: [mockBooks[0]],
            pagination: { total: 2, page: 1, limit: 1, totalPages: 2 }
        };

        const page2Response = {
            data: [mockBooks[1]],
            pagination: { total: 2, page: 2, limit: 1, totalPages: 2 }
        };

        (listBooks as any)
            .mockResolvedValueOnce(page1Response)
            .mockResolvedValueOnce(page2Response);

        const wrapper = mount(BookList, {
            global: {
                plugins: [router]
            }
        });

        await flushPromises();


        expect(wrapper.findAll('.book-card-mock').length).toBe(1);


        const loadMoreBtn = wrapper.findAll('button').find(b => b.text().includes('Load More Books'));
        expect(loadMoreBtn?.exists()).toBe(true);

        await loadMoreBtn?.trigger('click');
        await flushPromises();

        expect(listBooks).toHaveBeenCalledTimes(2);

        expect(wrapper.findAll('.book-card-mock').length).toBe(2);
    });

    it('opens modal when a book is clicked', async () => {
        const wrapper = mount(BookList, {
            global: {
                plugins: [router]
            }
        });

        await flushPromises();


        await wrapper.find('.book-card-mock').trigger('click');


        expect(wrapper.find('.book-details-modal-mock').exists()).toBe(true);
    });
});
