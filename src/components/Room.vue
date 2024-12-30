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
    co2: {
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
      if (this.temperature == null || isNaN(this.temperature)) return "#d3d3d3"; // Neutral Grau
      if (this.temperature < lowerThreshold) return "linear-gradient(135deg, #aecde0, #5a8da4)"; // Unter Sollwert → Subtiles Blau
      if (this.temperature > upperThreshold) return "linear-gradient(135deg, #e8a6a6, #b34646)"; // Über Sollwert → Subtiles Rot
      return "linear-gradient(135deg, #a8d5a6, #5b9d68)"; // Innerhalb des Bereichs → Subtiles Grün
    },
    // Farbe basierend auf der Luftfeuchtigkeit
    humidityColor() {
      const lowerThreshold = this.targetHumidity - this.humidityOffset;
      const upperThreshold = this.targetHumidity + this.humidityOffset;
    if (this.humidity == null || isNaN(this.humidity)) return "#d3d3d3"; // Neutral Grau
    if (this.humidity < lowerThreshold) return "linear-gradient(135deg, #aecde0, #5a8da4)"; // Unter Sollwert → Subtiles Blau
    if (this.humidity > upperThreshold) return "linear-gradient(135deg, #e8a6a6, #b34646)"; // Über Sollwert → Subtiles Rot
      return "linear-gradient(135deg, #a8d5a6, #5b9d68)"; // Innerhalb des Bereichs → Subtiles Grün
  },
},
 methods: {
  co2Color() {
    if (this.co2 == null || isNaN(this.co2)) return "#d3d3d3"; // Neutral Grau
    if (this.co2 < 800) return "linear-gradient(135deg, #a8d5a6, #5b9d68)"; // Subtiles Grün
    if (this.co2 > 1000) return "linear-gradient(135deg, #e8a6a6, #b34646)"; // Subtiles Rot
    return "linear-gradient(135deg, #f5d19e, #d8a972)"; // Elegantes Gelb
    },
  co2Text() {
    if (this.co2 == null || isNaN(this.co2)) return "N/A";
    if (this.co2 < 800) return "Gut";  // Anzeige für niedrige CO₂-Werte
    if (this.co2 >= 800 && this.co2 <= 1000) return "Ok";  // Mittlerer Bereich
    return "Hoch";  // Alarm bei hohen CO₂-Werten
  }
}

  
};
</script>

<template>
  <div class="room-card" @click="$emit('click')">
    <h2 class="room-title">{{ name }}</h2>
    <div class="room-layout">
      <img :src="image" alt="Raum Layout" class="room-image" />
      <div class="metrics">
        <div class="co2-status" :style="{ background: co2Color() }">
          CO₂ {{co2Text()}}
        </div>
        <!-- Dynamische Farbe für Temperatur -->
        <div class="temperature" :style="{ background: temperatureColor }">
          {{ temperature }}°C
        </div>
        <!-- Dynamische Farbe für Luftfeuchtigkeit -->
        <div class="humidity" :style="{ background: humidityColor }">
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
.room-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  padding: 20px;
}

/* Raumkarte */
.room-card {
  background: #fff;
  backface-visibility: hidden;
  will-change: transform, box-shadow;
  border-radius: 18px;
  padding: 0px;
  box-shadow: 2px 4px 12px #00000014;
  backdrop-filter: blur(15px);
  width: 300px;
  max-width: 90%;
  position: relative;
  transform-origin: center;
  transition: all .3s cubic-bezier(0,0,.5,1);
  will-change: transform; /* Für optimiertes Rendering */
}

.room-card:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25); /* Weicher Schatten */
}

/* Titel */
.room-title {
  color: #000000;
  margin-bottom: 20px;
  text-align: center;
  font-size: 32px;
  line-height: 38.4px;
  letter-spacing: -0.68px;
  font-weight: 700;
}

/* Raum-Layout */
.room-layout {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* Verhältnis 16:9 */
  overflow: hidden;
}

/* Raum-Bild */
.room-image {
  border-radius: 0 0 18px 18px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%) contrast(1.2);
  transition: filter 0.3s ease;
}


/* Metriken */
.metrics {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
}

/* Dynamische Anzeige für Temperatur, Luftfeuchtigkeit und CO2 */
.temperature,
.humidity,
.co2-status {
  flex: 1 1 calc(33.333% - 10px);
  padding: 10px;
  border-radius: 10px;
  text-align: center;
  font-weight: bold;
  color: #fff;
  font-size: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Responsivität */
@media (max-width: 768px) {
  .room-card {
    width: 100%;
  }

  .room-title {
    font-size: 20px;
  }

  .metrics {
    gap: 5px;
  }

  .temperature,
  .humidity,
  .co2-status {
    font-size: 14px;
  }
}

</style>