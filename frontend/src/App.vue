<template>
  <div id="app">
    <!-- Header Component -->
    <Header />

    <!-- Main Dashboard Component -->
    <Dashboard />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Dashboard from './components/Dashboard.vue';

export default {
  name: "App",
  components: {
    Header,
    Dashboard
  }
};
</script>

<style scoped>
#app {
  font-family: Arial, sans-serif;
  text-align: center;
  color: #333;
  margin-top: 20px;
}
</style>
