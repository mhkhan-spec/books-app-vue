<script setup lang="ts">
</script>

<template>
    <nav class="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 h-16 sm:px-6 lg:px-8">

            <router-link to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="@/assets/logo.svg" alt="BookStore Logo" class="h-8 w-auto" />
                <span class="text-xl font-bold tracking-tight text-gray-900">
                    Book<span class="text-emerald-500">Store</span>
                </span>
            </router-link>

            <router-link to="/cart" class="group relative p-2 text-gray-700 hover:text-emerald-500 transition-colors">
                <span class="sr-only">View shopping cart</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-7 h-7">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>

                <span
                    class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-white">
                    3
                </span>
            </router-link>

        </div>
    </nav>
</template>