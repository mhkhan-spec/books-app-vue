<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { listBooks } from '@/services/books';
import type { Book } from '@/types';
import BookCard from './BookCard.vue';
import axios from 'axios';

const route = useRoute();

const books = ref<Book[]>([]);
const isLoading = ref(false);
const isLoadMoreLoading = ref(false); // New separate state for load more
const error = ref<string | null>(null);
const loadMoreError = ref<string | null>(null); // Separate error for load more
const page = ref(1);
const hasMore = ref(true);
const total = ref(0);
const abortController = ref<AbortController | null>(null);

const LIMIT = 12;

const fetchBooks = async (reset = false) => {
    // If resetting (filter/search change), cancel previous request immediately
    if (reset) {
        if (abortController.value) {
            abortController.value.abort();
            abortController.value = null;
        }
        page.value = 1;
        books.value = [];
        hasMore.value = true;
        error.value = null; // Clear main error on new search
        loadMoreError.value = null;
        isLoading.value = true;
    } else {
        // Load more case
        if (!hasMore.value || isLoadMoreLoading.value) return;
        isLoadMoreLoading.value = true;
        loadMoreError.value = null;
    }

    // Create new controller for this request
    abortController.value = new AbortController();

    try {
        const search = route.query.search as string | undefined;
        const category = route.query.category as string | undefined;

        const response = await listBooks(
            page.value, 
            LIMIT, 
            search, 
            category, 
            abortController.value.signal
        );
        
        if (reset) {
            books.value = response.data;
        } else {
            books.value = [...books.value, ...response.data];
        }

        total.value = response.pagination.total;
        hasMore.value = page.value < response.pagination.totalPages;
        
        if (hasMore.value) {
            page.value++;
        }
    } catch (err) {
        if (axios.isCancel(err)) {
            console.log('Request canceled', err);
            return; // Ignore cancellation errors
        }
        console.error("Failed to fetch books", err);
        
        if (reset) {
            error.value = "Failed to load books. Please check your connection and try again.";
        } else {
            loadMoreError.value = "Failed to load more books. Please try again.";
        }
    } finally {
        if (reset) {
            isLoading.value = false;
        } else {
            isLoadMoreLoading.value = false;
        }
        abortController.value = null; // Cleanup
    }
};

const loadMore = () => {
    fetchBooks(false);
};

// Initial Fetch
onMounted(() => fetchBooks(true));

// Cleanup on unmount
onUnmounted(() => {
    if (abortController.value) {
        abortController.value.abort();
    }
});

// Watch filters
watch(
    () => [route.query.category, route.query.search],
    () => {
        fetchBooks(true);
    }
);
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Loading State (Initial / Full Reload) -->
        <div v-if="isLoading && books.length === 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
            <div v-for="i in 10" :key="i" class="space-y-3 animate-pulse">
                <div class="aspect-[2/3] bg-gray-200 rounded-xl w-full shado-sm"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>

        <!-- Main Error State (No books visible) -->
        <div v-else-if="error && books.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="text-red-500 mb-6 bg-red-50 p-6 rounded-full">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p class="text-gray-600 mb-6 max-w-md">{{ error }}</p>
            <button 
                @click="fetchBooks(true)"
                class="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium"
            >
                Try Again
            </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="books.length === 0 && !isLoading" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="bg-gray-50 p-6 rounded-full mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">No books found</h3>
            <p class="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>

        <!-- Book Grid -->
        <div v-else>
            <transition-group 
                name="list" 
                tag="div" 
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10"
            >
                <BookCard 
                    v-for="book in books" 
                    :key="book.id" 
                    :book="book" 
                />
            </transition-group>

            <!-- Load More Section -->
            <div v-if="hasMore" class="flex flex-col items-center pt-12 space-y-4">
                <!-- Load More Error -->
                <div v-if="loadMoreError" class="flex items-center space-x-3 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm mb-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{{ loadMoreError }}</span>
                </div>

                <button 
                    @click="loadMore"
                    :disabled="isLoadMoreLoading"
                    class="group relative px-8 py-3 bg-white text-gray-800 border-2 border-gray-100 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md min-w-[200px]"
                >
                    <span v-if="!isLoadMoreLoading" class="flex items-center justify-center space-x-2">
                        <span>Load More Books</span>
                        <svg class="w-4 h-4 transform group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                    <span v-else class="flex items-center justify-center space-x-2">
                        <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
