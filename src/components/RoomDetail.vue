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
              <button class="edit-button" v-if="isAdmin && !isEditing" @click="toggleEditMode">Bearbeiten</button>
            </template>
            <button  class="back-button" @click="goBack">X</button>
          </div>
        </div>
        <!-- Normale Ansicht -->
        <div class="content">
          <template v-if="!isEditing">
            <img :src="currentImage" alt="Raum Layout" class="room-image" />
            <div class="details">
            <!-- Widgets-->
            <div class="widget-container">
              <TemperatureWidget
                ref="tempWidget"
                :temperature="temperature"
                :targetTemperature="targetTemperature"
                @adjust-target-temperature="adjustTargetTemperature"
              />
              <HumidityWidget
                ref="humidityWidget"
                :humidity="humidity"
                :targetHumidity="targetHumidity"
                @adjust-target-humidity="adjustTargetHumidity"
              />
              <Co2Widget 
                ref="co2Widget"
                :co2="co2"
              />
              </div>
            </div>
          </template>

          <template v-else>
          <RoomEdit 
            :isEditing="isEditing"
            :isAdding="isAdding"
            :roomEdit="roomEdit"
            :availableSensors="availableSensors"
            :showDeleteModal="showDeleteModal"
            :showConfirmSwap="showConfirmSwap"

            @save-room="saveRoom" 
            @open-delete-modal="openDeleteModal"
            @close-delete-modal="closeDeleteModal"
            @confirm-delete="confirmDelete"
            @close-swap-modal="closeSwapModal"
            @confirm-sensor-swap="confirmSensorSwap"
            @check-sensor="handleSensorChange"
            @update:currentSensorId="currentSensorId = $event"
          />
          </template>
        </div>
        
      </div>
    </transition>
  </div>
</template>

<script>
import { roomApi } from "../services/roomService";
import { sensorApi } from '../services/sensorService';
import { msalInstance } from "../authConfig";
import { getCo2GaugeColor, disposeGauges, initCo2Gauge, initGaugeChart, getDynamicColor } from '../utils/gaugeUtils';
import RoomEdit from './RoomEdit.vue';
import TemperatureWidget from '../components/TemperatureWidget.vue';
import HumidityWidget from '../components/HumidityWidget.vue';
import Co2Widget from '../components/co2Widget.vue';


