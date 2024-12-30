<script>
export default {
  name: "Room",
  props: {
    name: {
      type: String,
      default: "Büroraum",
    },
    image: {
      type: String,
      required: true
    },
    temperature: {
      type: [Number, String],
      required: true,
    },
    humidity: {
      type: [Number, String],
      required: true,
    },
    co2: {
        type: [Number, String],
        required: true,
    },
    number: {
      type: [Number, String],
      required: true,
    },
    targetTemperature: {
      type: Number,
      required: true,
    },
    targetHumidity: {
      type: Number,
      required: true,
    },
    temperatureOffset: {
      type: Number,
      required: true,
    },
    humidityOffset: {
      type: Number,
      required: true,
    },
    status: {
      type: Object,
      default: () => ({
        temp_status: 'unknown',
        humidity_status: 'unknown'
      })
    },
    // Fehlendes hinzufügen:
    is_connected: {
      type: Boolean,
      required: true,
    }
  },
  computed: {
    
    // Farbe basierend auf der Temperatur
    temperatureColor() {
      const lowerThreshold = this.targetTemperature - this.temperatureOffset;
      const upperThreshold = this.targetTemperature + this.temperatureOffset;
      if (this.temperature == null || isNaN(this.temperature)) return "#b0b0b0";
      if (this.temperature < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.temperature > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
    // Farbe basierend auf der Luftfeuchtigkeit
    humidityColor() {
      const lowerThreshold = this.targetHumidity - this.humidityOffset;
      const upperThreshold = this.targetHumidity + this.humidityOffset;
      if (this.humidity == null || isNaN(this.humidity)) return "#b0b0b0";
      if (this.humidity < lowerThreshold) return "#87cefa"; // Unter Sollwert → Blau
      if (this.humidity > upperThreshold) return "#cd5c5c"; // Über Sollwert → Rot
      return "#3cb371"; // Innerhalb des Bereichs → Grün
    },
    // Fehlendes hinzufügen: Dynamische Klassen basierend auf is_connected
    cardClasses() {
      console.log('Room component is_connected prop:', this.is_connected);
      console.log('Room component is_connected type:', typeof this.is_connected);
      return {
        'room-card': true,
        'disconnected': !this.is_connected // Stellt sicher, dass die Klasse basierend auf is_connected gesetzt wird
      };
    }
    
  },

  methods: {
  co2Color() {
    if (this.co2 == null || isNaN(this.co2)) return "#b0b0b0";
    if (this.co2 < 800) return "#3cb371";  // Grün
    if (this.co2 > 1000) return "#cd5c5c"; // Rot
    return "#FFD700";                      // Gelb
  },
  co2Text() {
    if (this.co2 == null || isNaN(this.co2)) return "N/A";
    if (this.co2 < 800) return "Gut";  // Anzeige für niedrige CO₂-Werte
    if (this.co2 >= 800 && this.co2 <= 1000) return "Ok";  // Mittlerer Bereich
    return "Hoch";  // Alarm bei hohen CO₂-Werten
  }
}
  
};
</script>

<template>
  <div :class="cardClasses" @click="$emit('click')">
    <!-- Overlay anzeigen, wenn nicht verbunden -->
    <div v-if="!is_connected" class="connection-status">Keine Sensor Verbindung!</div>

    <h2 class="room-title" :class="{ 'disconnected-title': !is_connected }">{{ name }}</h2>

    <div class="room-layout">
      <div class="room-image-container" :class="{ 'disconnected': !is_connected }">
        <img :src="image" alt="Raum Layout" class="room-image" />
        
        <!-- Overlay nur anzeigen, wenn is_connected false ist -->
        <div v-if="!is_connected" class="overlay-image"></div>
      </div>

      <div class="metrics">
        <div class="co2-status" :style="{ backgroundColor: is_connected ? co2Color() : '#b0b0b0' }">
          CO₂ {{ co2Text() }}
        </div>
        <!-- Dynamische Farbe für Temperatur -->
        <div class="temperature" :style="{ backgroundColor: is_connected ? temperatureColor : '#b0b0b0' }">
          {{ temperature + '°C' }}
        </div>
        <!-- Dynamische Farbe für Luftfeuchtigkeit -->
        <div class="humidity" :style="{ backgroundColor: is_connected ? humidityColor : '#b0b0b0' }">
          {{ humidity + '%' }}
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
*{
  font-family: 'BDOGrotesk', system-ui, sans-serif;
}

/* Hauptcontainer */
.room-container{
  display: flex;
  justify-content: center;
  width: 100%;
}
.room-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px;
  width: 100%;
  height: auto;
  margin: auto;
  position: relative;
}

/* Titel */
.room-title {
  font-size: 32px;
  line-height: 38.4px;
  margin-bottom: 8px;
  letter-spacing: -0.68px;
  font-weight: 700;
  text-align: left;
}
@media screen and (max-width: 768px) {
  .room-title {
    font-size: 18px;
    line-height: 21.6px;
    letter-spacing: -0.4px;
  }
}

/* Bildlayout */
.room-layout {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
} 


/* Raum-Bild */
.room-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

}

.overlay-image {
  opacity: 1;
  position: absolute;
  top: 0px;
  left: 0;  /* Overlay startet korrekt bei der linken Ecke */
  width: 100%;
  height: 100%;
  background-image: url('https://www.pngitem.com/pimgs/m/379-3794039_no-internet-connection-sketch-brand-graphic-design-no.png');  
  background-size: contain;  /* Bildgröße wird angepasst, um das gesamte Element zu füllen */
  background-position: center;  /* Bild wird zentriert */
  background-repeat: no-repeat; /* Verhindert Wiederholung des Bildes */
  background-color: rgb(247, 247, 247);  /* Leichtes dunkles Overlay */
  pointer-events: none;

}


/* Temperatur- und Luftfeuchtigkeitsanzeige */
.metrics {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Dynamische Anzeige für Temperatur und Luftfeuchtigkeit */
.temperature,
.humidity {
  padding: 0.5rem;
  border-radius: 4px;
  color: white; /* Textfarbe immer weiß */
  text-align: center;
  font-weight: bold;
  min-width: 60px;
  max-width: 100px;
  font-size: calc(0.5rem + 1vw); /* Dynamische Schriftgröße */
}


/* Overlay anzeigen, wenn disconnected */
.connection-status {
  position: absolute;
  background-color: #bdbdbd;
  border-radius: 9px;
  padding: 4px 9px;
  top: 62%;
  left: 50%;
  transform: translate(-50%, -50%); 
  color: rgb(255, 255, 255); 
  font-size: 11px;  
  z-index: 1;
  text-align: center;
  white-space: nowrap;  /* Verhindert Zeilenumbrüche */
}




.disconnected-image {
  filter: grayscale(100%) blur(1.5px); /* Graustufen und Unschärfe */
  transition: filter 0.3s ease, opacity 0.3s ease; /* Sanfter Übergang */
}

.disconnected-title {
  color: #666666;
  opacity: 0.7;
  transition: color 0.3s ease, opacity 0.3s ease;
}


.co2-status {
    padding: 0.5rem;
    border-radius: 4px;
    color: white;
    text-align: center;
    font-weight: bold;
    min-width: 60px;
    max-width: 100px;
    font-size: calc(0.5rem + 1vw);
}
</style>
