<script>
import Room from "../components/Room.vue";
import RoomDetail from "../components/RoomDetail.vue";

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
    };
  },
  mounted() {
    this.fetchRoomData();
  },
  methods: {
    async fetchRoomData() {
      try {
        const roomIds = ["room1", "room2", "room3", "room4", "room5"];
        const requests = roomIds.map((id) =>
          fetch(`http://localhost:7071/api/rooms/${id}/sensor-data`)
            .then((response) => response.json())
        );
        const responses = await Promise.all(requests);
        this.rooms = responses.map((data, index) => ({
          number: index + 1,
          roomId: roomIds[index],
          temperature: data.temperature,
          humidity: data.humidity,
        }));
      } catch (error) {
        console.error("Fehler beim Abrufen der Raumdaten:", error);
      }
    },
    goToRoomDetail(roomId) {
      this.roomId = roomId;
      this.showDetail = true; // Anzeige der Detailansicht
    },
  },
};
</script>

<template>
  <div class="room-view">
    <Room
      v-for="room in rooms"
      :key="room.number"
      :number="room.number"
      :temperature="room.temperature"
      :humidity="room.humidity"
      @click="goToRoomDetail(room.roomId)"
    />
    <RoomDetail v-if="showDetail" :roomId="roomId" @close="showDetail = false" />
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
