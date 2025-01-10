<template>
  <img :src="roomEdit.image" alt="Raum Layout" class="room-image editable-image" />
  <div class="details">
    <form @submit.prevent="emitSaveRoom" class="edit-form">
      <div class="input-div">
        <p>
          <span class="input-label">Soll-Temperatur: </span>
          <button type="button" @click="adjustTempLocally(-1)">−</button>
          <span class="target">{{ roomEdit.target_temp }}°C</span>
          <button type="button" @click="adjustTempLocally(1)">+</button>
        </p>
      </div>

      <div class="input-div">
        <p>
          <span class="input-label">Soll-Luftfeuchtigkeit: </span>
          <button type="button" @click="adjustHumLocally(-5)">−</button>
          <span class="target">{{ roomEdit.target_humidity }}%</span>
          <button type="button" @click="adjustHumLocally(5)">+</button>
        </p>
      </div>

      <div class="input-div">
        <label class="input-label">Bild-URL:</label>
        <input type="text" v-model="roomEdit.image" class="input-field" />
      </div>

      <div class="input-div">
        <label class="input-label">Raum-ID:</label>
        <input type="text" v-model="roomEdit.room_id" class="input-field" :disabled="!isAdding" />
      </div>

      <div class="input-div">
        <label class="input-label">Sensor-ID:</label>
        <select v-model="roomEdit.sensor_id" class="input-field" @change="handleSensorChange">
          <option value="">Kein Sensor</option>
          <option v-for="sensor in availableSensors" :key="sensor.sensor_id" :value="sensor.sensor_id">
            {{ sensor.sensor_id }}
            <span v-if="sensor.room_id"> ({{ sensor.room_id }} zugewiesen)</span>
          </option>
        </select>

        <p v-if="roomEdit.sensor_id" class="input-label">
          IP-Adresse: {{ getSensorIpAddress(roomEdit.sensor_id) }}
        </p>
      </div>
    </form>

    <!-- Delete-Button -->
    <div class="delete-section">
      <button v-if="isEditing &&! isAdding" class="delete-button" @click="openDeleteModal">Löschen</button>
    </div>

    <!-- Modal für Löschen Bestätigung -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="overlay" @click="closeDeleteModal"></div>
      <div class="modal">
        <h3>Möchtest du diesen Raum wirklich löschen?</h3>
        <div class="modal-actions">
          <button class="delete-confirm-button" @click="confirmDelete">Löschen</button>
          <button class="cancel-button" @click="closeDeleteModal">Abbrechen</button>
        </div>
      </div>
    </div>

    <!-- Modal für Sensorwechsel -->
    <div v-if="showConfirmSwap" class="modal-overlay">
      <div class="overlay" @click="closeSwapModal"></div>
      <div class="modal">
        <h3>Dieser Sensor ist bereits einem anderen Raum zugewiesen.</h3>
        <p>Möchtest du den Sensor dem aktuellen Raum zuweisen und aus dem anderen Raum entfernen?</p>
        <div class="modal-actions">
          <button @click="confirmSensorSwap">Bestätigen</button>
          <button class="cancel-button" @click="closeSwapModal">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RoomEdit",
  props: {
    isEditing: Boolean,
    isAdding: Boolean,
    roomEdit: {
      type: Object,
      required: true
    },
    availableSensors: {
      type: Array,
      default: () => []
    },
    showDeleteModal: {
      type: Boolean,
      default: false
    },
    showConfirmSwap: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    adjustTempLocally(change) {
      let newTemp = this.roomEdit.target_temp + change;
      newTemp = Math.max(10, Math.min(newTemp, 30));
      this.roomEdit.target_temp = newTemp;
    },
    adjustHumLocally(change) {
      let newHum = this.roomEdit.target_humidity + change;
      newHum = Math.max(0, Math.min(newHum, 100));
      this.roomEdit.target_humidity = newHum;
    },
    // Speichern
    emitSaveRoom() {
      this.$emit("save-room");
    },
    // Sensor-Wechsel
    handleSensorChange() {
      if (!this.roomEdit.sensor_id) {
        this.$emit("update:currentSensorId", null);
      } else {
        this.$emit("check-sensor", this.roomEdit.sensor_id);
      }
    },
    // Delete-Modal
    openDeleteModal() {
      this.$emit("open-delete-modal");
    },
    closeDeleteModal() {
      this.$emit("close-delete-modal");
    },
    confirmDelete() {
      this.$emit("confirm-delete");
    },
    // Sensor-Swap
    closeSwapModal() {
      this.$emit("close-swap-modal");
    },
    confirmSensorSwap() {
      this.$emit("confirm-sensor-swap");
    },
    // Hilfsfunktion
    getSensorIpAddress(sensorId) {
      const sensor = this.availableSensors.find(s => s.sensor_id === sensorId);
      return sensor ? sensor.ip_address : 'Nicht verfügbar';
    }
  }
};
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 2px 4px 12px #00000014;
  width: 90%;
  max-width: 400px;
  text-align: center;
  z-index: 1000;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* Transition Styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 99;
}

/* Custom Styles */
.input-field:focus {
  border-color: hsl(210, 80%, 60%);
  outline: none;
}

.details {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.room-image {
  width: 500px;
  height: 340px;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: 2px 4px 12px #00000014;
  margin-right: 24px;
}

button {
  margin: 12px;
  background-color: hsl(210, 80%, 60%);
  color: whitesmoke;
  border:none;
  border-radius: 50px;
  padding: 0px 24px;
  font-size: 22px;
  line-height: 25.2px;
  letter-spacing: 0.009em;
  font-weight: 700;
  transition: all .3s cubic-bezier(0, 0, .5, 1);
}

button:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}
.cancel-button {
  background-color: #a0a0a0;
}

.input-label {
  font-size: 26px;
  line-height: 30.8px;   
  font-weight: 400;       
  color: black; 
  display: block;
}
.delete-button {
  background-color: #cc443c;
  color: #fff;
  padding: 10px 20px;
  font-size: 18px;
  line-height: 25.2px;
  letter-spacing: 0.009em;
  font-weight: 400;
}
.input-field {
  width: 40%;
  border-radius: 18px;
  color: #686868;
  border: 1px solid #b4b4b4;
  font-size: 26px;
  line-height: 30.8px;   
  font-weight: 400;
}
.input-div{
  display: flex;
  align-items: center;
}
.edit-form{
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  position: relative;
}

@media screen and (max-width: 920px) {
  .details {
    flex-direction: column;
    align-items: center;
    gap: 30px;
    width: 100%;
  }
  
  .room-image {
    max-width: 340px;
    width: 100%;
    height: 200px;
    margin-right: 0;
  }
}
</style>