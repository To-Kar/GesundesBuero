<template>
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
        <span class="graph-bar" :style="{ backgroundColor: temperatureColor, width: `${temperatureWidth}%` }"></span>
      </p>
      
      <p class="humid">Luftfeuchtigkeit: {{ humidity }}%</p>
      <p class="set-humid">
        <span>Soll-Luftfeuchtigkeit: </span>
        <button @click="adjustTargetHumidity(-5)">−</button>
        <span class="target">{{ targetHumidity }}%</span>
        <button @click="adjustTargetHumidity(5)">+</button>
      </p>
      <p class="graph">
        <span class="graph-bar" :style="{ backgroundColor: humidityColor, width: `${targetHumidity}%` }"></span>
      </p>
      <img src="../assets/Büro1.jpg" alt="Raum Layout" class="room-image" />
    </div>
  </transition>
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
      targetTemperature: 22, // Default-Solltemperatur
      targetHumidity: 50, // Default-Soll-Luftfeuchtigkeit
      debounceTimeout: null, // Timer für den Debounce-Mechanismus
    };
  },
  computed: {
    temperatureColor() {
      const minTemp = 10;
      const maxTemp = 30;
      const percent = Math.min(Math.max((this.targetTemperature - minTemp) / (maxTemp - minTemp), 0), 1);
      const red = Math.round(255 * percent);
      const blue = Math.round(255 * (1 - percent));
      return `rgb(${red}, 0, ${blue})`;
    },
    temperatureWidth() {
      const minTemp = 10;
      const maxTemp = 30;
      return Math.min(Math.max(((this.targetTemperature - minTemp) / (maxTemp - minTemp)) * 100, 0), 100);
    },
    humidityColor() {
      const minHumid = 0;
      const maxHumid = 100;
      const percent = Math.min(Math.max(this.targetHumidity / maxHumid, 0), 1);
      const green = Math.round(255 * percent);
      const blue = Math.round(255 * (1 - percent));
      return `rgb(0, ${green}, ${blue})`;
    },
  },
  methods: {
    adjustTargetTemperature(change) {
      this.targetTemperature += change;
      this.targetTemperature = Math.max(10, Math.min(this.targetTemperature, 30)); // Grenzen: 10°C bis 30°C
      this.updateDatabase("temperature", this.targetTemperature);
    },
    adjustTargetHumidity(change) {
    // Luftfeuchtigkeit anpassen
      this.targetHumidity += change;
      this.targetHumidity = Math.max(0, Math.min(this.targetHumidity, 100)); // Grenzen: 0% bis 100%

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
  font-size: 30px; 
  cursor: pointer; 
  color: #ffffff;
}

.back-button:hover {
  color: #0056b3; 
}

.room-detail {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 70%;
  background-color: whitesmoke;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 100;
  overflow-y: auto;
  border-top-right-radius: 45px;
  border-top-left-radius: 45px;
}

.temp, .humid {
  font-size: 140%;
  color: #007bff;
  text-align: left;
  padding-top: 60px;
}

h1 {
  font-size: 40px;
  color: #007bff;
  text-align: center;
}

button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #007bff;
  color: whitesmoke;
  border: none;
  border-radius: 45px;
  cursor: pointer;
}

button:hover {
  background-color: whitesmoke;
  transition: 0.2s;
}

.room-detail .set-temp, .room-detail .set-humid {
  text-align: left;
  font-size: 20px;
  margin: 15px 0;
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
}

.room-detail .graph .graph-bar {
  display: block;
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
}

.room-image {
  display: flex; /* Flexbox aktivieren */
  align-items: center; /* Vertikal zentrieren */
  height: 50%;
  width: 50%;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  margin: auto; /* Sicherstellen, dass es auch im Kontext zentriert bleibt */
  margin-top: 15px;
}


</style>
