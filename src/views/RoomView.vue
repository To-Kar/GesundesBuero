<script>
import Room from "../components/Room.vue";
import RoomDetail from "../components/RoomDetail.vue";
import { roomApi } from "../services/roomApi";

export default {
  name: "RoomView",
  components: {
    Room,
    RoomDetail,
  },
  data() {
    return {
      rooms: [],
      showDetail: false,
      roomId: "",
      error: null,
      loading: false,
      temperature: 0,
      humidity: 0,
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
  methods:{
  goToRoomDetail(image, name, roomId, temperature, humidity) {
    console.log("Raum-ID angeklickt:", roomId); // Debugging
    if (!roomId) {
      console.error("Kein roomId übergeben!");
      return;
    }
    this.image = image;
    this.name = name;
    this.roomId = roomId;
    this.temperature = temperature;
    this.humidity = humidity;
    console.log("Details für Raum-ID anzeigen:", this.roomId); // Debugging
    this.showDetail = true; // Anzeige der Detailansicht
  },
}
};
</script>

<template>
  <div class="room-view">
    <Room
      v-for="room in rooms"
      :key="room.number"
      :name="room.name"
      :number="room.number"
      :temperature="room.temperature"
      :humidity="room.humidity"
      :image="room.image"
      :targetTemperature="room.target_temperature" 
      :targetHumidity="room.target_humidity" 
      :status="room.status"
      @click="goToRoomDetail(room.image, room.name, room.number, room.temperature, room.humidity)"
/>
</div>
<div class="room-detail-view">
    <RoomDetail
      v-if="showDetail"
      :image="image"
      :name="name"
      :roomId="roomId"
      :temperature="temperature"
      :humidity="humidity"
      @close="showDetail = false"
/>

  </div>
</template>

<style scoped>
/* Dein vorhandenes CSS */
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
