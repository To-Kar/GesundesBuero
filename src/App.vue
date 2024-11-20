<script>
import navbar from './components/nav-bar.vue';

export default {
  components: {
    navbar
  }
}
</script>

<template>
  <div>
  <navbar />
  </div>
</template>

<style>
* {
    margin: 0;
    padding: 0;
    background-color: whitesmoke;
  }
  
  #app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>