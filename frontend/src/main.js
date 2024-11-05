import Vue from 'vue';
import App from './App.vue';

// Import all components
import Header from './components/Header.vue';
import Dashboard from './components/Dashboard.vue';
import RoomCard from './components/RoomCard/RoomCard.vue';
import SensorStatus from './components/SensorStatus.vue';
import Icon from './components/Icon.vue';

// Optionally, register components globally if you plan to use them frequently
Vue.component('Header', Header);
Vue.component('Dashboard', Dashboard);
Vue.component('RoomCard', RoomCard);
Vue.component('SensorStatus', SensorStatus);
Vue.component('Icon', Icon);

new Vue({
  render: h => h(App),
}).$mount('#app');
