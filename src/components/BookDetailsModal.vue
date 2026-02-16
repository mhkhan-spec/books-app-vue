<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import type { Book } from '@/types';
import { useStore } from 'vuex';

const props = defineProps<{
    book: Book;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'book-updated', book: Book): void;
}>();

const store = useStore();

const localStock = computed(() => {
    const storeStock = store.getters.getBookStock(Number(props.book.id));
    return storeStock !== undefined ? storeStock : props.book.stock;
});

const isAdding = ref(false);

const handleAddToCart = async (book: Book) => {
    if (isAdding.value) return;
    isAdding.value = true;
    try {
        const updatedBook = await store.dispatch('addToCart', book);
        if (updatedBook) {
            emit('book-updated', updatedBook);
        }
        emit('close');
    } catch (error) {
        console.error('Failed to add to cart:', error);
    } finally {
        isAdding.value = false;
    }
};


onMounted(() => document.body.style.overflow = 'hidden');
onUnmounted(() => document.body.style.overflow = 'auto');
</script>

<template>
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">

        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>


        <div class="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/5 transition-all transform animate-in fade-in zoom-in-95 duration-200">

            <button @click="emit('close')" class="absolute top-4 right-4 z-20 rounded-full bg-white/80 p-2 text-gray-500 hover:bg-white hover:text-gray-700 backdrop-blur-sm transition-colors">
                <span class="sr-only">Close</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div class="flex flex-col md:flex-row h-full max-h-[85vh] md:max-h-[80vh]">

                <div class="relative w-full md:w-2/5 lg:w-1/3 bg-gray-100 flex items-center justify-center p-6 md:p-8">
                    <div class="relative aspect-[2/3] w-48 md:w-full shadow-2xl rounded-lg overflow-hidden transform transition-transform hover:scale-105 duration-500">
                        <img :src="book.cover" :alt="book.title" class="h-full w-full object-cover" />

                         <div class="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                </div>


                <div class="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div class="flex flex-col h-full">
                        <div class="mb-6">
                            <span class="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10 mb-3">
                                {{ book.category }}
                            </span>
                             <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-2">{{ book.title }}</h2>
                            <p class="text-lg font-medium text-emerald-600">{{ book.author }}</p>
                            <div class="mt-2 text-sm" :class="localStock > 0 ? 'text-gray-500' : 'text-red-500 font-bold'">
                                {{ localStock > 0 ? `Stock: ${localStock}` : 'Out of Stock' }}
                            </div>
                        </div>

                        <div class="prose prose-sm text-gray-600 mb-8 flex-grow">
                            <p class="whitespace-pre-line leading-relaxed">{{ props.book.description }}</p>
                        </div>

                         <div class="mt-auto border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="text-3xl font-bold text-gray-900">
                                ${{ props.book.price }}
                            </div>
                             <button 
                                @click="handleAddToCart(props.book)"
                                :disabled="localStock <= 0 || isAdding"
                                class="w-full sm:w-auto rounded-xl px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center min-w-[140px]"
                                :class="localStock > 0 ? 'bg-emerald-600 hover:bg-emerald-500 focus-visible:outline-emerald-600' : 'bg-gray-400'"
                            >
                                <span v-if="isAdding" class="flex items-center gap-2">
                                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
                                </span>
                                <span v-else>
                                    {{ localStock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
