<script>
import { eventBus } from '../plugins/eventBus';
import { settingsService } from '../services/settingsService';
import { sensorService } from '../services/sensorService';
import DeleteModal from '../components/DeleteModal.vue';
import SensorList from '../components/SensorList.vue';
export default {
  name: 'Settings',
  components: { DeleteModal, SensorList },
  data() {
    return {
      showDeleteModal: false,
      selectedSensor: null,
      newSensor: {
        sensor_id: '',
        ip_address: ''
      },
      seconds: 0,
      minutes: 0,
      temperatureOffset: 0,
      humidityOffset: 0,
      showSaveNotification: false,
      showErrorNotification: false,
      sensors: [],
    };
  },
  async mounted() {
    try {
      const settings = await settingsService.getSettings();
      const { update_interval } = settings;

      this.minutes = Math.floor(update_interval / 60);
      this.seconds = update_interval % 60;

      const sensors = await settingsService.getSensors();
      this.sensors = sensors;

      const offsets = await settingsService.getOffsets();
      this.temperatureOffset = offsets.temperature_offset;
      this.humidityOffset = offsets.humidity_offset;
    } catch (error) {
      console.error('Fehler beim Abrufen der Daten:', error.message || error);
    }
  },


  methods: {
    openDeleteModal(sensor) {
      this.selectedSensor = sensor;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      try {
        await sensorService.deleteSensor(this.selectedSensor.sensor_id);
        this.sensors = this.sensors.filter(s => s.sensor_id !== this.selectedSensor.sensor_id);
        this.showDeleteModal = false;
        console.log(`Sensor ${this.selectedSensor.sensor_id} erfolgreich gelöscht.`);
      } catch (error) {
        console.error('Fehler beim Löschen des Sensors:', error);
      }
    },
    async saveSettings() {
      const totalInterval = Math.floor(this.minutes * 60 + this.seconds);

      try {
        await settingsService.updateSettings({ update_interval: totalInterval });

        console.log(`Einstellungen gespeichert: ${this.minutes} Minuten, ${this.seconds} Sekunden`);

        this.showSaveNotification = true;

        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } catch (error) {
        console.error('Fehler beim Speichern der Einstellungen:', error);
      }
    },

    async saveOffsets() {
      try {
        await settingsService.updateOffsets({
          temperature_offset: this.temperatureOffset,
          humidity_offset: this.humidityOffset,
        });

        console.log("Offsets erfolgreich gespeichert.");

        this.showSaveNotification = true;

        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } catch (error) {
        console.error("Fehler beim Speichern der Offsets:", error);
      }
    },

    validateIp(ip) {
      const ipRegex = /^(?!0\d)(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)\.(?!0\d)(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)\.(?!0\d)(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)\.(?!0\d)(25[0-5]|2[0-4][0-9]|1\d{2}|[1-9]?\d)$/;
      return ipRegex.test(ip);

    },

    async saveIpAddress(sensor) {
      console.log('Sende Daten an API:', {
        sensor_id: sensor.sensor_id,
        ip_address: sensor.ip_address
      });
      if (!this.validateIp(sensor.ip_address)) {
        console.log('IP nicht valid:', this);
        this.showErrorNotification = true;
        setTimeout(() => {
          this.showErrorNotification = false;
        }, 3000);
        return;
      }
      try {
        await sensorService.updateSensorIp(sensor);

        this.showSaveNotification = true;
        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } catch (error) {
        console.error('Fehler beim Speichern der IP-Adresse:', error);
      }
    },

    updateSeconds(event) {
      const value = parseInt(event.target.value.trim());
      if (!isNaN(value) && value >= 0 && value <= 59) {
        this.seconds = value;
      } else {
        event.target.value = this.seconds;
      }
    },
    updateMinutes(event) {
      const value = parseInt(event.target.value.trim());
      if (!isNaN(value) && value >= 0 && value <= 60) {
        this.minutes = value;
      } else {
        event.target.value = this.minutes;
      }
    },
    addRoom() {
      eventBus.emit('add-room');
      this.$emit('close');
    },


    async addSensorFromList(newSensor) {
      if (!newSensor.sensor_id || !this.validateIp(newSensor.ip_address)) {
        this.showErrorNotification = true;
        setTimeout(() => (this.showErrorNotification = false), 3000);
        return;
      }

      try {
        const addedSensor = await sensorService.addSensor(newSensor);

        this.sensors.push({
          sensor_id: addedSensor.sensor_id,
          ip_address: addedSensor.ip_address || newSensor.ip_address,
          room_id: addedSensor.room_id || 'N/A'
        });

        this.showSaveNotification = true;

        setTimeout(() => (this.showSaveNotification = false), 3000);
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Sensors:', error);
        this.showErrorNotification = true;
        setTimeout(() => (this.showErrorNotification = false), 3000);
      }
    },

  }
};

