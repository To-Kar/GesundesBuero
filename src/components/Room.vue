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
      type: Boolean
    }
  },
  computed: {
    
    // Farbe basierend auf der Temperatur
    temperatureColor() {
      const lowerThreshold = this.targetTemperature - this.temperatureOffset;
      const upperThreshold = this.targetTemperature + this.temperatureOffset;
      if (this.temperature == null || isNaN(this.temperature)) return "#b0b0b0";
      if (this.temperature < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.temperature > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
    // Farbe basierend auf der Luftfeuchtigkeit
    humidityColor() {
      const lowerThreshold = this.targetHumidity - this.humidityOffset;
      const upperThreshold = this.targetHumidity + this.humidityOffset;
      if (this.humidity == null || isNaN(this.humidity)) return "#b0b0b0";
      if (this.humidity < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.humidity > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
    // Fehlendes hinzufügen: Dynamische Klassen basierend auf is_connected
    cardClasses() {
      console.log('Room component is_connected prop:', this.is_connected);
      console.log('Room component is_connected type:', typeof this.is_connected);
      return {
        'room-card': true,
        'disconnected': !this.is_connected // Stellt sicher, dass die Klasse basierend auf is_connected gesetzt wird
      };
    }
    
  },

  methods: {
  co2Color() {
    if (this.co2 == null || isNaN(this.co2)) return "#b0b0b0";
    if (this.co2 < 800) return "#3cb371";  // Grün
    if (this.co2 > 1000) return "#cd5c5c"; // Rot
    return "#FFD700";                      // Gelb
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
    <div v-if="!is_connected" class="connection-status">
      Disconnected
    </div>

    <h2 class="room-title">{{ name }}</h2>
    <div class="room-layout">
      <img :src="image" alt="Raum Layout" class="room-image" />
      <div class="metrics">
        <div class="co2-status" :style="{ backgroundColor: co2Color() }">
          CO₂ {{co2Text()}}
        </div>
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
  position: relative;
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

/* Overlay anzeigen, wenn disconnected */
.connection-status {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7); /* Dunklerer Hintergrund für bessere Lesbarkeit */
  color: red;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 100; /* Höherer z-index, um über anderen Elementen zu liegen */
  font-weight: 900;
  filter: none !important;
  opacity: 2 !important;
}

/* Fehlendes hinzufügen: ausgegrauter Zustand bei Disconnected */
.disconnected {
  filter: grayscale(100%);
}

/* Anpassungen für den "Disconnected" Status */
.connection-status {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #ff0000; /* Rot */
  padding: 2px 5px;
  font-size: 0.8em;
  font-weight: bold; /* Fett */
  z-index: 100 !important; /* Über allen anderen Elementen */
  filter: none !important; /* Kein Graustufenfilter */
  opacity: 1 !important; /* Volle Deckkraft */
}

/* Entfernen der Opacity aus .disconnected, um den "Disconnected" Text nicht zu beeinflussen */
.disconnected {
  filter: grayscale(100%);
  /* opacity: 0.7; Entfernt */
}

/* Sicherstellen, dass .connection-status nicht ausgegraut wird */
.disconnected .connection-status {
  filter: none !important;
  opacity: 1 !important;
}

.disconnected .connection-status,
div.room-card .connection-status {
  filter: none !important;
  opacity: 1 !important;
}

.co2-status {
    padding: 0.5rem;
    border-radius: 4px;
    color: white;
    text-align: center;
    font-weight: bold;
    min-width: 60px;
    max-width: 100px;
    font-size: calc(0.5rem + 1vw);
}
</style>
