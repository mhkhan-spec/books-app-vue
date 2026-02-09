<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import type { Book } from '@/types';
import { useStore } from 'vuex';

defineProps<{
    book: Book;
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

const store = useStore();

const handleAddToCart = (book: Book) => {
    store.dispatch('addToCart', book);
    emit('close');

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
                        </div>

                        <div class="prose prose-sm text-gray-600 mb-8 flex-grow">
                            <p class="whitespace-pre-line leading-relaxed">{{ book.description }}</p>
                        </div>

                         <div class="mt-auto border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div class="text-3xl font-bold text-gray-900">
                                ${{ book.price }}
                            </div>
                            <button 
                                @click="handleAddToCart(book)"
                                class="w-full sm:w-auto rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
