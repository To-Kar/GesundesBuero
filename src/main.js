import { createApp } from 'vue';
import { msalInstance } from './authConfig';
import router from './router';
import { registerGuard } from './router/Guard';
import './assets/font/font.css';
import App from './App.vue';

import echartsPlugin from './plugins/echarts';
import PrimeVue from 'primevue/config';


const app = createApp(App);
app.use(router);
app.use(echartsPlugin); 



registerGuard(router);
app.mount('#app');
