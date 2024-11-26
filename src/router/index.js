import { createRouter, createWebHistory} from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RoomView from '../views/RoomView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/room',
            name: 'Room',
            component: RoomView,

        },
        {
            path: '/Login',
            name: 'Login',
            component: LoginView,
            meta: { hideNavbar: true}
        }
    ],
}
);

export default router;