export interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    cover: string;
    price: string;
    category: string;
    stock: number;
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
