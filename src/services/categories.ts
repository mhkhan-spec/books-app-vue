import axios from 'axios';

import { BASE_URL } from '../config';

export const listCategories = async (): Promise<string[]> => {
    try {
        const response = await axios.get<string[]>(`${BASE_URL}/categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};
