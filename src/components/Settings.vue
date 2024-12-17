<script>
import axios from 'axios';

export default {
  name: 'Settings',
  data() {
    return {
      seconds: 0, 
      minutes: 0, 
      showSaveNotification: false, 
      sensors: [],
      rooms: [],
      currentRoom: {
        room_id: '',          // Raum-ID
        name: '',             // Raumname
        sensor_id: '',        // Sensor-ID
        imageURL: '',         // Bildpfad
        target_temp: 22,      // Zieltemperatur
        target_humidity: 50,  // Ziel-Luftfeuchtigkeit
      },
      editMode: false, // Umschalten zwischen Bearbeiten und Hinzufügen

      saveStatus: "", // Status der Speicherung: "success", "error", "loading"
      saveMessage: "", // Die Nachricht für den Benutzer
    };
  },
  async mounted() {
  try {
    // Räume abrufen
    const roomResponse = await axios.get('http://localhost:7071/api/rooms');
    this.rooms = roomResponse.data;

    // Sensor-Daten für IP-Konfiguration
    const sensorResponse = await axios.get('http://localhost:7071/api/sensors');
    this.sensors = sensorResponse.data; // Komplett speichern für IP-Konfiguration

    // Sensor-Daten für Raumzuweisung
    this.availableSensors = sensorResponse.data.map(sensor => ({
      sensorId: sensor.sensor_id, // Nur die ID extrahieren
    }));

    // Intervall abrufen
    const response = await axios.get('http://localhost:7071/api/settings');
    const { update_interval } = response.data;

    this.minutes = Math.floor(update_interval / 60);
    this.seconds = update_interval % 60;


  } catch (error) {
    console.error('Fehler beim Abrufen der Daten:', error.message || error);
  }
  // Räume abrufen
  await this.fetchRooms();
},

  methods: {
    
    // Methoden zur Intervalleinstellung
    async saveSettings() {
      const totalInterval = Math.floor(this.minutes * 60 + this.seconds);

      try {
        // Backend-PATCH-Request, um das Intervall zu speichern
        await axios.patch('http://localhost:7071/api/settings/interval', {
          update_interval: totalInterval
        });

        console.log(`Einstellungen gespeichert: ${this.minutes} Minuten, ${this.seconds} Sekunden`);


        this.showSaveNotification = true;


        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } catch (error) {
        console.error('Fehler beim Speichern der Einstellungen:', error);
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
    
    // Methoden zur IP-Einstellung

    validateIp(ip) {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        
        return ipRegex.test(ip);
       
    },
    async saveIpAddress(sensor) {
      console.log('Sende Daten an API:', {
          sensor_id: sensor.sensor_id,
          ip_address: sensor.ip_address
      });
      if (!this.validateIp(sensor.ip_address)) {
       
        this.showErrorNotification = true;
        setTimeout(() => {
          this.showErrorNotification = false;
        }, 3000);
          return;
      }

      try {
          await axios.patch('http://localhost:7071/api/sensors/{sensor_id}/ip', {
              sensor_id: sensor.sensor_id,
              ip_address: sensor.ip_address
          });
         

          this.showSaveNotification = true;


        setTimeout(() => {
          this.showSaveNotification = false;
        }, 3000);
      } catch (error) {
          console.error('Fehler beim Speichern der IP-Adresse:', error);
      }
    },

    // Methoden zur Raumverwaltung
    
    async fetchRooms(roomId = null) {
      const url = "http://localhost:7071/api/rooms"; // Abruf aller Räume

      try {
        const response = await axios.get(url);
        this.rooms = roomId ? [response.data] : response.data;
      } catch (error) {
        console.error("Fehler beim Abrufen der Räume:", error);
      }
    },

    // Raum bearbeiten
    editRoom(room) {
      this.currentRoom = { ...room }; // Daten des aktuellen Raums setzen
      this.editMode = true; // Bearbeitungsmodus aktivieren
    },

    // Raum hinzufügen oder bearbeiten
    async saveRoom() {
      try {
        if (this.editMode) {
          // Raum bearbeiten
          await axios.patch(`http://localhost:7071/api/rooms/${this.currentRoom.room_id}`, this.currentRoom);
          const index = this.rooms.findIndex((r) => r.room_id === this.currentRoom.room_id);
          if (index !== -1) {
            this.rooms[index] = { ...this.currentRoom };
          }
        } else {
          // Neuen Raum hinzufügen
          const response = await axios.post('http://localhost:7071/api/rooms', this.currentRoom);
          this.rooms.push(response.data);
        }

        this.resetForm();
      } catch (error) {
        console.error('Fehler beim Speichern des Raums:', error);
      }
    },

    // Formular zurücksetzen
    resetForm() {
      this.currentRoom = {
        room_id: '',
        name: '',
        sensor_id: '',
        imageURL: '',
        target_temp: 22,
        target_humidity: 50,
      };
      this.editMode = false;
    },

    async adjustTarget(room, type, change) {
      // Aktualisierung der Zielwerte lokal
      if (type === 'temperature') {
        room.target_temp = Math.max(10, Math.min(room.target_temp + change, 30));
      } else if (type === 'humidity') {
        room.target_humidity = Math.max(0, Math.min(room.target_humidity + change, 100));
      }

      room.updating = true; // Button deaktivieren während des Updates
      try {
        const payload = {
          target_temp: room.target_temp,
          target_humidity: room.target_humidity,
        };
        await axios.patch(`http://localhost:7071/api/rooms/${room.room_id}/targets`, payload);
      } catch (error) {
        console.error('Fehler beim Aktualisieren der Zielwerte:', error);
      } finally {
        room.updating = false; // Button wieder aktivieren
      }
    },

  },
  
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
                <input
                  type="number"
                  :value="minutes"
                  @input="updateMinutes"
                  min="0"
                  max="60"
                  class="interval-display"
                />
              </div>
              <div class="input-group">
                <p class="input-label">Sekunden</p>
                <input
                  type="number"
                  :value="seconds"
                  @input="updateSeconds"
                  min="0"
                  max="59"
                  class="interval-display"
                /> 
              </div>
              <button class="save-button  button-container" @click="saveSettings">Speichern</button>
            </div>
           
          </div>
        </div>

        <div class="settings-section">
          <p class="section-title">IP-Konfiguration</p>
          <div class="sensor-settings">
            <div
              v-for="sensor in sensors"
              :key="sensor.sensor_id"
              class="sensor-settings-item"
            >
              <p class="sensor-title">
                {{ sensor.sensor_id }}
              </p>
              <p class="sensor-info">Zugeordneter Raum: {{ sensor.room_id }}</p>
              <p class="sensor-info">Device ID: {{ sensor.sensor_id }}</p>
              <div class="sensor-field-row">
                <label class="input-label">IP-Adresse:</label>
                <input type="text" v-model="sensor.ip_address" class="ip-input" />
                <button class="save-button" @click="saveIpAddress(sensor)">Speichern</button>
              </div>
            </div>
          </div>
          
        </div>

   
        <div class="settings-section">
    <h3 v-if="editMode">Raum bearbeiten</h3>
    <h3 v-else>Neuen Raum hinzufügen</h3>

    <div class="room-form">
      <label>
        Raum-ID:
        <input v-model="currentRoom.room_id" type="text" :disabled="editMode" placeholder="Raum-ID" />
      </label>
      <label>
        Raumname:
        <input v-model="currentRoom.name" type="text" placeholder="Raumname" />
      </label>
      <label>
        Sensor-ID:
        <select v-model="currentRoom.sensor_id">
          <option v-for="sensor in availableSensors" :key="sensor.sensorId" :value="sensor.sensorId">
            {{ sensor.sensorId }}
          </option>
        </select>
      </label>
      <label>
        Bildpfad:
        <input v-model="currentRoom.imageURL" type="text" placeholder="https://static5.depositphotos.com/1010050/513/i/450/depositphotos_5135344-stock-photo-modern-office.jpg" />
      </label>
      <label>
        Zieltemperatur:
        <input v-model.number="currentRoom.target_temp" type="number" min="10" max="30" />
      </label>
      <label>
        Ziel-Luftfeuchtigkeit:
        <input v-model.number="currentRoom.target_humidity" type="number" min="0" max="100" />
      </label>
      <button @click="saveRoom">{{ editMode ? 'Änderungen speichern' : 'Raum hinzufügen' }}</button>
      <button @click="resetForm">Abbrechen</button>
    </div>


  </div>
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
  z-index: 1003;
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

/* Settings IP */
.sensor-settings-container {
  margin-top: 20px;
}

.sensor-settings-item {
  border: 1px solid #ccc;
  border-radius: 25px;
  padding: 20px;
  background-color: #f9f9f9;
  margin-bottom: 15px;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.sensor-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.sensor-info {
  font-size: 14px;
  color: #555;
}

.sensor-field-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ip-input {
  width: 100%;
  max-width: 150px;
  padding: 8px;
  font-size: 14px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

/*Raumverwaltung*/
.room-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.room-settings-item {
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 0.5rem;
}
.room-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-top: 0.5rem;
}

.adjust-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}
button:hover {
  background-color: #0056b3;
}
button:disabled {
  background-color: #ccc;
  color: #666;
  cursor: not-allowed;
}

.room-form {
  margin-bottom: 20px;
}
.room-form label {
  display: block;
  margin-bottom: 10px;
}
.room-form input,
.room-form select {
  margin-left: 10px;
}
.room-list {
  list-style: none;
  padding: 0;
}
.room-list li {
  margin-bottom: 10px;
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
