export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    cover: string;
    price: string;
    category: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
