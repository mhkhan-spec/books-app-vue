import HomeView from '@/views/HomeView.vue';
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        meta: { title: 'Book Store - Home' }
    },
    {
        // Catch-all 404 route
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    // 3. Best Practice: Always scroll to top on navigation
    scrollBehavior(to, from, savedPosition) {
        return savedPosition || { top: 0 };
    }
});

// 4. Navigation Guard for Page Titles
router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Vue Books';
    next();
});

export default router;