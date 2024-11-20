<script>
import Room from '../components/Room.vue'

export default {
  name: 'RoomView',
  components: {
    Room
  }
}   
</script>

<template>
  <div class="room-view">
    <Room />
    <Room />
    <Room />
    <Room />
    <Room />
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