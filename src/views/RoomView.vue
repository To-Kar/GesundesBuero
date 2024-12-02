<template>
  <div>
    <Room 
      v-for="room in rooms" 
      :key="room.number"
      :name="room.name"
      :number="room.number"
      :temperature="room.temperature"
      :humidity="room.humidity"
      :target_temperature="room.target_temperature"
      :target_humidity="room.target_humidity"
      :image="room.image"
      :status="room.status"
    />
  </div>
</template>

<script>
import Room from "../components/Room.vue";
import axios from 'axios';

export default {
  name: "RoomView",
  components: {
    Room,
  },
  data() {
    return {
      rooms: [], // Array to hold room data
    };
  },
  mounted() {
    this.fetchRoomData(); // Fetch room data when the component mounts
  },
  methods: {
    async fetchRoomData() {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7071/api";
      try {
        const response = await axios.get(`${API_BASE_URL}/sensor-data`);
        const data = response.data;

        console.log("Data received from API:", data);

        this.rooms = data.map((roomData) => ({
          number: roomData.room_id || "N/A",
          name: roomData.name || "Room",
          temperature: roomData.current_temp || "N/A",
          humidity: roomData.current_humidity || "N/A",
          target_temperature: roomData.target_temp || "N/A",
          target_humidity: roomData.target_humidity || "N/A",
          image: roomData.imageURL || `/assets/images/room${roomData.room_id}.jpg`,
          status: roomData.status || { temp_status: 'unknown', humidity_status: 'unknown' }
        }));
        console.log(`Fetched rooms:`, this.rooms);
      } catch (error) {
        console.error("Error fetching room data:", error.message);
        // Add more detailed error logging
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
        } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
        }
      }
    },
  },
};
</script>

<style scoped>

</style>
