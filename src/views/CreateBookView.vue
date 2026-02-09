<script setup lang="ts">
import BookForm from '@/components/BookForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const handleSuccess = () => {

    router.push('/');
};
</script>

<template>

    <div class="h-[calc(100vh-9rem)] flex flex-col justify-center">
        <div class="mx-auto w-full max-w-2xl h-full flex flex-col">

            <div class="mb-4 text-center flex-shrink-0">
                <h1 class="text-2xl font-bold tracking-tight text-gray-900">Create New Book</h1>
            </div>


            <div class="flex-1 rounded-2xl bg-white p-5 shadow-xl ring-1 ring-gray-900/5 overflow-hidden flex flex-col">
                <BookForm :on-success="handleSuccess" />
            </div>


            <div class="mt-4 text-center flex-shrink-0">
                <router-link to="/" class="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                    &larr; Back
                </router-link>
            </div>
        </div>
    </div>
</template>
