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
import { roomApi } from "../services/roomApi";

export default {
  name: "RoomView",
  components: {
    Room,
  },
  data() {
    return {
      rooms: [],
      error: null,
      loading: false,
    };
  },
  async created() {
    this.loading = true;
    try {
      this.rooms = await roomApi.getAllRoomsWithSensorData();
    } catch (error) {
      this.error = error.message;
      console.error("Fehler beim Laden der Räume:", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>

<style scoped>
</style>
