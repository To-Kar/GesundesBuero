<script>
export default {
  props: {
    notifications: {
      type: Array,
      required: true
    }
  },
  emits: ['close']
}
</script>

<template>
  <div class="notification-modal" @click="$emit('close')">
    <div class="notification-content" @click.stop>
      <div class="modal-header">
        <h2>Mitteilungszentrale</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div v-for="notification in notifications" 
             :key="notification.id" 
             class="notification-item">
          <p>{{ notification.message }}</p>
          <div class="notification-time">
            {{ new Date(notification.timestamp).toLocaleString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.notification-content {
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.4);
  background-color :hsl(210, 0%, 100%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 10px;
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: black;
}

.close-button {
  background: none;
  border: none;
  color: black;
  font-size: 40px;
  cursor: pointer;
  padding: 5px 10px;
}

.modal-body {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
}

.notification-item {
  padding: 15px;
  border-bottom: 1px solid #575050;
  color: white;
}

.notification-time {
  font-size: 0.8em;
  color: #999;
  margin-top: 5px;
}
</style>