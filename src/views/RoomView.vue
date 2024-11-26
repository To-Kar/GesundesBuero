<script>
import Room from "../components/Room.vue";

export default {
  name: "RoomView",
  components: {
    Room,
  },
  data() {
    return {
      rooms: [
        { number: 1, temperature: 19, humidity: 43 },
        { number: 2, temperature: 22, humidity: 45 },
        { number: 3, temperature: 25, humidity: 65 },
        { number: 4, temperature: 18, humidity: 50 },
        { number: 5, temperature: 23, humidity: 35 },
      ],
    };
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
    />
  </div>
</template>

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
