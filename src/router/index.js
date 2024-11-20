import { createRouter, createWebHistory} from 'vue-router';
import RoomView from '../views/RoomView.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'room',
            component: RoomView
        },
    ],
}
);
        
export default router;