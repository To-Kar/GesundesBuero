<script>
import Room from "../components/Room.vue";
import RoomDetail from "../components/RoomDetail.vue";
import { roomService } from "../services/roomService";
import { settingsService } from "../services/settingsService";
import { eventBus } from '../plugins/eventBus';

export default {
  name: "RoomView",
  components: {
    Room,
    RoomDetail,
  },
  data() {
    return {
      rooms: [],
      showDetail: false,
      roomId: "",
      error: null,
      loading: false,
      temperature: 0,
      humidity: 0,
      isAdding: false, // Flag, wenn ein neuer Raum hinzugefügt wird.
      saveStatus: "",
      saveMessage: "",
      updateInterval: 10000, // Intervallzeit aus der Settings-Tabelle
      intervalId: null,     // Speichert die Timer-ID
      temperatureOffset: 0,
      humidityOffset: 0,
      is_connected: false
    };
  },

  async created() {
    try {
      this.loading = true;
      await this.fetchSettingsAndStartInterval();
      // Räume und zugehörige Sensordaten abrufen
      const { rooms, offsets } = await roomService.getRoomsAndOffsets();
      this.rooms = rooms;
      this.temperatureOffset = offsets.temperature_offset;
      this.humidityOffset = offsets.humidity_offset;
    } catch (error) {
      this.error = error.message;
      console.error("Fehler beim Laden der Räume:", error);
    } finally {
      this.loading = false;
    }
  },
  mounted() {
    eventBus.on('add-room', this.addRoom);
    eventBus.on('room-created', this.refreshSensorDataAfterRoomCreation);
  },
  beforeUnmount() {
    eventBus.off('add-room', this.addRoom);
    eventBus.off('room-created', this.refreshSensorDataAfterRoomCreation);
  },

  methods: {
    handleTargetUpdate({ roomId, targetTemperature, targetHumidity }) {
      const room = this.rooms.find(r => r.number === roomId);
      if (room) {
        room.target_temperature = targetTemperature;
        room.target_humidity = targetHumidity;
      }
      console.log("Zielwerte aktualisiert für Raum:", roomId);
    },
    goToRoomDetail(image, name, roomId, temperature, humidity, co2) {
      console.log("Raum-ID angeklickt:", roomId);
      if (!roomId) {
        console.error("Kein roomId übergeben!");
        return;
      }
      this.image = image;
      this.isAdding = false; // normaler Bearbeitungsmodus anstatt Hinzufügemodus
      this.name = name;
      this.roomId = roomId;
      this.temperature = temperature;
      this.co2 = co2;
      this.humidity = humidity;
      this.showDetail = true; // Anzeige der Detailansicht
    },

    // Räume neu laden, wenn 'room-updated' Event vom RoomDetail kommt
    async refreshRooms() {

      try {
        this.rooms = await roomService.getAllRoomsWithSensorData();

        // Wenn Detailfenster noch offen ist, aktualisieren wir die Props
        if (this.showDetail && this.roomId) {
          const updatedRoom = this.rooms.find(r => r.number === this.roomId);
          if (updatedRoom) {
            this.temperature = updatedRoom.temperature;
            this.humidity = updatedRoom.humidity;
            this.co2 = updatedRoom.co2;
          }
        }
      } catch (error) {
        this.error = error.message;
        console.error("Fehler beim Laden der Räume:", error);
      }
    },

    addRoom() {
      this.isAdding = true;
      this.image = "https://static5.depositphotos.com/1010050/513/i/450/depositphotos_5135344-stock-photo-modern-office.jpg";
      this.name = "Neuer Raum";
      this.roomId = "";
      this.temperature = 20;
      this.humidity = 50;
      this.showDetail = true; // Detailansicht öffnen
    },

    updateRoomData(updatedRoom) {
      const room = this.rooms.find(r => r.number === updatedRoom.roomId);
      if (room) {
        room.temperature = updatedRoom.temperature;
        room.humidity = updatedRoom.humidity;
        room.co2 = updatedRoom.co2;
        room.is_connected = updatedRoom.is_connected;
      }
    },

    closeRoomDetail() {
      this.showDetail = false;
      this.refreshRooms();
    },

    // Feedback anzeigen und nach 2 Sekunden ausblenden
    handleFeedback({ status, message }) {
      console.log("Feedback erhalten:", status, message);
      this.saveStatus = status;
      this.saveMessage = message;

      setTimeout(() => {
        this.saveStatus = "";
        this.saveMessage = "";
      }, 2000);
    },

    // Abrufen des Update-Intervalls und Starten des Timers
    async fetchSettingsAndStartInterval() {
      try {

        this.updateInterval = await settingsService.fetchAndReturnInterval();
        console.log("Update-Intervall gesetzt auf:", this.updateInterval, "ms");

        // Timer neustarten
        this.restartUpdateTimer();
      } catch (error) {
        console.error("Fehler beim Laden des Intervalls:", error.message);
      }
    },

    // Timer neustarten
    restartUpdateTimer() {
      if (this.intervalId) clearInterval(this.intervalId); // Vorhandenes Intervall stoppen

      this.intervalId = setInterval(async () => {
        await this.fetchSensorData(); // Sensordaten aktualisieren
      }, this.updateInterval);

      console.log("Timer gestartet mit Intervall:", this.updateInterval, "ms");
    },

    // Sensordaten aus der API abrufen
    async fetchSensorData() {
      try {
        this.rooms = await roomService.getAllRoomsWithSensorData();
        console.log("Sensordaten erfolgreich aktualisiert");


        this.$forceUpdate();
      } catch (error) {
        console.error("Fehler beim Laden der Sensordaten:", error.message);
      }
    },

  },
  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId); // Timer stoppen, wenn Komponente zerstört wird
  },
};
</script>

