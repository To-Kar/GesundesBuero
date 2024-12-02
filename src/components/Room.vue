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
    target_temperature: {
      type: [Number, String],
      required: true,
    },
    target_humidity: {
      type: [Number, String],
      required: true,
    },
    number: {
      type: [Number, String],
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
    temperatureColor() {
      return this.getStatusColor(this.status.temp_status);
    },
    humidityColor() {
      return this.getStatusColor(this.status.humidity_status);
    }
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case 'optimal':
          return "#3cb371";
        case 'warning':
          return "#ffd700";
        case 'critical':
          return "#cd5c5c";
        default:
          return "#808080";
      }
    }
  }
};
</script>

<template>
  <div class="room-card">
    <h2 class="room-title">{{ name }} {{ number }}</h2>
    <div class="room-layout">
      <img :src="image" alt="Raum Layout" class="room-image" />
      <div class="metrics">
        <div class="metric-group">
          <div class="metric-label">Temperature</div>
          <div class="temperature" :style="{ backgroundColor: temperatureColor }">
            {{ temperature }}°C
            <div class="target-value">Target: {{ target_temperature }}°C</div>
          </div>
        </div>
        <div class="metric-group">
          <div class="metric-label">Humidity</div>
          <div class="humidity" :style="{ backgroundColor: humidityColor }">
            {{ humidity }}%
            <div class="target-value">Target: {{ target_humidity }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;display=swap');

/* Anwenden des Fonts */
.room-card {
  font-family: 'Noto Sans', sans-serif;
}

/* Hauptcontainer */
.room-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
  max-width: 80%;
  height: auto;
  margin: auto;
}

/* Titel */
.room-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

/* Bildlayout */
.room-layout {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
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
  padding: 0.8rem;
  border-radius: 8px;
  color: white;
  text-align: center;
  font-weight: bold;
  min-width: 80px;
  max-width: 120px;
  font-size: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.metric-group {
  margin-bottom: 1rem;
}

.metric-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.2rem;
}

.target-value {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-top: 0.2rem;
}
</style>
