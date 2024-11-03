<template>
    <i :class="['icon', iconName]"></i>
  </template>
  
  <script>
  export default {
    props: {
      name: String
    },
    computed: {
      iconName() {
        return `icon-${this.name}`;
      }
    }
  };
  </script>
  
  <style scoped>
  .icon {
    font-size: 24px;
  }
  .icon-notification::before {
    content: '🔔';
  }
  .icon-settings::before {
    content: '⚙️';
  }
  </style>
  