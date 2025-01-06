<script >
import navbar from './components/Navbar.vue';
import { useRoute } from 'vue-router';
export default {
  name: 'App',
  components: {
    navbar
  },
  setup() {
    const route = useRoute();
    return { route };
  }
}
</script>

<template>
  <navbar v-if="!route.meta.hideNavbar"/>
  <RouterView />
</template>

<style>
body {
  margin: 0;
}
  #app {
    padding: 108px 20px;
    min-height: 100vh; /* Stellt sicher, dass der Hintergrund mindestens die gesamte Bildschirmhöhe abdeckt */
    max-width: 100vw;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f7;
  }
  #app:has(.login-view){
    padding-top: 0;
  }
</style>






