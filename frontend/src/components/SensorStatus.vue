<template>
    <div class="sensor-status">
      <div :class="['status', connectionClass]">
        <span v-if="isConnected">{{ temperature }}°C</span>
        <span v-else>Keine Verbindung zum Sensor</span>
      </div>
      <div :class="['status', humidityClass]">
        {{ humidity }}%
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      temperature: Number,
      humidity: Number,
      isConnected: Boolean
    },
    computed: {
      connectionClass() {
        return this.isConnected ? 'connected' : 'disconnected';
      },
      humidityClass() {
        return this.humidity > 50 ? 'high-humidity' : 'low-humidity';
      }
    }
  };
  </script>
  
  <style scoped>
  .sensor-status {
    display: flex;
    gap: 10px;
  }
  .status {
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
    text-align: center;
  }
  .connected {
    background-color: #4CAF50;
    color: white;
  }
  .disconnected {
    background-color: #FF5252;
    color: white;
  }
  .high-humidity {
    background-color: #FF5722;
    color: white;
  }
  .low-humidity {
    background-color: #4CAF50;
    color: white;
  }
  </style>
