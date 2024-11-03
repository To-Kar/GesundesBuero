<template>
  <div class="room-card" :style="backgroundStyle">
    <h3>{{ roomName }}</h3>
    <sensor-status :temperature="temperature" :humidity="humidity" :isConnected="isConnected" />
    
    <!-- Sensor Data Container -->
    <div class="sensor-data">
      <div class="sensor-value">{{ formattedTemperature }}</div>
      <div class="sensor-value">{{ formattedHumidity }}</div>
    </div>
  </div>
</template>

<script>
import SensorStatus from '../SensorStatus.vue';
import './RoomCard.css';

export default {
  components: {
    SensorStatus
  },
  props: {
    roomName: {
      type: String,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number,
      required: true
    },
    isConnected: {
      type: Boolean,
      required: true
    },
    backgroundImage: {
      type: String,
      default: () => require('../Assets/Untitled.png') // Can be dynamically set through props
    }
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url(${this.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    },
    formattedTemperature() {
      return `${this.temperature}°C`;
    },
    formattedHumidity() {
      return `${this.humidity}%`;
    }
  }
};
</script>
