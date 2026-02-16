<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = withDefaults(defineProps<{
    hasMore: boolean;
    isLoading: boolean;
    error: string | null;
    mode?: 'button' | 'infinite';
}>(), {
    mode: 'button'
});

const emit = defineEmits<{
    (e: 'load'): void;
}>();

const isIntersecting = ref(false);
const observerTarget = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const entry = entries[0];
    if (!entry) return;
    isIntersecting.value = entry.isIntersecting;
    if (isIntersecting.value && props.hasMore && !props.isLoading) {
        emit('load');
    }
};

const setupObserver = () => {
    if (props.mode === 'infinite' && observerTarget.value) {
        observer = new IntersectionObserver(handleIntersection, {
            rootMargin: '0px',
            threshold: 1
        });
        observer.observe(observerTarget.value);
    }
};

const cleanupObserver = () => {
    if (observer) {
        observer.disconnect();
        observer = null;
    }
};

onMounted(() => {
    setupObserver();
});

onUnmounted(() => {
    cleanupObserver();
});

watch(() => props.mode, () => {
    cleanupObserver();
    setupObserver();
});


watch(() => props.isLoading, (loading) => {
    if (!loading && isIntersecting.value && props.hasMore && props.mode === 'infinite') {
        setTimeout(() => {
            if (isIntersecting.value && props.hasMore && !props.isLoading) {
                emit('load');
            }
        }, 100);
    }
});

const handleButtonClick = () => {
    if (props.hasMore && !props.isLoading) {
        emit('load');
    }
};
</script>

<template>
    <div class="load-more-container py-12 flex flex-col items-center space-y-4">
        <div v-if="error"
            class="flex items-center space-x-3 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm mb-2 animate-bounce-subtle">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ error }}</span>
        </div>

        <template v-if="mode === 'button'">
            <button v-if="hasMore" @click="handleButtonClick" :disabled="isLoading"
                class="group relative px-8 py-3 bg-white text-gray-800 border-2 border-gray-100 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md min-w-[200px] overflow-hidden">
                <div
                    class="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                </div>

                <span v-if="!isLoading" class="relative flex items-center justify-center space-x-2">
                    <span>Load More Books</span>
                    <svg class="w-4 h-4 transform group-hover:translate-y-1 transition-transform" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
                <span v-else class="relative flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span>Loading...</span>
                </span>
            </button>
            <div v-else-if="!isLoading" class="text-gray-400 font-medium">
                You've reached the end of the collection.
            </div>
        </template>

        <template v-else>
            <div ref="observerTarget" class="h-10 w-full flex items-center justify-center">
                <div v-if="isLoading" class="flex items-center space-x-2 text-gray-500">
                    <svg class="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <span class="font-medium">Discovering more books...</span>
                </div>
                <div v-else-if="!hasMore" class="text-gray-400 font-medium">
                    ✨ You've explored all available books
                </div>
            </div>
        </template>
    </div>
</template>

<style scoped>
@keyframes bounce-subtle {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-4px);
    }
}

.animate-bounce-subtle {
    animation: bounce-subtle 2s infinite ease-in-out;
}
</style>
