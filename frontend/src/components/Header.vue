<template>
    <header class="app-header">
      <h1>SYSTEMS</h1>
      <div class="icons">
        <icon name="notification" />
        <icon name="settings" />
      </div>
    </header>
  </template>
  
  <script>
  import Icon from './Icon.vue';
  
  export default {
    components: {
      Icon
    }
  };
  </script>
  
  <style scoped>
  .app-header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background-color: #333;
    color: white;
  }
  .icons {
    display: flex;
    gap: 10px;
  }
  </style>
  