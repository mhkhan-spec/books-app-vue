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
        path: '/create',
        name: 'create-book',
        component: () => import('@/views/CreateBookView.vue'),
        meta: { title: 'Create New Book' }
    },
    {
        path: '/cart',
        name: 'cart',
        component: () => import('@/views/CartView.vue'),
        meta: { title: 'Shopping Cart' }
    },
    {

        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/views/NotFound.vue')
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,

});


router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Vue Books';
    next();
});

export default router;