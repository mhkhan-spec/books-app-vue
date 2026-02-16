import { createStore } from 'vuex';
import type { Book } from '@/types';
import { decrementStock, incrementStock as incrementStockApi } from '@/services/books';

export interface CartItem extends Book {
    quantity: number;
}


export interface State {
    cart: CartItem[];
    stocks: Record<number, number>;
}

const CART_STORAGE_KEY = 'book-store-cart-vuex';


let savedCart: CartItem[] = [];
try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            savedCart = parsed.map((item: any) => ({
                ...item,
                id: Number(item.id)
            }));
        }
    }
} catch (e) {
    console.error('Failed to load cart from local storage', e);
}


const localStoragePlugin = (store: any) => {
    store.subscribe((mutation: any, state: State) => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
    });
};

export default createStore<State>({
    state: {
        cart: savedCart,
        stocks: {}
    },
    mutations: {
        ADD_TO_CART(state, book: Book) {
            const existingItem = state.cart.find((item) => Number(item.id) === Number(book.id));
            if (existingItem) {
                existingItem.quantity++;
            } else {
                state.cart.push({ ...book, quantity: 1 });
            }
            state.stocks[Number(book.id)] = book.stock;
        },
        REMOVE_FROM_CART(state, bookId: string | number) {
            const index = state.cart.findIndex((item) => Number(item.id) === Number(bookId));
            if (index !== -1) {
                state.cart.splice(index, 1);
            }
        },
        UPDATE_QUANTITY(state, { bookId, quantity }: { bookId: string | number; quantity: number }) {
            const item = state.cart.find((item) => Number(item.id) === Number(bookId));
            if (item) {
                if (quantity <= 0) {
                    const index = state.cart.findIndex((i) => Number(i.id) === Number(bookId));
                    if (index !== -1) state.cart.splice(index, 1);
                } else {
                    item.quantity = quantity;
                }
            }
        },
        CLEAR_CART(state) {
            state.cart = [];
        },
        SET_BOOK_STOCK(state, { bookId, stock }: { bookId: number; stock: number }) {
            state.stocks[Number(bookId)] = stock;
            const cartItem = state.cart.find(item => Number(item.id) === Number(bookId));
            if (cartItem) {
                cartItem.stock = stock;
            }
        }
    },
    actions: {
        async addToCart({ commit }, book: Book) {
            try {
                const updatedBook = await decrementStock(Number(book.id));
                commit('ADD_TO_CART', updatedBook);
                return updatedBook;
            } catch (error) {
                console.error('Failed to decrement stock:', error);
                throw error;
            }
        },
        async removeFromCart({ commit, state }, bookId: string | number) {
            const item = state.cart.find(i => Number(i.id) === Number(bookId));
            if (item) {
                try {
                    const updatedBook = await incrementStockApi(Number(bookId), item.quantity);
                    commit('REMOVE_FROM_CART', bookId);
                    commit('SET_BOOK_STOCK', { bookId: Number(bookId), stock: updatedBook.stock });
                } catch (error) {
                    console.error('Failed to increment stock on remove:', error);
                    commit('REMOVE_FROM_CART', bookId);
                }
            }
        },
        async updateQuantity({ commit, state }, payload: { bookId: string | number; quantity: number }) {
            const item = state.cart.find(i => Number(i.id) === Number(payload.bookId));
            if (!item) return;

            const diff = payload.quantity - item.quantity;
            if (diff === 0) return;

            try {
                let updatedBook;
                if (diff > 0) {
                    for (let i = 0; i < diff; i++) {
                        updatedBook = await decrementStock(Number(payload.bookId));
                    }
                } else {
                    updatedBook = await incrementStockApi(Number(payload.bookId), Math.abs(diff));
                }

                if (updatedBook) {
                    commit('UPDATE_QUANTITY', payload);
                    commit('SET_BOOK_STOCK', { bookId: Number(payload.bookId), stock: updatedBook.stock });
                }
            } catch (error) {
                console.error('Failed to update quantity/stock:', error);
                throw error;
            }
        },
        async clearCart({ commit, state }) {
            const items = [...state.cart];

            for (const item of items) {
                try {
                    await incrementStockApi(Number(item.id), item.quantity);
                } catch (error) {
                    console.error(`Failed to restore stock for book ${item.id}:`, error);
                }
            }
        }
    },
    getters: {
        cartItems: (state) => state.cart,
        totalItems: (state) => {
            return state.cart.reduce((total, item) => total + item.quantity, 0);
        },
        totalPrice: (state) => {
            return state.cart.reduce((total, item) => {
                if (!item.price) return total;
                const price = parseFloat(String(item.price).replace(/[^0-9.-]+/g, ""));
                return total + (isNaN(price) ? 0 : price) * item.quantity;
            }, 0).toFixed(2);
        },
        getBookStock: (state) => (bookId: number) => {
            return state.stocks[bookId];
        }
    },
    plugins: [localStoragePlugin]
});
