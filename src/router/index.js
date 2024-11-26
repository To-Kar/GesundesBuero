import { createRouter, createWebHistory} from 'vue-router';
import RoomView from '../views/RoomView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/room',
            name: 'room',
            component: RoomView
        },
    ],
}
);
        
export default router;