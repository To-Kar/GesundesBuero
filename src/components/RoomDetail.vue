<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="room-detail">
      <button class="back-button" @click="goBack">⬇</button>
      <h1>Details für {{ roomId }}</h1>
      <p class="temp">Temperatur: {{ temperature }}°C</p>
      <p class="humid">Luftfeuchtigkeit: {{ humidity }}%</p>
    </div>
  </transition>
</template>

<script>
export default {
  name: "RoomDetail",
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
    };
  },
  methods: {
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
  transition: transform 0.3s, opacity 0.3s;
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
  left: px;
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
  font-size: 20px;
  color: #007bff;
  text-align: center;
}

h1 {
  font-size: 30px;
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
</style>
