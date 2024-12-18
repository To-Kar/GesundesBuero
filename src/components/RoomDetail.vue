<template>
  <div>
    <transition name="fade">
      <div v-if="isVisible" class="overlay" @click="goBack"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="isVisible" class="room-detail">
        

        <div class="header">
          <template v-if="isEditing">
            <!-- Bearbeitbare Überschrift -->
            <input 
              class="room-title editable-title" 
              type="text" 
              v-model="roomEdit.name" 
              placeholder="Raumname eingeben"
            />
          </template>
          <template v-else>
            <h1 class="room-title" >{{ currentName }}</h1>
          </template>

          <!-- Bearbeitungsknöpfe -->
          <div class="edit-actions">
            <template v-if="isAdding">
              <!-- Raum hinzufügen Button -->
              <button class="save-button" @click="saveRoom">Raum hinzufügen</button>
            </template>
            <template v-else>
              <button class="cancel-button" v-if="isEditing" @click="cancelEdit">Verwerfen</button>
              <button class="save-button" v-if="isEditing" @click="saveRoom">Speichern</button>
              <button class="edit-button" v-else @click="toggleEditMode">Bearbeiten</button>
            </template>
            <button  class="back-button" @click="goBack">X</button>
          </div>
        </div>


        <div class="content">
          <template v-if="!isEditing">
            <!-- Normale Ansicht -->
            <img :src="currentImage" alt="Raum Layout" class="room-image" />
            <div class="details">
              <p class="temp">Temperatur: {{ temperature }}°C</p>
              <p class="set-temp">
                <span class="soll">Solltemperatur: </span>
                <button @click="adjustTargetTemperature(-1)" :disabled="disableTemperatureButtons">−</button>
                <span class="target">{{ targetTemperature }}°C</span>
                <button @click="adjustTargetTemperature(1)" :disabled="disableTemperatureButtons">+</button>
              </p>
              <p class="graph">
                <span
                  class="graph-bar"
                  :style="{ backgroundColor: temperatureColor, width: `${temperatureWidth}%` }"
                ></span>
              </p>
              <p class="humid">Luftfeuchtigkeit: {{ humidity }}%</p>
              <p class="set-humid">
                <span class="soll">Soll-Luftfeuchtigkeit: </span>
                <button @click="adjustTargetHumidity(-5)" :disabled="disableHumidityButtons">−</button>
                <span class="target">{{ targetHumidity }}%</span>
                <button @click="adjustTargetHumidity(5)" :disabled="disableHumidityButtons">+</button>
              </p>
              <p class="graph">
                <span
                  class="graph-bar"
                  :style="{ backgroundColor: humidityColor, width: `${targetHumidity}%` }"
                ></span>
              </p>
            </div>
          </template>

          <template v-else>
            <!-- Bearbeitungsmodus -->
            <img :src="roomEdit.image" alt="Raum Layout" class="room-image editable-image" />
            <div class="details"> 
             
              
              <form @submit.prevent="saveRoom" class="edit-form">
                <div>
                  <p class="set-temp input-label">
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
                  <input 
                      type="text" 
                      v-model="roomEdit.room_id" 
                      class="input-field" 
                      :disabled="!isAdding" 
                  />
              </div>
                <div>
                  <label class="input-label">Sensor-ID:</label>
                  <select v-model="roomEdit.sensor_id" class="input-field" @change="handleSensorChange">
                    <option value="">Kein Sensor</option>
                    <option 
                      v-for="sensor in availableSensors" 
                      :key="sensor.sensor_id" 
                      :value="sensor.sensor_id">
                      {{ sensor.sensor_id }}
                      <span v-if="sensor.room_id"> ({{ sensor.room_id }} zugewiesen)</span>
                    </option>
                  </select>

                  <p v-if="roomEdit.sensor_id" class="input-label">
                    IP-Adresse: {{ getSensorIpAddress(roomEdit.sensor_id) }}
                  </p>
                </div>
              </form>

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
            </div>
          </template>
        </div>
        <!-- Modal für Sensorwechsel Bestätigung -->
        <div v-if="showConfirmSwap" class="modal-overlay">
          <div class="overlay" @click="closeDeleteModal"></div>
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
    </transition>
  </div>
</template>

<script>
import { roomApi } from "../services/roomService";
import { sensorApi } from '../services/sensorService';


