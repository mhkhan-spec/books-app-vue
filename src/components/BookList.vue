<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listBooks } from '@/services/books';
import type { Book } from '@/types';
import BookCard from './BookCard.vue';
import BookDetailsModal from './BookDetailsModal.vue';
import LoadMore from './LoadMore.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const books = ref<Book[]>([]);
const selectedBook = ref<Book | null>(null);
const isLoading = ref(false);
const isLoadMoreLoading = ref(false);
const error = ref<string | null>(null);
const loadMoreError = ref<string | null>(null);
const page = ref(Number(route.query.page) || 1);
const hasMore = ref(true);
const total = ref(0);
const abortController = ref<AbortController | null>(null);

// Feature flag for load more mode
const loadMoreMode = ref<'button' | 'infinite'>('infinite');

const toggleLoadMoreMode = () => {
    loadMoreMode.value = loadMoreMode.value === 'button' ? 'infinite' : 'button';
};

const LIMIT = 3;

const prepareFetch = (isAppend: boolean) => {
    if (!isAppend) {
        if (abortController.value) {
            abortController.value.abort();
        }
        books.value = [];
        hasMore.value = true;
        error.value = null;
        loadMoreError.value = null;
        isLoading.value = true;
    } else {
        if (!hasMore.value || isLoadMoreLoading.value) return false;
        isLoadMoreLoading.value = true;
        loadMoreError.value = null;
    }
    abortController.value = new AbortController();
    return true;
};

const performParallelFetch = async (targetPage: number, search: string | undefined, category: string | undefined, signal: AbortSignal) => {
    const pagesToFetch = Array.from({ length: targetPage }, (_, i) => i + 1);
    const results = await Promise.allSettled(
        pagesToFetch.map(p => listBooks(p, LIMIT, search, category, signal))
    );

    const successfulResults = results
        .filter((res): res is PromiseFulfilledResult<any> => res.status === 'fulfilled')
        .map(res => res.value);

    if (successfulResults.length === 0) {
        throw new Error("Failed to load any books");
    }

    return {
        data: successfulResults.flatMap(r => r.data),
        pagination: successfulResults[successfulResults.length - 1].pagination
    };
};

const performSingleFetch = async (targetPage: number, search: string | undefined, category: string | undefined, signal: AbortSignal) => {
    return await listBooks(targetPage, LIMIT, search, category, signal);
};

const processFetchResults = (data: Book[], pagination: any, isAppend: boolean) => {
    if (isAppend) {
        books.value = [...books.value, ...data];
    } else {
        books.value = data;
    }
    total.value = pagination.total;
    hasMore.value = page.value < pagination.totalPages;
};

const handleFetchError = (err: any, isAppend: boolean) => {
    if (axios.isCancel(err)) {
        console.log('Request canceled', err);
        return;
    }
    console.error("Failed to fetch books", err);
    if (!isAppend) {
        error.value = "Failed to load books. Please check your connection and try again.";
    } else {
        loadMoreError.value = "Failed to load more books. Please try again.";
    }
};

const fetchBooks = async (isAppend = false) => {
    if (!prepareFetch(isAppend)) return;

    try {
        const search = route.query.search as string | undefined;
        const category = route.query.category as string | undefined;
        const signal = abortController.value!.signal;

        let result;
        if (!isAppend && page.value > 1) {
            result = await performParallelFetch(page.value, search, category, signal);
        } else {
            result = await performSingleFetch(page.value, search, category, signal);
        }

        processFetchResults(result.data, result.pagination, isAppend);
    } catch (err) {
        handleFetchError(err, isAppend);
    } finally {
        if (!isAppend) {
            isLoading.value = false;
        } else {
            isLoadMoreLoading.value = false;
        }
        abortController.value = null;
    }
};

const loadMore = () => {
    router.push({
        query: {
            ...route.query,
            page: (page.value + 1).toString()
        }
    });
};

const openBookDetails = (book: Book) => {
    selectedBook.value = book;
};

const closeBookDetails = () => {
    selectedBook.value = null;
};


onMounted(() => fetchBooks(false));


onUnmounted(() => {
    if (abortController.value) {
        abortController.value.abort();
    }
});


watch(
    () => [route.query.category, route.query.search, route.query.page],
    (newVal, oldVal) => {
        const [newCat, newSearch, newPageQuery] = newVal;
        const [oldCat, oldSearch, oldPageQuery] = oldVal || [];

        const newPage = Number(newPageQuery) || 1;

        // Reset if category or search changed
        if (newCat !== oldCat || newSearch !== oldSearch) {
            page.value = 1;
            if (newPage !== 1) {
                router.replace({
                    query: { ...route.query, page: '1' }
                });
                return;
            }
            fetchBooks(false);
            return;
        }

        // Handle page change
        if (newPage !== page.value) {
            // Only use append mode if it's the next sequential page and we have books
            const isNextPage = newPage === page.value + 1;
            const isAppend = isNextPage && books.value.length > 0;

            page.value = newPage;
            fetchBooks(isAppend);
        }
    }
);
</script>

<template>
    <div class="space-y-8 pb-12">
        <!-- Feature Flag Toggle (Demo) -->


        <div v-if="isLoading && books.length === 0"
            class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-6">
            <div v-for="i in 10" :key="i" class="space-y-3 animate-pulse">
                <div class="aspect-[2/3] bg-gray-200 rounded-xl w-full shado-sm"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>


        <div v-else-if="error && books.length === 0"
            class="flex flex-col items-center justify-center py-16 text-center">
            <div class="text-red-500 mb-6 bg-red-50 p-6 rounded-full">
                <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
            <p class="text-gray-600 mb-6 max-w-md">{{ error }}</p>
            <button @click="fetchBooks(false)"
                class="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium">
                Try Again
            </button>
        </div>


        <div v-else-if="books.length === 0 && !isLoading"
            class="flex flex-col items-center justify-center py-20 text-center">
            <div class="bg-gray-50 p-6 rounded-full mb-6">
                <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">No books found</h3>
            <p class="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
        </div>


        <div v-else>
            <transition-group name="list" tag="div"
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">

                <BookCard v-for="book in books" :key="book.id" :book="book" @click="openBookDetails(book)" />
            </transition-group>


            <LoadMore :has-more="hasMore" :is-loading="isLoadMoreLoading" :error="loadMoreError" :mode="loadMoreMode"
                @load="loadMore" />
        </div>


        <BookDetailsModal v-if="selectedBook" :book="selectedBook" @close="closeBookDetails" />
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