</script>
<template>
  <div class="settings-modal" @click="$emit('close')">
    <div class="settings-content" @click.stop>
      <div class="modal-header">
        <h2>Einstellungen</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">

        <div class="settings-section">
          <p class="section-title">Intervall-Einstellung</p>
          <div class="settings-item">
            <div class="interval-input-container">
              <div class="input-group">
                <p class="input-label">Minuten</p>
                <input type="number" :value="minutes" @input="updateMinutes" min="0" max="60"
                  class="interval-display" />
              </div>
              <div class="input-group">
                <p class="input-label">Sekunden</p>
                <input type="number" :value="seconds" @input="updateSeconds" min="0" max="59"
                  class="interval-display" />
              </div>
              <button class="save-button  button-container" @click="saveSettings">Speichern</button>
            </div>
          </div>
          <div class="settings-section">
            <p class="section-title">Offset-Einstellungen</p>
            <div class="offset-settings offset-box">
              <div class="offset-item">
                <label class="offset-label">Offset für Temperatur:</label>
                <div class="input-wrapper">
                  <input type="number" v-model="temperatureOffset" min="-100" max="100" class="interval-display" />
                  <span class="unit">°C</span>
                </div>
              </div>
              <div class="offset-item">
                <label class="offset-label">Offset für Luftfeuchtigkeit:</label>
                <div class="input-wrapper">
                  <input type="number" v-model="humidityOffset" min="-100" max="100" class="interval-display" />
                  <span class="unit">%</span>
                </div>
                <button class="save-button" @click="saveOffsets">Speichern</button>
              </div>
            </div>
          </div>
          <div class="settings-section">
            <p class="section-title">Raum hinzufügen</p>
            <div class="sensor-settings-item">
              <div class="raum-settings">
                <label class="offset-label">Einen neuen Raum anlegen:</label>
                <button class="save-button" @click="addRoom">hinzufügen</button>
              </div>
            </div>
          </div>
        </div>
        <div class="settings-section">
          <p class="section-title">Sensorverwaltung</p>
          <SensorList :sensors="sensors" @save-ip="saveIpAddress" @open-delete="openDeleteModal"
            @add-sensor="addSensorFromList" />
        </div>
        <DeleteModal :visible="showDeleteModal" :title="'Sensor löschen'"
          :message="`Möchten Sie den Sensor ${selectedSensor?.sensor_id} wirklich löschen?`" @confirm="confirmDelete"
          @cancel="showDeleteModal = false" />
        <div v-if="showSaveNotification" class="save-notification">
          Einstellungen erfolgreich gespeichert!
        </div>
        <div v-if="showErrorNotification" class="error-notification">
          Falscher Eingabewert!
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
* {
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}

body {
  overflow: hidden;
}

.raum-settings {
  display: flex;
  justify-content: space-between;
  /* Abstand zwischen Label und Button */
  align-items: center;
  /* Vertikal ausrichten */
  width: 100%;
}

.settings-modal {
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

.settings-content {
  background-color: hsl(210, 0%, 100%);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  border-radius: 30px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding-bottom: 12px;
}

.modal-header h2 {
  font-size: 28px;
  line-height: 36px;
  margin: 0;
  letter-spacing: -0.5px;
  font-weight: 700;
  color: black;
}

.close-button {
  background: none;
  border: none;
  color: black;
  font-size: 28px;
  font-weight: 700;
  cursor: pointer;
}

.modal-body {
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  border-radius: 30px;
  border: 1px solid hsl(0, 0%, 100%);
  padding: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 12px;
}

.settings-item,
.sensor-settings-item {
  border: 1px solid #ccc;
  border-radius: 25px;
  padding: 20px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.save-button {
  align-self: center;
  padding: 8px 16px;
  font-size: 14px;
  background-color: hsl(210, 80%, 60%);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  margin-left: auto;
}



.save-button:hover {
  background-color: hsl(210, 70%, 50%);
}

.button-container {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  height: 100%;
  margin-top: 46px;
}

.save-notification {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: hsl(120, 70%, 40%);
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1003;
  animation: fadeInOut 3s ease-in-out;
}

.error-notification {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: hsl(20, 100%, 44%);
  color: white;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1500;
  animation: fadeInOut 3s ease-in-out;
}

/* Settings Intervall */
.interval-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-left: 24px;
}

.interval-input-container {
  display: flex;
  justify-content: space-around;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.input-label {
  font-size: 16px;
  font-weight: 500;
  color: black;
  margin-bottom: 8px;
}

.interval-display {
  width: 100px;
  text-align: center;
  border: 1px solid hsl(210, 0%, 60%);
  font-size: 18px;
  outline: none;
  color: black;
}



.sensor-field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.offset-settings {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 25px;
  background-color: #f9f9f9;
  position: relative;
}

.offset-items {
  display: flex;
  gap: 20px;
  align-items: center;
}

.offset-item {
  display: flex;
  align-items: center;
}

.offset-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-right: 15px;
}


.save-button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-offset-button {
  padding: 10px 20px;
  background-color: hsl(120, 60%, 50%);
  border: none;
  color: white;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-offset-button:hover {
  background-color: hsl(120, 50%, 40%);
}

@keyframes fadeInOut {
  0% {
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
