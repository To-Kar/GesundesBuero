<template>
  <div>
    <transition name="fade">
      <div v-if="isVisible" class="overlay" @click="goBack"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="isVisible" class="room-detail">
        <button class="back-button" @click="goBack">X</button>
        <h1>{{ name }}</h1>
        <div class="content">
          <img :src="image" alt="Raum Layout" class="room-image" />
          <div class="details">
            <p class="temp">Temperatur: {{ temperature }}°C</p>
            <p class="set-temp">
              <span class="soll">Solltemperatur: </span>
              <button @click="adjustTargetTemperature(-1)" :disabled="disableTemperatureButtons">−</button>
              <span class="target">{{ targetTemperature }}°C</span>
              <button @click="adjustTargetTemperature(1)" :disabled="disableTemperatureButtons">+</button>
            </p>
            <p class="graph">
              <span
                class="graph-bar"
                :style="{ backgroundColor: temperatureColor, width: `${temperatureWidth}%` }"
              ></span>
            </p>
            <p class="humid">Luftfeuchtigkeit: {{ humidity }}%</p>
            <p class="set-humid">
              <span class="soll">Soll-Luftfeuchtigkeit: </span>
              <button @click="adjustTargetHumidity(-5)" :disabled="disableHumidityButtons">−</button>
              <span class="target">{{ targetHumidity }}%</span>
              <button @click="adjustTargetHumidity(5)" :disabled="disableHumidityButtons">+</button>
            </p>
            <p class="graph">
              <span
                class="graph-bar"
                :style="{ backgroundColor: humidityColor, width: `${targetHumidity}%` }"
              ></span>
            </p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { roomApi } from "../services/roomApi";

export default {
  props: {
    image: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: "Büroraum",
    },
    roomId: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
      targetTemperature: null, // Wird dynamisch geladen
      targetHumidity: 0, // Wird dynamisch geladen
      debounceTimeout: null,
      disableTemperatureButtons: false,
      disableHumidityButtons: false,
    };
  },
  computed: {
    temperatureColor() {
      const minTemp = 10; // Minimaltemperatur
      const maxTemp = 30; // Maximaltemperatur
      const percent = Math.min(Math.max((this.targetTemperature - minTemp) / (maxTemp - minTemp), 0), 1);

      const r = percent < 0.5
        ? Math.round(0 + percent * 2 * 0) // Blau → Grün
        : Math.round(255 * (percent - 0.5) * 2); // Grün → Rot

      const g = percent < 0.5
        ? Math.round(255 * percent * 2) // Blau → Grün
        : Math.round(255 - (percent - 0.5) * 2 * 255); // Grün → Rot

      const b = percent < 0.5
        ? Math.round(255 - percent * 2 * 255) // Blau → Grün
        : 0; // Grün → Rot

      return `rgb(${r}, ${g}, ${b})`;
    },
    temperatureWidth() {
      const minTemp = 10;
      const maxTemp = 30;
      return Math.min(Math.max(((this.targetTemperature - minTemp) / (maxTemp - minTemp)) * 100, 0), 100);
    },
    humidityColor() {
      const minHumid = 0; // Minimale Luftfeuchtigkeit
      const maxHumid = 100; // Maximale Luftfeuchtigkeit
      const percent = Math.min(Math.max(this.targetHumidity / maxHumid, 0), 1);

      const r = Math.round(192 * (1 - percent)); // Grau → Blau → Dunkelblau
      const g = Math.round(192 * (1 - percent)); // Grau → Blau → Dunkelblau
      const b = Math.round(255 * percent); // Grau → Blau → Dunkelblau

      return `rgb(${r}, ${g}, ${b})`;
    },
  },
  methods: {
  async fetchRoomDetails() {
    try {
      const room = await roomApi.getRoomById(this.roomId);
      this.targetTemperature = room.target_temperature;
      this.targetHumidity = room.target_humidity;
    } catch (error) {
      console.error("Fehler beim Abrufen der Raumdaten:", error);
    }
  },
  adjustTargetTemperature(change) {
    if (this.disableTemperatureButtons) return;

    this.targetTemperature += change;
    this.targetTemperature = Math.max(10, Math.min(this.targetTemperature, 30));

    this.disableHumidityButtons = true; // Feuchtigkeits-Buttons deaktivieren

    if (this.debounceTimeoutTemp) {
      clearTimeout(this.debounceTimeoutTemp);
    }

    this.debounceTimeoutTemp = setTimeout(() => {
      this.updateTarget("target_temp", this.targetTemperature);
      this.disableHumidityButtons = false; // Feuchtigkeits-Buttons wieder aktivieren
    }, 1500);
  },
  adjustTargetHumidity(change) {
    if (this.disableHumidityButtons) return;

    this.targetHumidity += change;
    this.targetHumidity = Math.max(0, Math.min(this.targetHumidity, 100));

    this.disableTemperatureButtons = true; // Temperatur-Buttons deaktivieren

    if (this.debounceTimeoutHumidity) {
      clearTimeout(this.debounceTimeoutHumidity);
    }

    this.debounceTimeoutHumidity = setTimeout(() => {
      this.updateTarget("target_humidity", this.targetHumidity);
      this.disableTemperatureButtons = false; // Temperatur-Buttons wieder aktivieren
    }, 1500);
  },
  async updateTarget(type, value) {
    try {
      const settings = { [type]: value };
      await roomApi.updateRoomSettings(this.roomId, settings);
    } catch (error) {
      console.error(`Fehler beim Speichern des Sollwerts für ${type}:`, error);
    }
  },
  goBack() {
    this.isVisible = false;
    this.$emit("close");
  },
}
,
  mounted() {
    this.isVisible = true;
    this.fetchRoomDetails(); // Raumdetails beim Laden abrufen
  },
};
</script>

