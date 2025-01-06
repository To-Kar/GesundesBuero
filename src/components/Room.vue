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
    },
    // Fehlendes hinzufügen:
    is_connected: {
      type: Boolean,
      required: true,
    },
    sensor_id: {
      type: String,  // Sensor-ID kann eine Zahl oder String sein
      default: null  // Standardwert null
    },
  },
  computed: {
    // Farbe basierend auf der Temperatur
    temperatureColor() {
      const lowerThreshold = this.targetTemperature - this.temperatureOffset;
      const upperThreshold = this.targetTemperature + this.temperatureOffset;
      if (!this.is_connected || this.temperature == null || isNaN(this.temperature)) return "#d3d3d3";
      if (this.temperature < lowerThreshold) return "#586cfc"; // Unter Sollwert → Subtiles Blau
      if (this.temperature > upperThreshold) return "#cc443c"; // Über Sollwert → Subtiles Rot
      return "#589404"; // Innerhalb des Bereichs → Grün
    },
    // Farbe basierend auf der Luftfeuchtigkeit
    humidityColor() {
      const lowerThreshold = this.targetHumidity - this.humidityOffset;
      const upperThreshold = this.targetHumidity + this.humidityOffset;
      if (!this.is_connected || this.humidity == null || isNaN(this.humidity)) return "#d3d3d3"; // Neutral Grau
      if (this.humidity < lowerThreshold) return "#586cfc"; // Unter Sollwert → Subtiles Blau
      if (this.humidity > upperThreshold) return "#cc443c"; // Über Sollwert → Subtiles Rot
      return "#589404"; // Innerhalb des Bereichs → Grün
    },
    // Dynamische Klassen basierend auf is_connected
    cardClasses() {
      console.log('Room component is_connected prop:', this.is_connected);
      console.log('Room component is_connected type:', typeof this.is_connected);
      return {
        'room-card': true,
        'disconnected': !this.is_connected
      };
    },
    connectionMessage() {
      if (this.sensor_id == null) {
        return "Kein Sensor zugewiesen!";
      }
      if (!this.is_connected) {
        return "Keine Sensor Verbindung!";
      }
      return "";
    },

  },

  methods: {
    co2Color() {
      if (!this.is_connected || this.co2 == null || isNaN(this.co2)) return "#d3d3d3"; // Neutral Grau
      if (this.co2 < 800) return "#589404"; // Subtiles Grün
      if (this.co2 > 1000) return "#cc443c"; // Subtiles Rot
      return "#f0b424";                     // Gelb
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
  <div :class="cardClasses" @click="$emit('click')">
    <!-- Overlay anzeigen, wenn nicht verbunden -->


    <div class="room-layout">
      <div class="room-image-container" :class="{ 'disconnected': !is_connected }">
        <img :src="image" alt="Raum Layout" class="room-image" />

        <!-- Overlay nur anzeigen, wenn is_connected false ist -->
        <div class="overlay-container">
          <div v-if="!is_connected && sensor_id == null" class="overlay-image-no-sensor"></div>
          <div v-if="!is_connected && sensor_id != null" class="overlay-image-disconnected"></div>
          <div v-if="!is_connected || sensor_id == null" class="connection-status">{{ connectionMessage }}</div>
        </div>
      </div>

      <h2 class="room-title" :class="{ 'disconnected-title': !is_connected }">{{ name }}</h2>
      <div class="metrics">
        <div class="co2-status" :style="{ background: co2Color() }">
          CO₂ {{ co2Text() }}
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
* {
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
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
  transform-origin: center;
  transition: all .3s cubic-bezier(0, 0, .5, 1);
  will-change: transform;
  /* Für optimiertes Rendering */
  overflow: hidden;
}

.room-card:hover {
  transform: scale(1.01);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  /* Weicher Schatten */
}

.room-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Titel */
.room-title {
  position: absolute;
  top: 10%;
  left: 6%;
  color: #ffffff;
  margin: 0;
  font-size: 56px;
  line-height: 67.2px;
  letter-spacing: -1.19px;
  font-weight: 700;
  z-index: 2;
}

/* Raum-Layout */
.room-layout {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.room-layout::before,
.room-layout::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
  /* damit der Klick-Event durchgeht */
  z-index: 1;
}

/* Oberer Gradient */
.room-layout::before {
  top: 0;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0) 100%);
}

/* Unterer Gradient */
.room-layout::after {
  bottom: 0;
  background: linear-gradient(to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0) 100%);
}

/* Raum-Bild */
.room-image {
  width: 100%;
  height: 100%;
  filter: grayscale(20%) contrast(1.2);
  transition: filter 0.3s ease;

}

/* Metriken */
.metrics {
  position: absolute;
  display: flex;
  bottom: 10%;
  left: 6%;
  right: 6%;
  gap: 12px;
  z-index: 2;
}

/* Dynamische Anzeige für Temperatur, Luftfeuchtigkeit und CO2 */
.temperature,
.humidity,
.co2-status {
  flex: 1 1 calc(33.333% - 10px);
  padding: 4px;
  text-align: center;
  color: #fff;
  font-size: 32px;
  line-height: 38.4px;
  letter-spacing: -0.68px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 52px;
}

/* Overlay anzeigen, wenn disconnected */
.room-image-container.disconnected .room-image {
  filter: grayscale(80%) contrast(0.8);
  opacity: 0.7;
}

.disconnected-title {
  filter: grayscale(80%) contrast(0.8);
}

.overlay-container {
  position: absolute;
  top: 8%;
  left: 82%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 7px; /* Abstand zwischen den Overlays und der Nachricht */
  z-index: 4;
}
.overlay-image-disconnected {
  width: 28px; /* Feste Größe der Icons */
  height: 28px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0; /* Verhindert das Schrumpfen der Icons */
  background-image: url('../assets/disconnected.png');

}
.overlay-image-no-sensor {
  width: 28px; /* Feste Größe der Icons */
  height: 28px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  flex-shrink: 0; /* Verhindert das Schrumpfen der Icons */
  background-image: url('../assets/no-sensor.png');
}
.connection-status {
  color: white;
  font-size: 18px;
  font-weight: 400;
  padding: 7px 7px;
  border-radius: 52px;
  white-space: nowrap;
}

@media (max-width: 1700px) {
  .overlay-container {
    top: 8%;
    left: 75%;
  }
}
/* Responsivität */
@media (max-width: 1300px) {
    .overlay-container {
    top: 8%;
    left: 75%;
  }
  .room-card {
    width: 100%;
  }

  .room-title {
    top: 8%;
    left: 6%;
    font-size: 32px;
    color: white;
  }

  .metrics {
    gap: 8px;
  }

  .temperature,
  .humidity,
  .co2-status {
    bottom: 3%;
    left: 3%;
    right: 3%;
    padding: 4px;
    font-size: 14px;
    line-height: 18.2px;
  }

  .connection-status {
    font-size: 14px;
    line-height: 18.2px;
    padding: 8px;
  }
}
@media (max-width: 1000px) {
    .overlay-container {
    top: 9%;
    left: 70%;
  }
  .overlay-image-disconnected {
  width: 20px; /* Feste Größe der Icons */
  height: 20px;
}
.overlay-image-no-sensor {
  width: 21px; /* Feste Größe der Icons */
  height: 21px;
}
.connection-status {
  font-size: 12px;
}
}
@media (max-width: 770px) {
    .overlay-container {
    top: 9%;
    left: 69%;
  }
}
</style>