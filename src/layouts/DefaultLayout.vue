<script setup lang="ts">
import Navbar from '@/components/Navbar.vue';
import CreateBookFab from '@/components/CreateBookFab.vue';

</script>

<template>
    <div class="w-full min-h-screen">
        <Navbar />
        <main class="grow container mx-auto p-2 lg:p-6">
            <slot />
        </main>
        <CreateBookFab />
    </div>
</template>