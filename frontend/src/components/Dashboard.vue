<template>
    <div class="dashboard">
      <RoomCard
        v-for="room in rooms"
        :key="room.id"
        :roomName="room.name"
        :roomImage="room.image"
        :temperature="room.temperature"
        :humidity="room.humidity"
        :isConnected="room.isConnected"
      />
    </div>
  </template>
  
  <script>
  import RoomCard from './RoomCard/RoomCard.vue';
  
  export default {
    components: {
      RoomCard
    },
    data() {
      return {
        rooms: [
          { id: 1, name: 'Büro 1', image: 'room1.jpg', temperature: 19, humidity: 45, isConnected: true },
          { id: 2, name: 'Büro 2', image: 'room2.jpg', temperature: 22, humidity: 45, isConnected: false },
          { id: 3, name: 'Büro 3', image: 'room3.jpg', temperature: 21, humidity: 60, isConnected: true },
          { id: 4, name: 'Büro 4', image: 'room4.jpg', temperature: 25, humidity: 37, isConnected: true },
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .dashboard {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
  }
  </style>
  