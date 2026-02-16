import axios from 'axios';
import { BASE_URL } from '@/config';
import type { Book, PaginatedResponse } from '@/types';

export const listBooks = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    signal?: AbortSignal
): Promise<PaginatedResponse<Book>> => {
    const params: Record<string, any> = {
        page,
        limit,
    };

    if (search) params.search = search;
    if (category) params.category = category;

    const response = await axios.get<PaginatedResponse<Book>>(`${BASE_URL}/books`, { params, signal });
    return response.data;
};

export const createBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
    const response = await axios.post<Book>(`${BASE_URL}/books`, book);
    return response.data;
};

export const decrementStock = async (bookId: number): Promise<Book> => {
    const response = await axios.post<Book>(`${BASE_URL}/books/${bookId}/decrement-stock`);
    return response.data;
};

export const incrementStock = async (bookId: number, amount: number = 1): Promise<Book> => {
    const response = await axios.post<Book>(`${BASE_URL}/books/${bookId}/increment-stock`, { amount });
    return response.data;
};
