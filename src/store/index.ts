import { createStore } from 'vuex';
import type { Book } from '@/types';

export interface CartItem extends Book {
    quantity: number;
}

export interface State {
    cart: CartItem[];
}

const CART_STORAGE_KEY = 'book-store-cart-vuex';


let savedCart: CartItem[] = [];
try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
        savedCart = JSON.parse(saved);
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
        cart: savedCart
    },
    mutations: {
        ADD_TO_CART(state, book: Book) {
            const existingItem = state.cart.find((item) => item.id === book.id);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                state.cart.push({ ...book, quantity: 1 });
            }
        },
        REMOVE_FROM_CART(state, bookId: string) {
            const index = state.cart.findIndex((item) => item.id === bookId);
            if (index !== -1) {
                state.cart.splice(index, 1);
            }
        },
        UPDATE_QUANTITY(state, { bookId, quantity }: { bookId: string; quantity: number }) {
            const item = state.cart.find((item) => item.id === bookId);
            if (item) {
                if (quantity <= 0) {
                    const index = state.cart.findIndex((i) => i.id === bookId);
                    if (index !== -1) state.cart.splice(index, 1);
                } else {
                    item.quantity = quantity;
                }
            }
        },
        CLEAR_CART(state) {
            state.cart = [];
        }
    },
    actions: {
        addToCart({ commit }, book: Book) {
            commit('ADD_TO_CART', book);
        },
        removeFromCart({ commit }, bookId: string) {
            commit('REMOVE_FROM_CART', bookId);
        },
        updateQuantity({ commit }, payload: { bookId: string; quantity: number }) {
            commit('UPDATE_QUANTITY', payload);
        },
        clearCart({ commit }) {
            commit('CLEAR_CART');
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
        }
    },
    plugins: [localStoragePlugin]
});
