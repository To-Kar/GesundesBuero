<script>
import Login from './components/Login.vue';

export default {
  components: {
    Login
  }
}
</script>

<template>
  <div id="app">
    <login />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

/* Hintergrundfarbe für die gesamte App */
body {
  background-color: whitesmoke;
}

/* App-Container */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