<style scoped>

*{
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}
/* Transition für das Overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}


/* Styling für das Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
}

/* Slide-Up Animation */
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

/* Zurück-Button */
.back-button {
  position: absolute;
  top: 10px;
  right: 20px;
  border: none;
  font-size: 30px;
  cursor: pointer;
  background-color: whitesmoke;
  color: #000000;
  border-radius: 50%;
  padding: 10px;
}

/* Raum-Detail Container */
.room-detail {
  position: fixed;
  bottom: 0;
  left: 3%;
  width: 92%;
  height: 65%;
  background-color: whitesmoke;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow-y: auto;
  border-top-right-radius: 30px;
  border-top-left-radius: 30px;
  padding: 20px;
}

/* Flexbox-Layout für Bild und Details */
.content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

/* Bild */
.room-image {
  max-width: 80%;
  max-height: 900px;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 37px;
}

/* Details-Bereich */
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  
}

.temp, .humid {
  font-size: 180%;
  color: #0083bc;
}

.soll {
  font-size: 140%;
}

h1 {
  font-size: 35px;
  color: #000000;
  margin-bottom: 20px;
}

/* Buttons */
button {
  margin: 0 10px;
  padding: 10px 15px;
  background-color: #0083bc;
  color: whitesmoke;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  transform: scale(1.1);
}

.room-detail .set-temp, .room-detail .set-humid {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
}

/* Graphen */
.room-detail .graph {
  position: relative;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.room-detail .graph .graph-bar {
  display: block;
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* Zielwerte */
.room-detail .set-temp .target, .room-detail .set-humid .target {
  font-weight: bold;
  color: #007bff;
}

/* Responsive Design: Mobile Ansicht */
@media screen and (max-width: 768px) {
  .content {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }
  
  .room-detail {
  height: 70%;
  width: 85%;
}
  
  .details {
    width: 100%;
    text-align: center;
    align-items: center;
  }

  .room-image {
    max-width: 90%;
    max-height: 200px;
    margin-top: 20px;
  }

  h1 {
    text-align: center;
  }

  .temp, .humid {
    text-align: center;
  }
}

button:disabled {
  background-color: #ccc; /* Ausgegraut */
  color: #666; /* Textfarbe ausgegraut */
  cursor: not-allowed; /* Kein Klick möglich */
}


</style>