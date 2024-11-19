<script>
export default {
  name: 'Room',
  props: {
    name: {
      type: String,
      default: 'Büroraum 1'
    },
    temperature: {
      type: Number,
      default: 19
    },
    humidity: {
      type: Number,
      default: 45
    }
  }
}
</script>

<template>
  <div class="room-card">
    <h2 class="room-title">{{ name }}</h2>
    <div class="room-layout">
      <img src="../assets/Büro1.jpg" alt="Raum Layout" class="room-image">
      <div class="metrics">
        <div class="temperature">{{ temperature }}°C</div>
        <div class="humidity">{{ humidity }}%</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  max-width: 80%;
  height: auto;
  margin: auto;
}

.room-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.room-layout {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}

.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.metrics {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem; /* Dynamische Schriftgröße */
}

.temperature,
.humidity {
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  font-size: calc(0.8rem + 1vw); /* Dynamische Schriftgröße basierend auf der Fensterbreite */
  font-weight: bold;
  color: white;
  width: fit-content;
  min-width: 50px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); /* Für bessere Lesbarkeit */
}

.temperature {
  background-color: #007bff; /* Blaue Farbe */
}

.humidity {
  background-color: #28a745; /* Grüne Farbe */
}

/* Responsive Anpassungen */
@media (max-width: 768px) {
  .metrics {
    font-size: 0.9rem;
  }

  .temperature,
  .humidity {
    font-size: calc(0.7rem + 1vw);
  }
}
</style>

