<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const isUpdating = ref(false);

const cartItems = computed(() => store.getters.cartItems);
const totalPrice = computed(() => store.getters.totalPrice);

const removeFromCart = async (bookId: number) => {
    if (isUpdating.value) return;
    isUpdating.value = true;
    try {
        await store.dispatch('removeFromCart', bookId);
    } finally {
        isUpdating.value = false;
    }
};

const updateQuantity = async (bookId: number, quantity: number) => {
    if (isUpdating.value) return;
    isUpdating.value = true;
    try {
        await store.dispatch('updateQuantity', { bookId, quantity });
    } finally {
        isUpdating.value = false;
    }
};

const clearCart = async () => {
    if (isUpdating.value) return;
    isUpdating.value = true;
    try {
        await store.dispatch('clearCart');
    } finally {
        isUpdating.value = false;
    }
};

const increaseQuantity = (item: any) => {
    const currentStock = store.getters.getBookStock(Number(item.id)) ?? item.stock;
    if (currentStock > 0) {
        updateQuantity(item.id, item.quantity + 1);
    } else {
        alert('Sorry, no more stock available for this book.');
    }
};

const decreaseQuantity = (item: any) => {
    updateQuantity(item.id, item.quantity - 1);
};

const getStock = (item: any) => {
    return store.getters.getBookStock(Number(item.id)) ?? item.stock;
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-4xl">
            <h1 class="text-3xl font-bold tracking-tight text-gray-900 mb-8">Shopping Cart</h1>

            <div v-if="cartItems.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 class="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                <p class="mt-1 text-gray-500">Looks like you haven't added any books yet.</p>
                <div class="mt-6">
                    <router-link to="/" class="inline-flex items-center rounded-xl border border-transparent bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all">
                        Start Shopping
                    </router-link>
                </div>
            </div>

            <div v-else class="flex flex-col lg:flex-row gap-8">

                <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul role="list" class="divide-y divide-gray-100">
                        <li v-for="item in cartItems" :key="item.id" class="flex py-6 px-6 sm:px-8">
                            <div class="h-24 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img :src="item.cover" :alt="item.title" class="h-full w-full object-cover object-center" />
                            </div>

                            <div class="ml-4 flex flex-1 flex-col">
                                <div>
                                    <div class="flex justify-between text-base font-medium text-gray-900">
                                        <h3 class="line-clamp-1 mr-4"><a href="#">{{ item.title }}</a></h3>
                                        <p class="ml-4">{{ item.price }}</p>
                                    </div>
                                    <p class="mt-1 text-sm text-gray-500">{{ item.author }}</p>
                                </div>
                                    <div class="flex flex-1 items-end justify-between text-sm">
                                    <div class="flex flex-col gap-2">
                                        <div class="flex items-center rounded-lg border border-gray-200">
                                            <button @click="decreaseQuantity(item)" class="px-3 py-1 hover:bg-gray-50 text-gray-600 font-medium rounded-l-lg disabled:opacity-50" :disabled="item.quantity <= 1 || isUpdating">-</button>
                                            <span class="px-2 py-1 text-gray-900 font-medium min-w-[30px] text-center">{{ item.quantity }}</span>
                                            <button @click="increaseQuantity(item)" class="px-3 py-1 hover:bg-gray-50 text-gray-600 font-medium rounded-r-lg disabled:opacity-50" :disabled="getStock(item) <= 0 || isUpdating">+</button>
                                        </div>
                                        <p class="text-[10px]" :class="getStock(item) > 0 ? 'text-gray-500' : 'text-red-500 font-bold'">
                                            {{ getStock(item) > 0 ? `Stock: ${getStock(item)}` : 'Out of Stock' }}
                                        </p>
                                    </div>

                                    <button @click="removeFromCart(item.id)" type="button" class="font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50" :disabled="isUpdating">Remove</button>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>


                <div class="lg:w-80">
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                        <h2 class="text-lg font-medium text-gray-900 mb-6">Order summary</h2>
                        <dl class="space-y-4">
                            <div class="flex items-center justify-between">
                                <dt class="text-sm text-gray-600">Subtotal</dt>
                                <dd class="text-sm font-medium text-gray-900">${{ totalPrice }}</dd>
                            </div>

                             <div class="flex items-center justify-between">
                                <dt class="text-sm text-gray-600">Shipping</dt>
                                <dd class="text-sm font-medium text-gray-900">Free</dd>
                            </div>
                            <div class="border-t border-gray-200 pt-4 flex items-center justify-between">
                                <dt class="text-base font-medium text-gray-900">Order total</dt>
                                <dd class="text-base font-bold text-gray-900">${{ totalPrice }}</dd>
                            </div>
                        </dl>

                        <div class="mt-8 space-y-3">
                            <button @click="clearCart" :disabled="isUpdating" class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0">
                                Checkout
                            </button>
                             <router-link to="/" class="block text-center w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
                                Continue Shopping
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
