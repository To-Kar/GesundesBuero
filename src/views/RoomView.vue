<template>
  <div>
    <Room v-for="room in rooms" :key="room.number" :room="room" />
  </div>
</template>

<script>
import Room from "../components/Room.vue";

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
      const API_BASE_URL = "http://localhost:7071/api/room";
      try {
        const response = await fetch(`${API_BASE_URL}/rooms/sensor-data`);
        if (!response.ok) {
          throw new Error(`Error fetching room data`);
        }
        const data = await response.json();

        // Log the data received from the API for debugging
        console.log("Data received from API:", data);

        this.rooms = data.map((roomData) => ({
          number: roomData.room_id || "N/A",
          temperature: roomData.target_temp || "N/A",
          humidity: roomData.target_humidity || "N/A",
          image: `/assets/images/room${roomData.room_id}.jpg`,
        }));
        console.log(`Fetched rooms:`, this.rooms);
      } catch (error) {
        console.error("Error fetching room data:", error);
      }
    },
  },
};
</script>