export default {
  components: {
    RoomEdit, 
    TemperatureWidget,
    HumidityWidget,
    Co2Widget
  },
  
  props: {
    room: {
      type: Object,
      required: true,
      default: () => ({})
    },
    isAdding: {
    type: Boolean,
    default: false,
    },
    temperatureOffset: {
    type: Number,
    default: 2  // Standardwert, falls nichts übergeben wird
    },
    humidityOffset: {
      type: Number,
      default: 5
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
      gaugeInstances: {},
      isEditing: false, // Bearbeitungsstatus
      
      roomEdit: {
        name: this.isAdding ? "Neuer Büroraum" : this.name,
        room_id: this.isAdding ? "" : this.roomId,
        sensor_id: null,
        image: this.isAdding
          ? "https://static5.depositphotos.com/1010050/513/i/450/depositphotos_5135344-stock-photo-modern-office.jpg"
          : this.image,
        target_temp: this.isAdding ? 21 : this.temperature,
        target_humidity: this.isAdding ? 50 : this.humidity,
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

    isAdmin() {
      // Gleiches Prinzip wie in Navbar
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const account = accounts[0];
        const adminIdentifier = "admin";
        const displayName = account.idTokenClaims?.name || "";
        return displayName.toLowerCase().includes(adminIdentifier);
      }
      return false;
    },
    image() {
      return this.room.image || "";
    },
    name() {
      return this.room.name || "Büroraum";
    },
    roomId() {
      return this.room.number || "";
    },
    temperature() {
      return this.room.temperature || 0;
    },
    humidity() {
      return this.room.humidity || 0;
    },
    co2() {
      return this.room.co2 || "N/A";
    },
    is_connected() {
      return this.room.is_connected || false;
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
    this.updateGaugeChart('temperatureGauge', this.temperature, this.targetTemperature);  // Gauge updaten
    this.disableHumidityButtons = true; // Feuchtigkeits-Buttons deaktivieren

    if (this.debounceTimeoutTemp) {
      clearTimeout(this.debounceTimeoutTemp);
    }

    this.debounceTimeoutTemp = setTimeout(() => {
      this.updateTarget("target_temp", this.targetTemperature);
      this.disableHumidityButtons = false; // Feuchtigkeits-Buttons wieder aktivieren
    }, 500);
  },
  adjustTargetHumidity(change) {
    if (this.disableHumidityButtons) return;

    this.targetHumidity += change;
    this.targetHumidity = Math.max(0, Math.min(this.targetHumidity, 100));
    this.updateGaugeChart('humidityGauge', this.humidity, this.targetHumidity); // Gauge updaten
    this.disableTemperatureButtons = true; // Temperatur-Buttons deaktivieren

    if (this.debounceTimeoutHumidity) {
      clearTimeout(this.debounceTimeoutHumidity);
    }

    this.debounceTimeoutHumidity = setTimeout(() => {
      this.updateTarget("target_humidity", this.targetHumidity);
      this.disableTemperatureButtons = false; // Temperatur-Buttons wieder aktivieren
    }, 500);
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

    // Nur Admins dürfen einen Raum hinzufügen oder ändern
    if (!this.isAdmin) {
        console.warn("Nur Admins dürfen einen Raum hinzufügen oder ändern.");
        return;
    }
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
          co2: this.co2
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


    initGauges() {
      this.$nextTick(() => {
      initGaugeChart(
          this.$refs.tempWidget.$refs, // 1. Parameter = Refs-Objekt
          this.gaugeInstances,
          'temperatureGauge',          // refName
          this.temperature,
          this.targetTemperature,
          10, 30,
          '°C',
          getDynamicColor,
          {
            temperatureGauge: this.temperatureOffset
          }
        );

        initGaugeChart(
          this.$refs.humidityWidget.$refs, // 1. Parameter = Refs-Objekt
          this.gaugeInstances,
          'humidityGauge',          // refName
          this.humidity,
          this.targetHumidity,
          0, 100,
          '%',
          getDynamicColor,
          {
            humidityGauge: this.humidityOffset
          }
        );

    });
  },


  // Aktualisieren der Gauge-Daten
  updateGaugeChart(refName, value, targetValue) {
   
  const chart = this.gaugeInstances[refName];
  
  if (!chart) {
    console.error(`Gauge ${refName} nicht gefunden.`);
    return;
  }

  if (chart) {
    console.log(`Aktualisiere ${refName} mit Wert: ${value}`);
    
    const dynamicColor = getDynamicColor(value, targetValue, refName === 'temperatureGauge' ? this.temperatureOffset : this.humidityOffset);

    chart.setOption({
      series: [
        {
          data: [{ value: value }],
          progress: {
            itemStyle: {
              color: dynamicColor
            }
          }
        },
        {
          data: [{ value: targetValue }]
        }
      ]
    });
  }
},



},
 mounted() {
  console.log('CO2 Wert beim Laden:', this.co2); 
    this.isVisible = true;
    if (this.isAdding) {
        this.isEditing = true; // Automatisch in den Bearbeitungsmodus wechseln
    }
    
    this.fetchRoomDetails().then(() => {
    this.$nextTick(() => {
      this.initGauges();
    
    });
  });
    this.fetchAvailableSensors(); 
  },

  watch: {
  isVisible(newVal) {
    if (newVal) {
      this.$nextTick(() => {
        disposeGauges(this.gaugeInstances);
        this.initGauges();
      });
    } else {
      disposeGauges(this.gaugeInstances);
    }
  },
  isEditing(newVal) {
    if (!newVal) {
      this.$nextTick(() => {
        disposeGauges(this.gaugeInstances);
        this.initGauges();
      });
    }
  },
 
  targetTemperature(newVal) {
    this.updateGaugeChart('temperatureGauge', this.temperature, newVal);
  },
  targetHumidity(newVal) {
    this.updateGaugeChart('humidityGauge', this.humidity, newVal);
  },
  temperature(newVal) {
    console.log('Temperatur aktualisiert:', newVal);
    this.updateGaugeChart('temperatureGauge', newVal, this.targetTemperature);
  },
  humidity(newVal) {
    console.log('Luftfeuchtigkeit aktualisiert:', newVal);
    this.updateGaugeChart('humidityGauge', newVal, this.targetHumidity);
  }
},

};
</script>

<style scoped>
*{
  font-family: 'BDOGrotesk', system-ui, sans-serif;
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

</style>