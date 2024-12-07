<script>
export default {
  props: {
    notifications: {
      type: Array,
      required: true
    }
  },
  emits: ['close'],
  methods: {
    formatDate(timestamp) {
      try {
        return new Date(timestamp).toLocaleString('de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error('Date formatting error:', error);
        return 'Ungültiges Datum';
      }
    }
  }
}
</script>

<template>
  <div class="notification-modal" @click="$emit('close')">
    <div class="notification-content" @click.stop>
      <div class="modal-header">
        <h2>Mitteilungen</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div v-for="notification in notifications"
             :key="notification.notification_id"
             class="notification-item">
          <div class="notification-header">
            <span class="notification-type">{{ notification.type }}</span>
            <span class="notification-time">{{ formatDate(notification.timestamp) }}</span>
          </div>
          <p class="notification-message">{{ notification.description }}</p>
          <div class="notification-details">
            <small>Raum: {{ notification.room_id }}</small>
            <small>Sensor: {{ notification.sensor_id }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
 font-family: 'BDOGrotesk', system-ui, sans-serif;
}

.notification-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1002;
}

.notification-content {
  background-color: hsl(210, 0%, 100%);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 30px;
  padding: 24px 24px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 12px;
  position: relative;
}

.modal-header h2 {
  font-size: 32px;
  line-height: 38.4px;
  margin: 0;
  letter-spacing: -0.68px;
  font-weight: 700;
  color: black;
}

.close-button {
  position: absolute;
  right: 0;
  line-height: 38.4px;
  background: none;
  border: none;
  color: hsl(210, 0%, 0%);
  font-size: 45px;
  font-weight: 200;
  cursor: pointer;
}

.modal-body {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  border-radius: 30px;
  border: 1px solid hsl(210, 0%, 80%);
}

.notification-item {
  border-bottom: 1px solid hsl(210, 0%, 80%);
  color: black;
  font-size: 18px;
  line-height: 25.2px;
  letter-spacing: 0.009em;
  margin: 0;
  padding: 12px 24px;
}
.notification-item:last-child {
 border-bottom: none;
}
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-type {
  font-weight: 700;
}

.notification-time {
  font-weight: 400;
  color: hsl(210, 0%, 60%);
}

.notification-message {
  font-weight: 400;
  margin: 0;
}

.notification-details {
  font-weight: 400;
  display: flex;
  gap: 24px;
  color: hsl(210, 0%, 60%);
}
</style>