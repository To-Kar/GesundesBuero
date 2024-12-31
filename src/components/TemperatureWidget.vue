<template>
    <div class="widget">
      <h2 class="widget-title">Temperatur</h2>
      <div class="gauge-container">
        <!-- Container für ECharts-Gauge -->
        <div ref="temperatureGauge" class="gauge"></div>
      </div>
  
      <div class="control-overlay">
        <!-- Aktueller Wert im Template anzeigen -->
        <h3 class="widget-value">{{ temperature }}°C</h3>
  
        <!-- Buttons zum Ändern der Zieltemperatur -->
        <div class="set-value">
          <button class="widget-button" @click="emitAdjust(-1)">−</button>
          <span class="target">{{ targetTemperature }}°C</span>
          <button class="widget-button" @click="emitAdjust(1)">+</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { initGaugeChart, getDynamicColor } from '../utils/gaugeUtils';
  
  export default {
    name: 'TemperatureWidget',
    props: {
      /** Aktueller Wert **/
      temperature: {
        type: Number,
        default: 0
      },
      /** Ziel-/Solltemperatur **/
      targetTemperature: {
        type: Number,
        default: 20
      },
      /** Offset für die getDynamicColor-Funktion (Option) **/
      offset: {
        type: Number,
        default: 2
      },
      /** Minimal und Maximal für den Gauge (Option) **/
      minValue: {
        type: Number,
        default: 10
      },
      maxValue: {
        type: Number,
        default: 30
      }
    },
    data() {
      return {
        /** Speichert die ECharts-Instanz **/
        gaugeInstance: null
      };
    },
    mounted() {
      this.initGauge();
    },
    watch: {
      /** Wenn sich 'temperature' ändert, Gauge updaten **/
      temperature(newVal) {
        this.updateGauge(newVal, this.targetTemperature);
      },
      /** Wenn sich 'targetTemperature' ändert, Gauge updaten **/
      targetTemperature(newVal) {
        this.updateGauge(this.temperature, newVal);
      }
    },
    methods: {
      /** 
       * Diese Methode emit’t ein Event, damit 
       * der Parent (z.B. RoomDetail) den Zielwert ändern kann.
       **/
      emitAdjust(change) {
        // z.B. "adjustTargetTemperature"
        this.$emit('adjust-target-temperature', change);
      },
  
      /** 
       * Initialisiert den Gauge (wird in mounted() aufgerufen).
       **/
      initGauge() {
        this.$nextTick(() => {
          const offsets = {
            temperatureGauge: this.offset
          };
          // gaugeInstance speichern, um später updaten zu können
          this.gaugeInstance = initGaugeChart(
            this.$refs, // DOM-Refs
            { temperatureGauge: this.gaugeInstance }, // gaugeInstances, dummy
            'temperatureGauge', // refName
            this.temperature, // aktueller Wert
            this.targetTemperature, // Zielwert
            this.minValue,
            this.maxValue,
            '°C',
            getDynamicColor,
            offsets
          );
        });
      },
  
      /**
       * Updated die Daten des Gauges (aktueller Wert + Zielwert).
       **/
      updateGauge(value, target) {
        if (!this.gaugeInstance) return;
  
        // Farbe basierend auf getDynamicColor
        const dynamicColor = getDynamicColor(value, target, this.offset);
        this.gaugeInstance.setOption({
          series: [
            {
              // Series 1 = aktueller Wert
              data: [{ value }],
              progress: {
                itemStyle: {
                  color: dynamicColor
                }
              }
            },
            {
              // Series 2 = Zielwert
              data: [{ value: target }]
            }
          ]
        });
      }
    }
  };
  </script>
  <style>
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
.disabled-button {
    color: hsl(0, 0%, 50%);
    cursor: not-allowed !important;
    pointer-events: none !important;
    background-color: #ccc !important;
  }
  
  </style>
  
  