<template>
  <div class="room-view">
    <Room
      v-for="room in rooms"
      :key="room.number"
      :name="room.name"
      :number="room.number"
      :temperature=room.temperature
      :humidity=room.humidity
      :co2=room.co2 
      :image="room.image"
      :targetTemperature="room.target_temperature" 
      :targetHumidity="room.target_humidity" 
      :status="room.status"
      :sensor_id="room.sensor_id"
      :temperatureOffset="temperatureOffset" 
      :humidityOffset="humidityOffset"
      :is_connected="room.is_connected"
      @click="goToRoomDetail(room.image, room.name, room.number, room.temperature, room.humidity, room.co2)"
    />


  </div>

  <div v-if="saveStatus" class="save-feedback" :class="saveStatus">
    {{ saveMessage }}
  </div>

  <div class="room-detail-view">
      <RoomDetail
        v-if="showDetail"
        :image="image"
        :name="name"
        :roomId="roomId"
        :temperature="temperature"
        :humidity="humidity"
        :co2="co2"

        :temperatureOffset="temperatureOffset" 
        :humidityOffset="humidityOffset"

        :isAdding="isAdding"
        :is_connected="is_connected"

        @close="showDetail = false"

        @room-deleted="refreshRooms" 
        @room-updated="refreshRooms" 
        
        @save-feedback="handleFeedback"
        @update-room="updateRoomData"
        @target-updated="handleTargetUpdate"
      />
  </div>


</template>

<style scoped>
* {
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}

.room-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 0.7rem;
}

.room-view>* {
  flex: 1 1 calc(50% - 1rem);
  max-width: calc(50% - 1rem);
  box-sizing: border-box;
}

@media screen and (max-width: 768px) {
  .room-view>* {
    flex: 1 1 100%;
    max-width: 100%;
  }
}


/* Neuen Raum hinzufügen Button Styles */
.room.add-room {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f1f1;
  border-radius: 35px;

  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  flex: 1 1 calc(50% - 1rem);
  max-width: calc(50% - 1rem);
  aspect-ratio: 1.5 / 1;

}

.room.add-room:hover {
  background-color: #dbdbdb;
}

.add-room-icon {
  font-size: 48px;
  color: #929292;
  margin: 0;
}

.add-room-text {
  font-size: 30px;
  color: #929292;
  margin: 0;
}


/* Styles für Benachrichtigung speichern/bearbeiten*/
.save-feedback {
  position: fixed;
  top: 25%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f8f9fa;
  color: #212529;
  padding: 10px 20px;
  border-radius: 35px;
  z-index: 9999;
  font-size: 16px;
  text-align: center;
}

.save-feedback.success {
  background-color: #00d031;
  color: #ffffff;
}

.save-feedback.error {
  background-color: #da0000;
  color: #ffffff;
}
</style>
