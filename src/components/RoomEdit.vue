<template>
  <div class="details">
    <img :src="roomEdit.image" alt="Raum Layout" class="room-image editable-image" />

    <form @submit.prevent="emitSaveRoom" class="edit-form">
      <div>
        <p class="set-value input-label">
          <span class="soll">Soll-Temperatur: </span>
          <button type="button" @click="adjustTempLocally(-1)">−</button>
          <span class="target">{{ roomEdit.target_temp }}°C</span>
          <button type="button" @click="adjustTempLocally(1)">+</button>
        </p>
      </div>

      <div>
        <p class="set-humid input-label">
          <span class="soll">Soll-Luftfeuchtigkeit: </span>
          <button type="button" @click="adjustHumLocally(-5)">−</button>
          <span class="target">{{ roomEdit.target_humidity }}%</span>
          <button type="button" @click="adjustHumLocally(5)">+</button>
        </p>
      </div>

      <div>
        <label class="input-label">Bild-URL:</label>
        <input type="text" v-model="roomEdit.image" class="input-field" />
      </div>

      <div>
        <label class="input-label">Raum-ID:</label>
        <input type="text" v-model="roomEdit.room_id" class="input-field" :disabled="!isAdding" />
      </div>

      <div>
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
      <button v-if="isEditing" class="delete-button" @click="openDeleteModal">Löschen</button>
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
/* Transition für das Overlay */
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
/* Delete Styles*/
/* Modal-Overlay */
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
/* Modal-Fenster */
.modal {
  background: #fff;
  border-radius: 35px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 400px;
  text-align: center;
  z-index: 1000;
}
/* Modal-Aktionen */
.modal-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
/* Buttons */
.delete-confirm-button {
  background-color: #dc3545;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 35px;
  cursor: pointer;
}
.delete-confirm-button:hover {
  background-color: #c82333;
}
/* Löschen-Button (außerhalb des Modals) */
.delete-button {
  margin-left: 0px;
  margin-top: 15px;
  background-color: #dc3545;
  color: #fff;
  padding: 10px 20px;
  /* Innenabstand */
  border-radius: 35px;
  cursor: pointer;
  font-size: 20px;
}
/*Raum bearbeiten Styles */
.header {
  display: flex;
  /* Flexbox verwenden */
  align-items: center;
  /* Vertikale Zentrierung */
  justify-content: space-between;
  gap: 10px;
  /* Abstand zwischen Überschrift und Buttons */
}

.editable-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
  color: #a3a3a3;
  border: none;
  background: transparent;
  font-family: inherit;
}


.edit-actions {

  right: 60px;
  display: flex;
  gap: 5px;
  /* Abstand zwischen den Buttons */
  align-items: center;
}

.room-title {
  font-size: 35px;

  margin: 0;
  font-weight: bold;
  padding: 1px;
}

.input-label {
  font-size: 170%;

  display: block;
  padding-top: 10px;
  padding-bottom: 15px;
}

.input-field {
  width: 40%;
  padding: 8px;
  border-radius: 15px;
  color: #686868;
  border-width: 1px;
  border-color: #b4b4b4;

  font-size: 20px;
  margin-bottom: 15px;
}

.input-field:focus {
  border-color: #0083bc;
  outline: none;
}


.sensor-ip {
  font-size: 14px;
  color: #686868;
  margin-top: 5px;
}


.edit-button {
  background-color: #0083bc;
  color: #fff;
  padding: 10px 20px;
}

.save-button {
  background-color: #0083bc;
  color: #fff;
  padding: 10px 20px;
}

.cancel-button {
  background-color: #a0a0a0;
  color: #fff;
  border-radius: 35px;
  padding: 10px 20px;
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
/* Bild */
.room-image {
  max-width: 50%;
  max-height: 900px;
  object-fit: contain;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 37px;
}
.temp,
.humid {
  font-size: 180%;
  color: #0083bc;
}
.soll {
  font-size: 140%;
}
/* Buttons */
button {
  margin: 0 10px;
  padding: 1px 7px;
  background-color: #0083bc;
  color: whitesmoke;
  border: none;
  border-radius: 45px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}
button:hover {
  transform: scale(1.1);
}
.room-detail .set-value,
.room-detail .set-humid {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
}
/* Zielwerte */
.room-detail .set-value .target,
.room-detail .set-humid .target {
  font-weight: bold;
  color: #0083bc;
  font-size: 22px;
}
</style>