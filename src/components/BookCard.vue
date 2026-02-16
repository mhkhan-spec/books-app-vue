<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import type { Book } from '@/types';

const props = defineProps<{
    book: Book;
}>();

const store = useStore();
const localStock = computed(() => {
    const storeStock = store.getters.getBookStock(Number(props.book.id));
    return storeStock !== undefined ? storeStock : props.book.stock;
});
</script>

<template>
    <div class="perspective-container group cursor-pointer relative z-0">

        <div
            class="absolute top-1 bottom-1 left-2 w-[96%] bg-white rounded-r-md z-0 shadow-sm border-r-4 border-gray-200 transition-all duration-500 transform group-hover:rotate-y-[-2deg] group-hover:translate-x-1 books-page-pattern">
        </div>


        <div
            class="book-card relative rounded-lg shadow-md transition-all duration-500 ease-out bg-gray-100 overflow-hidden z-10">

            <div class="aspect-2/3 w-full relative">
                <img :src="book.cover" :alt="book.title" class="w-full h-full object-cover" loading="lazy" />

                <div class="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold z-20 shadow-sm backdrop-blur-md"
                    :class="localStock > 0 ? 'bg-white/90 text-gray-800' : 'bg-red-500/90 text-white'">
                    {{ localStock > 0 ? `Stock: ${localStock}` : 'Out of Stock' }}
                </div>


                <div class="book-spine"></div>


                <div class="book-gloss"></div>


                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60">
                </div>
            </div>


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
    transform: rotateY(-25deg) scale(1.02);
    box-shadow:
        5px 5px 15px rgba(0, 0, 0, 0.1),
        10px 10px 25px rgba(0, 0, 0, 0.15),
        -2px 0 5px rgba(0, 0, 0, 0.05);
}

.books-page-pattern {
    background-image: repeating-linear-gradient(to bottom,
            #fff 0px,
            #fff 2px,
            #f3f4f6 2px,
            #f3f4f6 3px);
}


.book-spine {
    position: absolute;
    left: 0;
    top: 0;
    width: 10%;
    height: 100%;
    margin-left: 5%;
    border-left: 2px solid rgba(0, 0, 0, 0.2);

    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
    transition: all .5s ease;
    z-index: 5;
    pointer-events: none;
}


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

}
</style>
