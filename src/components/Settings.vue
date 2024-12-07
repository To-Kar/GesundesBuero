<script>
export default {
  name: 'Settings',
  data() {
    return {
      seconds: 0, // Startwert für Sekunden
      minutes: 3, // Startwert für Minuten
      showSaveNotification: false // Status für die Speichern-Benachrichtigung
    }
  },
  methods: {
    updateSeconds(event) {
      const value = parseInt(event.target.value.trim());
      if (!isNaN(value) && value >= 0 && value <= 59) {
        this.seconds = value;
      } else {
        event.target.value = this.seconds; // Setze den Wert zurück, wenn die Eingabe ungültig ist
      }
    },
    updateMinutes(event) {
      const value = parseInt(event.target.value.trim());
      if (!isNaN(value) && value >= 0 && value <= 60) {
        this.minutes = value;
      } else {
        event.target.value = this.minutes; // Setze den Wert zurück, wenn die Eingabe ungültig ist
      }
    },
    saveSettings() {
      // Speichere die aktuellen Werte (Sekunden und Minuten)
      console.log(`Einstellungen gespeichert: ${this.minutes} Minuten, ${this.seconds} Sekunden`);

      // Zeige die Speichern-Benachrichtigung an
      this.showSaveNotification = true;

      // Blende die Benachrichtigung nach 3 Sekunden aus
      setTimeout(() => {
        this.showSaveNotification = false;
      }, 3000);
    }
  }
}
</script>

<template>
  <div class="settings-modal" @click="$emit('close')">
    <div class="settings-content" @click.stop>
      <div class="modal-header">
        <h2>Einstellungen</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="settings-item">
          <p class="interval-title">Intervall-Einstellung</p>
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
          </div>
          <button class="save-button" @click="saveSettings">
            Speichern
          </button>
        </div>
      </div>
      <div v-if="showSaveNotification" class="save-notification">
        Einstellungen erfolgreich gespeichert!
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
  max-width: 500px;
  max-height: 80vh;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.settings-item {
  color: black;
  font-size: 18px;
  line-height: 25.2px;
  letter-spacing: 0.009em;
  margin: 0;
  padding: 12px 0;
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
  border-radius: 15px;
  border: 1px solid hsl(210, 0%, 60%);
  padding: 16px;
}

.interval-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
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

.save-button {
  margin-top: 40px;
  align-self: center;
  padding: 10px 20px;
  font-size: 18px;
  background-color: hsl(210, 80%, 60%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.save-button:hover {
  background-color: hsl(210, 70%, 50%);
}

.save-notification {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: hsl(120, 70%, 40%);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 1003;
  animation: fadeInOut 3s ease-in-out;
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
