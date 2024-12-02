<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="room-detail">
      <h1>Details für  {{ roomId }}</h1>
      <p>Temperatur: {{ roomData.temperature }}°C</p>
      <p>Luftfeuchtigkeit: {{ roomData.humidity }}%</p>
      <button @click="goBack">Zurück</button>
    </div>
  </transition>
</template>

<script>
export default {
  name: "RoomDetail",
  props: {
    roomId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      roomData: {
        temperature: 0,
        humidity: 0,
      },
      isVisible: false,
    };
  },
  methods: {
    async fetchRoomDetails() {
      try {
        const response = await fetch(
          `http://localhost:7071/api/rooms/${this.roomId}/sensor-data`
        );
        this.roomData = await response.json();
      } catch (error) {
        console.error("Fehler beim Abrufen der Raumdetails:", error);
      }
    },
    goBack() {
      this.isVisible = false; // Slider schließt sich
      this.$emit("close"); // Emit to close detail view in RoomView
    },
  },
  mounted() {
    this.fetchRoomDetails();
    this.isVisible = true; // Detailansicht wird angezeigt
  },
};
</script>

<style scoped>
.room-detail {
  position: fixed;
  bottom: 0;
  left: 50%; /* Zentriert den Slider horizontal */
  transform: translateX(-50%); /* Verschiebt den Slider um die Hälfte seiner Breite nach links */
  width: 100%;
  height: 70%;
  background-color: whitesmoke;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  z-index: 100;
  overflow-y: auto;
}





button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 45px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
  transition: 0.5s;
}

</style>
