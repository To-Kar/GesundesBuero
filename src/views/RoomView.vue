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
      loading: false
    };
  },
  mounted() {
    this.loadRooms();
  },
  methods: {
    async loadRooms() {
      this.loading = true;
      this.error = null;
      try {
        this.rooms = await roomApi.getAllRooms();
      } catch (error) {
        this.error = error.message;
        console.error("Failed to load rooms:", error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.room-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.room-view > * {
  flex: 1 1 calc(50% - 1rem);
  max-width: calc(50% - 1rem);
  box-sizing: border-box;
}
</style>
