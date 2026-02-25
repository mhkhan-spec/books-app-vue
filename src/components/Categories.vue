<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { listCategories } from '@/services/categories';

const categories = ref<string[]>([]);
const activeCategory = ref<string>('');
const searchQuery = ref<string>('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const router = useRouter();
const route = useRoute();

const fetchCategories = async () => {
    isLoading.value = true;
    error.value = null;
    try {
        categories.value = await listCategories();
    } catch (err) {
        console.error("Failed to load categories", err);
        error.value = "Failed to load categories";
    } finally {
        isLoading.value = false;
    }
};

const handleCategoryClick = (category: string) => {
    if (activeCategory.value === category) {
        activeCategory.value = '';
        router.push({ query: { ...route.query, category: undefined } });
    } else {
        activeCategory.value = category;
        router.push({ query: { ...route.query, category } });
    }
};

let searchTimeout: ReturnType<typeof setTimeout>;
const handleSearchInput = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query: any = { ...route.query };
        if (searchQuery.value) {
            query.search = searchQuery.value;
        } else {
            delete query.search;
        }
        router.push({ query });
    }, 300);
};

watch(() => route.query.category, (newCategory) => {
    activeCategory.value = (newCategory as string) || '';
}, { immediate: true });

watch(() => route.query.search, (newSearch) => {
    searchQuery.value = (newSearch as string) || '';
}, { immediate: true });

onMounted(fetchCategories);


// Inside <script setup>
const clearSearch = () => {
    searchQuery.value = '';
    handleSearchInput();
};
</script>

<template>
    <div class="sticky top-12 z-40 backdrop-blur-md py-6">
        <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-12 gap-2 lg:gap-6 items-center">

                <section class="col-span-12 lg:col-span-8 overflow-x-auto scrollbar-hide">
                    <div v-if="error" class="flex items-center justify-start w-full">
                        <div class="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg flex items-center space-x-2">
                            <span>{{ error }}</span>
                            <button @click="fetchCategories"
                                class="text-xs underline hover:text-red-700 font-semibold cursor-pointer">
                                Retry
                            </button>
                        </div>
                    </div>

                    <div v-else-if="isLoading" class="flex space-x-3 min-w-max animate-pulse">
                        <div class="h-10 w-24 bg-gray-200 rounded-xl"></div>
                        <div v-for="i in 5" :key="i" class="h-10 w-32 bg-gray-200 rounded-xl"></div>
                    </div>

                    <div v-else class="flex space-x-3 min-w-max p-1">
                        <button @click="handleCategoryClick('')" :class="[
                            'cursor-pointer px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20',
                            activeCategory === ''
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md'
                        ]">
                            All Books
                        </button>

                        <button v-for="category in categories" :key="category" @click="handleCategoryClick(category)"
                            :class="[
                                'cursor-pointer px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20',
                                activeCategory === category
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm hover:shadow-md'
                            ]">
                            {{ category }}
                        </button>
                    </div>
                </section>


                <section class="col-span-12 lg:col-span-4">
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-300"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input type="text" v-model="searchQuery" @input="handleSearchInput"
                            placeholder="Search for books..."
                            class="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium">
                            <div v-if="searchQuery" @click="clearSearch()"
                            class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                            <svg class="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}

.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
