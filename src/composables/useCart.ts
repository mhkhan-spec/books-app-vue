import { reactive, computed, watch } from 'vue';
import type { Book } from '@/types';

export interface CartItem extends Book {
    quantity: number;
}

const CART_STORAGE_KEY = 'book-store-cart';


const savedCart = localStorage.getItem(CART_STORAGE_KEY);
let initialState: CartItem[] = [];
try {
    initialState = savedCart ? JSON.parse(savedCart) : [];
} catch (e) {
    console.error('Failed to parse cart from local storage', e);
    initialState = [];
}

const state = reactive({
    items: initialState
});


watch(
    () => state.items,
    (items) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    },
    { deep: true }
);


const addToCart = (book: Book) => {
    const existingItem = state.items.find((item) => item.id === book.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.items.push({ ...book, quantity: 1 });
    }
};

const removeFromCart = (bookId: string) => {
    const index = state.items.findIndex((item) => item.id === bookId);
    if (index !== -1) {
        state.items.splice(index, 1);
    }
};

const updateQuantity = (bookId: string, quantity: number) => {
    const item = state.items.find((item) => item.id === bookId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(bookId);
        } else {
            item.quantity = quantity;
        }
    }
};

const clearCart = () => {
    state.items = [];
};


const totalItems = computed(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
});

const totalPrice = computed(() => {
    return state.items.reduce((total, item) => {
        if (!item.price) return total;

        const price = parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
        return total + (isNaN(price) ? 0 : price) * item.quantity;
    }, 0).toFixed(2);
});

export const useCart = () => {
    return {
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice
    };
};
