<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const cartItems = computed(() => store.getters.cartItems);
const totalPrice = computed(() => store.getters.totalPrice);

const updateQuantity = (bookId: string, quantity: number) => {
    store.dispatch('updateQuantity', { bookId, quantity });
};

const removeFromCart = (bookId: string) => {
    store.dispatch('removeFromCart', bookId);
};
</script>

<template>
    <div
        class="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all focus:outline-none z-50 overflow-hidden border border-gray-100">
        <div v-if="cartItems.length === 0" class="py-8 text-center">
            <p class="text-sm text-gray-500 font-medium">Your cart is empty</p>
            <router-link to="/" class="mt-2 inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                Start shopping
            </router-link>
        </div>

        <div v-else>
            <div class="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                <h3 class="text-sm font-bold text-gray-900">Recently Added</h3>
                <span class="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {{ cartItems.length }} item{{ cartItems.length > 1 ? 's' : '' }}
                </span>
            </div>

            <ul class="max-h-64 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                <li v-for="item in cartItems" :key="item.id" class="flex gap-3 group animate-fadeIn">
                    <div class="h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        <img :src="item.cover" :alt="item.title" class="h-full w-full object-cover object-center" />
                    </div>
                    <div class="flex flex-1 flex-col justify-between py-0.5">
                        <div>
                            <div class="flex justify-between items-start pr-0">
                                <h4 class="text-xs font-bold text-gray-900 line-clamp-1 flex-1 pr-2">
                                    {{ item.title }}
                                </h4>
                                <button @click="removeFromCart(item.id)"
                                    class="text-gray-400 hover:text-red-500 transition-colors p-0.5 -mt-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="2.5" stroke="currentColor" class="w-3.5 h-3.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p class="text-[10px] text-gray-500 line-clamp-1">{{ item.author }}</p>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <span class="text-xs font-bold text-gray-900">{{ item.price }}</span>
                            <div
                                class="flex items-center gap-2 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-100">
                                <button @click="updateQuantity(item.id, item.quantity - 1)"
                                    class="text-gray-400 hover:text-emerald-600 disabled:opacity-30 p-0.5"
                                    :disabled="item.quantity <= 1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="3" stroke="currentColor" class="w-2.5 h-2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                                    </svg>
                                </button>
                                <span class="text-[10px] font-bold text-gray-700 w-3 text-center">{{ item.quantity
                                }}</span>
                                <button @click="updateQuantity(item.id, item.quantity + 1)"
                                    class="text-gray-400 hover:text-emerald-600 p-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="3" stroke="currentColor" class="w-2.5 h-2.5">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>

            <div class="mt-4 border-t border-gray-100 pt-4">
                <div class="flex items-center justify-between mb-4 px-1">
                    <span class="text-xs font-medium text-gray-500">Subtotal</span>
                    <span class="text-sm font-bold text-gray-900">${{ totalPrice }}</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <router-link to="/cart"
                        class="flex items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-200">
                        View Cart
                    </router-link>
                    <button
                        class="flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-100">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
}
</style>
