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


        <div class="content">
          <template v-if="!isEditing">
            <!-- Normale Ansicht -->
            <img :src="currentImage" alt="Raum Layout" class="room-image" />
            
            <div class="details">

            <!-- Widgets-->
            <div class="widget-container">
              <!-- Temperatur Widget -->
              <div class="widget">
                <h2 class="widget-title">Temperatur</h2>
                <div class="gauge-container">
                  <div ref="temperatureGauge" class="gauge"></div>
                </div>
                <div class="control-overlay">
                  <h3 class="widget-value">{{ temperature }}°C</h3>
                  <div class="set-value">
                    <button class="widget-button" @click="adjustTargetTemperature(-1)">−</button>
                    <span class="target">{{ targetTemperature }}°C</span>
                    <button class="widget-button" @click="adjustTargetTemperature(1)">+</button>
                  </div>
                </div>
              </div>

              <!-- Luftfeuchtigkeit Widget -->
              <div class="widget">
                <h2 class="widget-title">Luftfeuchtigkeit</h2>
                <div class="gauge-container">
                  <div ref="humidityGauge" class="gauge"></div>
                </div>
                <div class="control-overlay">
                  <h3 class="widget-value">{{ humidity }}%</h3>
                  <div class="set-value">
                    <button class="widget-button" @click="adjustTargetHumidity(-5)">−</button>
                    <span class="target">{{ targetHumidity }}%</span>
                    <button class="widget-button" @click="adjustTargetHumidity(5)">+</button>
                  </div>
                </div>
              </div>

              <!-- Co2 Widget -->
              <div class="widget">
                <h2 class="widget-title">CO₂-Gehalt </h2>
                <div class="gauge-container">
                  <div ref="co2Gauge" class="gauge"></div>
                </div>
                <div class="control-co2-overlay">
                  <h3 class="widget-value">{{ co2 !== null ? co2 + ' ppm' : 'N/A' }}</h3>
                </div>
              </div>

            </div>
            </div>
          </template>

          <template v-else>
            <!-- Bearbeitungsmodus -->
            <img :src="roomEdit.image" alt="Raum Layout" class="room-image editable-image" />
            <div class="details"> 
             
              
              <form @submit.prevent="saveRoom" class="edit-form">
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
import { msalInstance } from "../authConfig";
import * as echarts from 'echarts';
import { initCo2Gauge, initGaugeChart, getDynamicColor } from '../utils/gaugeUtils';




export default {
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
    }

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
    const offsets = {
      temperatureGauge: this.temperatureOffset,
      humidityGauge: this.humidityOffset
    };

    initGaugeChart(
      this.$refs,
      this.gaugeInstances,
      'temperatureGauge',
      this.temperature,
      this.targetTemperature,
      10, 30,
      '°C',
      getDynamicColor,
      offsets
    );

    initGaugeChart(
      this.$refs,
      this.gaugeInstances,
      'humidityGauge',
      this.humidity,
      this.targetHumidity,
      0, 100,
      '%',
      getDynamicColor,
      offsets
    );

    // CO2 Gauge initialisieren
    const updateCo2Gauge = initCo2Gauge(
      this.$refs,
      this.gaugeInstances,
      this.co2,
      this.getCo2GaugeColor
    );

    // Reaktive Aktualisierung für co2
    this.$watch('co2', (newValue) => {
      updateCo2Gauge(newValue);
    });
  });
},

  // Dispose-Methode, um alte Gauges zu zerstören
  disposeGauges() {
  Object.keys(this.gaugeInstances).forEach((key) => {
    if (this.gaugeInstances[key]) {
      this.gaugeInstances[key].dispose();
      delete this.gaugeInstances[key];
    }
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





getCo2GaugeColor(value) {
  console.log('außerhalb',value)
  if (value === null || value === undefined || value === 'N/A') {
    console.log(value)
    return [
      [1, '#ddd']  // Die gesamte Linie wird grau (ohne Verlauf)
    ];
  }
  return [
    [1, {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        { offset: 0, color: 'rgb(0, 204, 102)' },  
        { offset: 0.2, color: 'rgb(102, 255, 102)' }, 
        { offset: 0.35, color: 'rgb(255, 239, 130)' },  
        { offset: 0.5, color: 'rgb(255, 215, 0)' },  
        { offset: 0.65, color: 'rgb(255, 165, 0)' },  
        { offset: 0.85, color: 'rgb(255, 99, 71)' },  
        { offset: 1, color: 'rgb(205, 92, 92)' }
      ]
    }]
  ];
}



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
      this.updateGaugeChart('co2Gauge', this.co2, 0);  // CO₂ sofort setzen
    });
  });
    
    this.fetchAvailableSensors(); 



  },
  watch: {
    
  isVisible(newVal) {
    if (newVal) {
      this.$nextTick(() => {
        this.disposeGauges();
        this.initGauges();
      });
    } else {
      this.disposeGauges();
    }
  },
  isEditing(newVal) {
    if (!newVal) {
      this.$nextTick(() => {
        this.disposeGauges();
        this.initGauges();
      });
    }
  },
  co2(newVal) {
    console.log('CO2-Wert aktualisiert:', newVal);
    this.updateGaugeChart('co2Gauge', newVal, 0);  // CO₂ hat keinen Zielwert
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



.widget-container {
  display: flex;
  flex-wrap: wrap;          /* Zeilenumbruch, wenn der Platz nicht reicht */
  justify-content: space-between;  /* Zentrieren der Widgets */
  gap: 60px;                /* Abstand zwischen den Widgets */
  padding: 75px;            /* Abstand zum Container-Rand */
  padding-top: 37px;
  box-sizing: border-box;   /* Padding wird in die Gesamtbreite eingerechnet */
}

.widget {
  background-color: #f9f9f9;
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 340px;             /* Kleinere Breite der Widgets */
  height: 340px;            /* Verkleinerung der Höhe */
  text-align: center;
  border: 1px solid #ddd;
  position: relative;
}

.widget-title {
  font-size: 22px;         /* Kleinere Schriftgröße für den Titel */
  font-weight: bold;
  color: #333;
  margin-bottom: 0px;
}

.widget-value {
  font-size: 22px;         /* Anpassung der Werteanzeige */
  font-weight: bold;
  color: #333;
}

.control-overlay {
  position: absolute;
  bottom: 40px;            /* Platzierung näher an den unteren Rand */
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}


.control-co2-overlay {
  position: absolute;
  bottom: 14px;            /* Platzierung näher an den unteren Rand */
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}

.gauge-container {
  display: flex;               /* Flexbox für zentrierte Ausrichtung */
  justify-content: center;     /* Horizontal zentrieren */
  align-items: center;         /* Vertikal zentrieren */
  width: 100%;
  height: 250px;               /* Höhe beibehalten */
  margin: 0 auto;              /* Zentrierung des Containers */
  box-sizing: border-box;      /* Padding wird berücksichtigt */
  position: relative;          /* Bezugspunkt für Gauge */
}

.gauge {
display: block;
  width: 100%;
  height: 100%;
   margin: 0 auto;
}

.widget-button{


border-radius: 50px;
}






.disabled-button {
  color: hsl(0, 0%, 50%);
  cursor: not-allowed !important;
  pointer-events: none !important;
  background-color: #ccc !important;
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
.room-detail .set-value .target,
.room-detail .set-humid .target {
  font-weight: bold;
  color: #0083bc;
  font-size: 22px;
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