export default {
  props: {

    isAdding: {
    type: Boolean,
    default: false,
    },
    image: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: "Büroraum",
    },
    roomId: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    humidity: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isVisible: false,
      targetTemperature: null, // Wird dynamisch geladen
      targetHumidity: null, // Wird dynamisch geladen
      debounceTimeout: null,
      disableTemperatureButtons: false,
      disableHumidityButtons: false,

      isEditing: false, // Bearbeitungsstatus
      
      roomEdit: {
        name: this.isAdding ? "Neuer Büroraum" : this.name,
        room_id: this.isAdding ? "" : this.roomId,
        sensor_id: null,
        image: this.isAdding
          ? "https://static5.depositphotos.com/1010050/513/i/450/depositphotos_5135344-stock-photo-modern-office.jpg"
          : this.image,
        target_temp: this.temperature,
        target_humidity: this.humidity,
      }, // Raumdaten für Bearbeitung
      
      currentSensorId: null, //Sensordaten für den aktuellen Sensor notwendig für direktes aktualisieren
      currentName: this.name,
      currentImage: this.image,
      availableSensors: [], // Verfügbare Sensoren für Dropdown
      showConfirmSwap: false, // notwendig zur Überprüfung ob Sensor getauscht wurde

      showDeleteModal: false, // Bestätigungsfenster für Delete ausblenden
      saveStatus: "", // Status der Speicherung
      saveMessage: "", // Die Nachricht für den Benutzer

    };
  },
  computed: {
    temperatureColor() {
      const minTemp = 10; // Minimaltemperatur
      const maxTemp = 30; // Maximaltemperatur
      const percent = Math.min(Math.max((this.targetTemperature - minTemp) / (maxTemp - minTemp), 0), 1);

      const r = percent < 0.5
        ? Math.round(0 + percent * 2 * 0) // Blau → Grün
        : Math.round(255 * (percent - 0.5) * 2); // Grün → Rot

      const g = percent < 0.5
        ? Math.round(255 * percent * 2) // Blau → Grün
        : Math.round(255 - (percent - 0.5) * 2 * 255); // Grün → Rot

      const b = percent < 0.5
        ? Math.round(255 - percent * 2 * 255) // Blau → Grün
        : 0; // Grün → Rot

      return `rgb(${r}, ${g}, ${b})`;
    },
    temperatureWidth() {
      const minTemp = 10;
      const maxTemp = 30;
      return Math.min(Math.max(((this.targetTemperature - minTemp) / (maxTemp - minTemp)) * 100, 0), 100);
    },
    humidityColor() {
      const minHumid = 0; // Minimale Luftfeuchtigkeit
      const maxHumid = 100; // Maximale Luftfeuchtigkeit
      const percent = Math.min(Math.max(this.targetHumidity / maxHumid, 0), 1);

      const r = Math.round(192 * (1 - percent)); // Grau → Blau → Dunkelblau
      const g = Math.round(192 * (1 - percent)); // Grau → Blau → Dunkelblau
      const b = Math.round(255 * percent); // Grau → Blau → Dunkelblau

      return `rgb(${r}, ${g}, ${b})`;
    },
  },
  methods: {
  async fetchRoomDetails() {
    try {
      const room = await roomApi.getRoomById(this.roomId);
      this.targetTemperature = room.target_temperature;
      this.targetHumidity = room.target_humidity;

      this.currentSensorId = room.sensor_id; 
      this.currentName = room.name;
      this.currentImage = room.image;

    } catch (error) {
      console.error("Fehler beim Abrufen der Raumdaten:", error);
    }
  },
  adjustTargetTemperature(change) {
    if (this.disableTemperatureButtons) return;

    this.targetTemperature += change;
    this.targetTemperature = Math.max(10, Math.min(this.targetTemperature, 30));

    this.disableHumidityButtons = true; // Feuchtigkeits-Buttons deaktivieren

    if (this.debounceTimeoutTemp) {
      clearTimeout(this.debounceTimeoutTemp);
    }

    this.debounceTimeoutTemp = setTimeout(() => {
      this.updateTarget("target_temp", this.targetTemperature);
      this.disableHumidityButtons = false; // Feuchtigkeits-Buttons wieder aktivieren
    }, 1500);
  },
  adjustTargetHumidity(change) {
    if (this.disableHumidityButtons) return;

    this.targetHumidity += change;
    this.targetHumidity = Math.max(0, Math.min(this.targetHumidity, 100));

    this.disableTemperatureButtons = true; // Temperatur-Buttons deaktivieren

    if (this.debounceTimeoutHumidity) {
      clearTimeout(this.debounceTimeoutHumidity);
    }

    this.debounceTimeoutHumidity = setTimeout(() => {
      this.updateTarget("target_humidity", this.targetHumidity);
      this.disableTemperatureButtons = false; // Temperatur-Buttons wieder aktivieren
    }, 1500);
  },
  async updateTarget(type, value) {
    try {
      const settings = { [type]: value };
      await roomApi.updateRoomSettings(this.roomId, settings);
    } catch (error) {
      console.error(`Fehler beim Speichern des Sollwerts für ${type}:`, error);
    }
  },
  goBack() {
    this.isVisible = false;
    this.$emit("close");
  },

  //Raumverwaltung
  toggleEditMode() {
    this.isEditing = !this.isEditing; // Umschalten des Bearbeitungsmodus


    if (this.isEditing) {
      // vorhandene Raumdaten in roomEdit kopieren
      this.roomEdit = {
        room_id: this.roomId,
        name: this.currentName,
        sensor_id: this.currentSensorId,
        image: this.currentImage,
        target_temp: this.targetTemperature,
        target_humidity: this.targetHumidity
      };

      if (this.availableSensors.length === 0) {
        // Nur Sensor-Daten laden, wenn sie noch nicht vorhanden sind
        this.fetchAvailableSensors();
      }
    }
  },
  cancelEdit() {
      this.isEditing = false; // Bearbeitungsmodus beenden
    },

  // Lokale Anpassung der Zieltemperatur, ohne API-Aufruf
  adjustTempLocally(change) {
    let newTemp = this.roomEdit.target_temp + change;
    newTemp = Math.max(10, Math.min(newTemp, 30));
    this.roomEdit.target_temp = newTemp;
  },

  // Lokale Anpassung der Ziel-Luftfeuchtigkeit, ohne API-Aufruf
  adjustHumLocally(change) {
    let newHum = this.roomEdit.target_humidity + change;
    newHum = Math.max(0, Math.min(newHum, 100));
    this.roomEdit.target_humidity = newHum;
  },

  async saveRoom() {
    if (this.showConfirmSwap) return;

    try {
        const payload = {
            name: this.roomEdit.name,
            sensor_id: this.roomEdit.sensor_id || null,
            image_url: this.roomEdit.image,
            target_temp: this.roomEdit.target_temp,
            target_humidity: this.roomEdit.target_humidity,
            room_id: this.roomEdit.room_id,
        };

        if (this.isAdding) {
            // Raum hinzufügen (POST)
            await roomApi.createRoom(payload);
            console.log("Raum erfolgreich hinzugefügt.");
            this.goBack();
        } else {
            // Raum aktualisieren (PATCH)
            await roomApi.updateRoom(this.roomId, payload);
            console.log("Raum erfolgreich aktualisiert.");
            this.cancelEdit();
            this.fetchRoomDetails();
        }

        // Feedback bei Erfolg
        this.$emit("save-feedback", {
          status: "success",
          message: "Raum erfolgreich gespeichert!",
        });

 
        this.$emit("room-updated");

        // Erfolgreich gespeichert: Aktualisierung mitteilen
        this.$emit("update-room", {
          roomId: this.roomId,
          temperature: this.temperature,
          humidity: this.humidity,
        });
        
        } catch (error) {
            console.error("Fehler beim Speichern des Raums:", error);
            // Feedback bei Fehler
            this.$emit("save-feedback", {
              status: "error",
              message: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
            });
        }
    },


    handleSensorChange() {
      if (this.roomEdit.sensor_id === "") {
        console.log("Kein Sensor ausgewählt");
        this.currentSensorId = null; // Kein zugewiesener Sensor
        return;
      }
      const selectedSensor = this.availableSensors.find(
        (sensor) => sensor.sensor_id === this.roomEdit.sensor_id
      );

      if (selectedSensor && selectedSensor.room_id && selectedSensor.room_id !== this.roomId) {
        this.showConfirmSwap = true;
      } else {
        this.currentSensorId = this.roomEdit.sensor_id;
      }
    },
    confirmSensorSwap() {
      this.showConfirmSwap = false;
    },
    closeSwapModal() {
      this.showConfirmSwap = false;
      this.roomEdit.sensor_id = this.currentSensorId;
    },

  
  async fetchAvailableSensors() {
    try {
      this.availableSensors = await sensorApi.getAvailableSensors();
      console.log('Verfügbare Sensoren:', this.availableSensors); 
    } catch (error) {
      console.error('Fehler beim Abrufen der Sensor-Daten:', error);
    }
  },

  getSensorIpAddress(sensorId) {
    const sensor = this.availableSensors.find(s => s.sensor_id === sensorId);
    return sensor ? sensor.ip_address : 'Nicht verfügbar';
  },

  
  
  // Raum löschen
  openDeleteModal() {
      this.showDeleteModal = true; // Modal anzeigen
    },
    closeDeleteModal() {
      this.showDeleteModal = false; // Modal ausblenden
    },

    async confirmDelete() {
      try {
        await roomApi.deleteRoom(this.roomId);
        this.$emit("room-deleted", this.roomId); // Event an Parent senden
        this.closeDeleteModal(); // Modal schließen
        this.goBack(); // Zurück zur Hauptansicht
      } catch (error) {
        console.error("Fehler beim Löschen des Raums:", error);
      }
    },

  
 },
 mounted() {
    this.isVisible = true;
    if (this.isAdding) {
        this.isEditing = true; // Automatisch in den Bearbeitungsmodus wechseln
    }
    
    this.fetchRoomDetails(); // Raumdetails beim Laden abrufen
    
    this.fetchAvailableSensors(); 
  },
};
</script>
<style scoped>

