<script setup lang="ts">
import { ref, reactive } from 'vue';
import { createBook } from '@/services/books';
import type { Book } from '@/types';
import { useRouter } from 'vue-router';

// Defines if we should use window.reload on success or emit an event
// For now, simpler to specificy behavior via props or just standard router push
const props = defineProps<{
    onSuccess?: () => void;
}>();

const router = useRouter();
const isSubmitting = ref(false);

const form = reactive<Omit<Book, 'id'>>({
    title: '',
    author: '',
    price: '',
    category: '',
    cover: '',
    description: ''
});

const resetForm = () => {
    form.title = '';
    form.author = '';
    form.price = '';
    form.category = '';
    form.cover = '';
    form.description = '';
};

const handleSubmit = async () => {
    isSubmitting.value = true;
    try {
        await createBook({ ...form });
        if (props.onSuccess) {
            props.onSuccess();
        } else {
            // Default behavior if no prop: go home
            router.push('/');
        }
        resetForm();
    } catch (error) {
        console.error('Failed to create book:', error);
        alert('Failed to create book. Please try again.');
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="handleSubmit" class="h-full flex flex-col">
        <div class="flex gap-6">
            <!-- Left Side: Image Preview -->
            <div class="w-32 flex-shrink-0 flex flex-col gap-2">
                 <div class="relative w-full aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 shadow-sm border border-gray-200">
                    <img v-if="form.cover" :src="form.cover" alt="Cover preview" class="h-full w-full object-cover"
                        @error="($event.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Cover'" />
                    <div v-else class="flex h-full flex-col items-center justify-center text-[10px] text-gray-400 p-1 text-center leading-tight">
                        <svg class="w-6 h-6 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Preview</span>
                    </div>
                </div>
                 <!-- Image Link Input (Moved under preview for mobile-like vertical flow or keep it compact) -->
                 <!-- Actually, let's keep inputs on the right/main area and just show preview here -->
            </div>

            <!-- Right Side: Fields -->
            <div class="flex-1 space-y-3">
                 <div>
                    <label class="mb-1 block text-xs font-semibold text-gray-700">Image URL</label>
                    <input v-model="form.cover" type="url" placeholder="https://..." required
                        class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-700">Title</label>
                        <input v-model="form.title" type="text" placeholder="Title" required
                            class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20" />
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-700">Author</label>
                        <input v-model="form.author" type="text" placeholder="Author" required
                            class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20" />
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-700">Price</label>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                            <input v-model="form.price" type="text" placeholder="0.00" required
                                class="w-full rounded-lg border border-gray-200 bg-gray-50/50 pl-6 pr-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20" />
                        </div>
                    </div>
                    <div>
                        <label class="mb-1 block text-xs font-semibold text-gray-700">Category</label>
                        <div class="relative">
                            <select v-model="form.category" required
                                class="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20 appearance-none">
                                <option value="" disabled>Select</option>
                                <option value="Fiction">Fiction</option>
                                <option value="Non-Fiction">Non-Fiction</option>
                                <option value="Science">Science</option>
                                <option value="History">History</option>
                                <option value="Technology">Tech</option>
                            </select>
                             <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-3 flex-1 flex flex-col min-h-0">
            <label class="mb-1 block text-xs font-semibold text-gray-700">Description</label>
            <textarea v-model="form.description" placeholder="Summary..." required
                class="flex-1 w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm outline-none ring-offset-1 transition-all focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20"></textarea>
        </div>

        <div class="pt-4 mt-auto">
            <button type="submit" :disabled="isSubmitting"
                class="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/10 transition-all hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0">
                <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                    <svg class="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                </span>
                <span v-else>Create Book</span>
            </button>
        </div>
    </form>
</template>
