<script>
export default {
  name: "Room",
  props: {
    name: {
      type: String,
      default: "Büroraum",
    },
    image: {
      type: String,
      required: true
    },
    temperature: {
      type: [Number, String],
      required: true,
    },
    humidity: {
      type: [Number, String],
      required: true,
    },
    number: {
      type: [Number, String],
      required: true,
    },
    targetTemperature: {
      type: Number,
      required: true,
    },
    targetHumidity: {
      type: Number,
      required: true,
    },
    temperatureOffset: {
      type: Number,
      required: true,
    },
    humidityOffset: {
      type: Number,
      required: true,
    },
    status: {
      type: Object,
      default: () => ({
        temp_status: 'unknown',
        humidity_status: 'unknown'
      })
    }
  },
  computed: {
    // Farbe basierend auf der Temperatur
    temperatureColor() {
      const lowerThreshold = this.targetTemperature - this.temperatureOffset;
      const upperThreshold = this.targetTemperature + this.temperatureOffset;

      if (this.temperature < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.temperature > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
    // Farbe basierend auf der Luftfeuchtigkeit
    humidityColor() {
      const lowerThreshold = this.targetHumidity - this.humidityOffset;
      const upperThreshold = this.targetHumidity + this.humidityOffset;

      if (this.humidity < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.humidity > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
  },
};
</script>

<template>
  <div class="room-card" @click="$emit('click')">
    <h2 class="room-title">{{ name }}</h2>
    <div class="room-layout">
      <img :src="image" alt="Raum Layout" class="room-image" />
      <div class="metrics">
        <!-- Dynamische Farbe für Temperatur -->
        <div class="temperature" :style="{ backgroundColor: temperatureColor }">
          {{ temperature }}°C
        </div>
        <!-- Dynamische Farbe für Luftfeuchtigkeit -->
        <div class="humidity" :style="{ backgroundColor: humidityColor }">
          {{ humidity }}%
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
*{
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}

/* Hauptcontainer */
.room-container{
  display: flex;
  justify-content: center;
  width: 100%;
}
.room-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  height: auto;
  margin: auto;
}

/* Titel */
.room-title {
  font-size: 32px;
  line-height: 38.4px;
  margin-bottom: 8px;
  letter-spacing: -0.68px;
  font-weight: 700;
  text-align: left;
}
@media screen and (max-width: 768px) {
  .room-title {
    font-size: 18px;
    line-height: 21.6px;
    letter-spacing: -0.4px;
  }
}

/* Bildlayout */
.room-layout {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
} 

/* Raum-Bild */
.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Temperatur- und Luftfeuchtigkeitsanzeige */
.metrics {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Dynamische Anzeige für Temperatur und Luftfeuchtigkeit */
.temperature,
.humidity {
  padding: 0.5rem;
  border-radius: 4px;
  color: white; /* Textfarbe immer weiß */
  text-align: center;
  font-weight: bold;
  min-width: 60px;
  max-width: 100px;
  font-size: calc(0.5rem + 1vw); /* Dynamische Schriftgröße */
}
</style>