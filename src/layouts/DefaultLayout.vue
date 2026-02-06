<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import CreateBookFab from '@/components/CreateBookFab.vue';

</script>

<template>
    <div class="w-full min-h-screen">
        <Navbar />
        <main class="grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <slot />
        </main>
        <CreateBookFab />
    </div>
</template>