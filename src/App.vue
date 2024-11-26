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
* {
    margin: 0;
    padding: 0;
    background-color: whitesmoke;
  }
  
  #app {
    padding-top: 100px;
    max-height: 100vh;
    max-width: 100vw;
    display: flex;
    flex-direction: column;
  }
  #app:has(.login-view){
    padding-top: 0;
  }
</style>






