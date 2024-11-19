<script>
import Room from './components/Room.vue';

export default {
  components: {
    Room
  }
}
</script>

<template>
  <div>
    <header class="app-header">
      <img src="./assets/Systec.jpg" alt="Header" class="header-image" />
    </header>
    <div class="app-content">
      <Room />
    </div>
  </div>
</template>

<style>
/* Styling für den Header */
.app-header {
  width: 100%;
  height: auto;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 2px solid black;
}

.header-image {
  width: 100%;
  max-width: 1200px; /* Maximale Breite */
  height: auto; /* Erhalte Seitenverhältnis */
}

/* Styling für den App-Inhalt */
.app-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 100px); /* Höhe des Inhalts abzüglich Header-Höhe */
  background-color: #eaeaea;
}
</style>
