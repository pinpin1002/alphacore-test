import { createRouter, createWebHistory } from 'vue-router';
const Home = async () => {
    return (await import(/* webpackChunkName: "chunk_Home" */ '@/views/home')).Home;
};

const Login = async () => {
    return (await import(/* webpackChunkName: "chunk_Login" */ '@/views/login')).Login;
};

const Order = async () => {
    return (await import(/* webpackChunkName: "chunk_Order" */ '@/views/order')).Order;
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
            meta: { requiresAuth: true },
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/order',
            name: 'order',
            component: Order,
            meta: { requiresAuth: true },
        },
        {
            path: '/:catchAll(.*)',
            redirect: { name: 'home' },
        },
    ],
});

router.beforeEach((to) => {
    let defaultPage = { name: 'order' };

    if (to?.meta?.requiresAuth && !localStorage.getItem('auth')) {
        let path = { name: 'login' };
        return path;
    }

    if ((to.name === 'login' || to.name === 'home') && localStorage.getItem('auth')) {
        return defaultPage;
    }
});

export default router;
