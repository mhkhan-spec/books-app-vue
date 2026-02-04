<script setup lang="ts">
import type { Book } from '@/types';

defineProps<{
    book: Book;
}>();
</script>

<template>
    <div class="perspective-container group cursor-pointer relative z-0">
        <!-- Pages Effect (Behind Cover) -->
        <div class="absolute top-1 bottom-1 left-2 w-[96%] bg-white rounded-r-md z-0 shadow-sm border-r-4 border-gray-200 transition-all duration-500 transform group-hover:rotate-y-[-2deg] group-hover:translate-x-1 books-page-pattern"></div>

        <!-- Book Cover -->
        <div
            class="book-card relative rounded-lg shadow-md transition-all duration-500 ease-out bg-gray-100 overflow-hidden z-10">
            <!-- Image -->
            <div class="aspect-2/3 w-full relative">
                <img :src="book.cover" :alt="book.title" class="w-full h-full object-cover" loading="lazy" />

                <!-- Spine Effect (User Requested) -->
                <div class="book-spine"></div>

                <!-- Gloss Effect (User Requested) -->
                <div class="book-gloss"></div>

                <!-- Dark Overlay Helper for Text Readability (Subtle) -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60">
                </div>
            </div>

            <!-- Content Overlay -->
            <div class="absolute inset-0 flex flex-col justify-end p-4 text-white z-10">
                <h3 class="text-lg font-bold leading-tight mb-1 line-clamp-2 drop-shadow-md">{{ book.title }}</h3>
                <p
                    class="text-sm text-gray-200 font-medium translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {{ book.author }}
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.perspective-container {
    perspective: 1000px;
}

.book-card {
    transform-style: preserve-3d;
    transform-origin: left center;
    transition: transform 0.5s ease, box-shadow 0.5s ease;
}

.group:hover .book-card {
    transform: rotateY(-25deg) scale(1.02); /* Increased rotation to reveal pages */
    box-shadow:
        5px 5px 15px rgba(0, 0, 0, 0.1),
        10px 10px 25px rgba(0, 0, 0, 0.15),
        -2px 0 5px rgba(0, 0, 0, 0.05);
}

.books-page-pattern {
    background-image: repeating-linear-gradient(
        to bottom,
        #fff 0px,
        #fff 2px,
        #f3f4f6 2px,
        #f3f4f6 3px
    );
}

/* User Provided Effect 1: Spine/Hinge */
.book-spine {
    position: absolute;
    left: 0;
    top: 0;
    width: 10%;
    height: 100%;
    margin-left: 5%;
    border-left: 2px solid rgba(0, 0, 0, 0.2);
    /* Fallback for var(--dark) */
    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    transition: all .5s ease;
    z-index: 5;
    pointer-events: none;
}

/* User Provided Effect 2: Cover Gloss */
.book-gloss {
    width: 90%;
    height: 100%;
    position: absolute;
    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 100%);
    top: 0;
    right: 0;
    opacity: 0.1;
    transition: all .5s ease;
    z-index: 5;
    pointer-events: none;
}

.group:hover .book-gloss {
    opacity: 0.2;
    /* Enhance gloss on hover */
}
</style>
