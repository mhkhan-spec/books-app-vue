<script setup lang="ts">
// No logic needed, just navigation
</script>

<template>
    <!-- Floating Action Button: Hidden on mobile (hidden), Flex on medium up (md:flex) -->
    <router-link
      to="/create"
      class="fixed bottom-6 right-6 z-50 hidden md:flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-emerald-700 active:scale-95"
      aria-label="Add Book"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="h-8 w-8"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </router-link>
</template>