*{
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}
/* Transition für das Overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
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
  padding: 10px 20px; /* Innenabstand */
  border-radius: 35px;  cursor: pointer;
  font-size: 20px;
}


/*Raum bearbeiten Styles */
.header {
  display: flex; /* Flexbox verwenden */
  align-items: center; /* Vertikale Zentrierung */
  justify-content: space-between;
  gap: 10px; /* Abstand zwischen Überschrift und Buttons */
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
  gap: 5px; /* Abstand zwischen den Buttons */
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

/* Slide-Up Animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s;
}
.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to {
  transform: translateY(0);
  opacity: 1;
}

/* Zurück-Button */
.back-button {

  top: 10px;
  right: 0px;
  border: none;
  font-size: 30px;
  cursor: pointer;
  background-color: whitesmoke;
  color: #000000;
  border-radius: 50%;
  padding: 10px;
}

/* Raum-Detail Container */
.room-detail {
  position: fixed;
  bottom: 0;
  left: 3%;
  width: 92%;
  height: 65%;
  background-color: whitesmoke;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow-y: auto;
  border-top-right-radius: 30px;
  border-top-left-radius: 30px;
  padding: 20px;
}

/* Flexbox-Layout für Bild und Details */
.content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
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

h1 {
  font-size: 35px;
  color: #000000;
  margin-bottom: 20px;
}

/* Buttons */
button {
  margin: 0 10px;
  padding: 8px 15px;
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

.room-detail .set-temp,
.room-detail .set-humid {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
}

/* Graphen */
.room-detail .graph {
  margin-right: 30px;
  position: relative;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.room-detail .graph .graph-bar {
  
  display: block;
  height: 100%;
  background-color: #007bff;
  transition: width 0.3s ease, background-color 0.3s ease;
}

/* Zielwerte */
.room-detail .set-temp .target,
.room-detail .set-humid .target {
  font-weight: bold;
  color: #007bff;
}

/* Details-Bereich */
.details {
  flex: 1;
  display: flex;
  flex-direction: column;
  
}
/* Responsive Design: Mobile Ansicht */
@media screen and (max-width: 768px) {
  .content {
    flex-direction: column;
    align-items: center;
    gap: 30px;
  }

  .room-detail {
    height: 70%;
    width: 85%;
  }

  .details {
    width: 100%;
    text-align: center;
    align-items: center;
  }

  .room-image {
    max-width: 90%;
    max-height: 200px;
    margin-top: 20px;
  }

  h1 {
    text-align: center;
  }

  .temp,
  .humid {
    text-align: center;
  }
}

button:disabled {
  background-color: #ccc; /* Ausgegraut */
  color: #666; /* Textfarbe ausgegraut */
  cursor: not-allowed; /* Kein Klick möglich */
}


</style>