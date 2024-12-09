<template>
  <div>
    <transition name="fade">
      <div v-if="isVisible" class="overlay" @click="goBack"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="isVisible" class="room-detail">
        <h1>Details für {{ roomId }}</h1>
        <button class="back-button" @click="goBack">X</button>
        <p class="temp">Temperatur: {{ temperature }}°C</p>
        <p class="set-temp">
          <span>Solltemperatur: </span>
          <button @click="adjustTargetTemperature(-1)">−</button>
          <span class="target">{{ targetTemperature }}°C</span>
          <button @click="adjustTargetTemperature(1)">+</button>
        </p>
        <p class="graph">
          <span
            class="graph-bar"
            :style="{ backgroundColor: temperatureColor, width: `${temperatureWidth}%` }"
          ></span>
        </p>
        <p class="humid">Luftfeuchtigkeit: {{ humidity }}%</p>
        <p class="set-humid">
          <span>Soll-Luftfeuchtigkeit: </span>
          <button @click="adjustTargetHumidity(-5)">−</button>
          <span class="target">{{ targetHumidity }}%</span>
          <button @click="adjustTargetHumidity(5)">+</button>
        </p>
        <p class="graph">
          <span
            class="graph-bar"
            :style="{ backgroundColor: humidityColor, width: `${targetHumidity}%` }"
          ></span>
        </p>
        <img
          src="../assets/Büro1.jpg"
          alt="Raum Layout"
          class="room-image"
        />
      </div>
    </transition>
  </div>
</template>




<script>
export default {
  props: {
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
      targetTemperature: 22,
      targetHumidity: 50, 
      debounceTimeout: null, 
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
  }
  },
  methods: {
    adjustTargetTemperature(change) {
      this.targetTemperature += change;
      this.targetTemperature = Math.max(10, Math.min(this.targetTemperature, 30)); 
      this.updateDatabase("temperature", this.targetTemperature);
    },
    adjustTargetHumidity(change) {
    // Luftfeuchtigkeit anpassen
      this.targetHumidity += change;
      this.targetHumidity = Math.max(0, Math.min(this.targetHumidity, 100)); 

      // Bestehenden Timeout abbrechen, wenn ein neuer Klick erfolgt
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Debounced API-Aufruf nach 3 Sekunden
      this.debounceTimeout = setTimeout(() => {
        this.updateDatabase("humidity", this.targetHumidity);
        console.log(this.targetHumidity);
      }, 3000); // 3 Sekunden Verzögerung
    },

    async updateDatabase(type, value) {
      try {
        await fetch(`http://localhost:7071/api/rooms/room1/sensor-data`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [type]: value }),
        });
      } catch (error) {
        console.error(`Fehler beim Speichern des Sollwerts für ${type}:`, error);
      }
    },
    goBack() {
      this.isVisible = false;
      this.$emit("close");
    },
  },
  mounted() {
    this.isVisible = true;
  },
};


</script>

<style scoped>

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

.back-button {
  position: absolute; 
  top: 0px; 
  right: 20px;
  border: none; 
  font-size: 20px; 
  cursor: pointer; 
  color: #ffffff;
}

.back-button:hover {
  color: #0056b3; 
}

.room-detail {
  position: fixed;
  bottom: 0;
  left: 1.5%;
  width: 97%;
  height: 65%;
  background-color: whitesmoke;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow-y: auto;
  border-top-right-radius: 30px;
  border-top-left-radius: 30px;
}

.temp, .humid {
  font-size: 140%;
  color: #007bff;
  text-align: left;
  padding-top: 40px;
  margin: 20px;
}

h1 {
  font-size: 35px;
  color: #007bff;
  text-align: left;
  margin: 20px;
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #007bff;
  color: whitesmoke;
  border: none;
  border-radius: 45px;
  cursor: pointer;
  font-size: 20px;
}

button:hover {
  background-color: whitesmoke;
  transition: 0.2s;
}

.room-detail .set-temp, .room-detail .set-humid {
  text-align: left;
  font-size: 20px;
  margin: 20px;
}

.room-detail .set-temp button, .room-detail .set-humid button {
  margin: 0 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 45pxpx;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 18px;
}

.room-detail .set-temp button:hover, .room-detail .set-humid button:hover {
  background-color: #0056b3;
}

.room-detail .set-temp .target, .room-detail .set-humid .target {
  font-weight: bold;
  color: #007bff;
}

.room-detail .graph {
  margin: 10px 0;
  text-align: center;
  position: relative;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 45px;
  overflow: hidden;
  margin: 20px;
}

.room-detail .graph .graph-bar {
  display: block;
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.room-image {
  display: block;
  max-height: calc(100vh * 0.37); 
  height: auto; 
  width: auto; 
  max-width: 100%; 
  margin: auto; 
  object-fit: contain; 
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}




</style>
