import { createApp } from 'vue';
import { msalInstance } from './authConfig';
import router from './router';
import { registerGuard } from './router/Guard';
import './assets/font/font.css';
import App from './App.vue';

const app = createApp(App);
app.use(router);
registerGuard(router);
app.mount('#app');