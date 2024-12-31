<template>
  <div class="widget">
    <h2 class="widget-title">Temperatur</h2>
    <div class="gauge-container">
      <div ref="temperatureGauge" class="gauge"></div>
    </div>
    <div class="control-overlay">
      <h3 class="widget-value">{{ temperature }}°C</h3>
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

    temperature: {
      type: Number,
      default: 0
    },
    targetTemperature: {
      type: Number,
      default: 20
    },
    offset: {
      type: Number,
      default: 2
    },
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
      // Speichert die ECharts-Instanz 
      gaugeInstance: null
    };
  },
  mounted() {
    this.initGauge();
  },
  watch: {
    //Wenn sich 'temperature' ändert, Gauge updaten
    temperature(newVal) {
      this.updateGauge(newVal, this.targetTemperature);
    },
    // Wenn sich 'targetTemperature' ändert, Gauge updaten 
    targetTemperature(newVal) {
      this.updateGauge(this.temperature, newVal);
    }
  },
  methods: {
    // Diese Methode emit’t ein Event, damit  der Parent (RoomDetail) den Zielwert ändern kann.
    emitAdjust(change) {
      this.$emit('adjust-target-temperature', change);
    },

    //Initialisiert den Gauge (wird in mounted() aufgerufen).
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

    // Updated die Daten des Gauges (aktueller Wert + Zielwert).
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
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 60px;
  padding: 75px;
  padding-top: 37px;
  box-sizing: border-box;
}

.widget {
  background-color: #f9f9f9;
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 340px;
  height: 340px;
  text-align: center;
  border: 1px solid #ddd;
  position: relative;
}

.widget-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 0px;
}

.widget-value {
  font-size: 22px;
  font-weight: bold;
  color: #333;
}

.control-overlay {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 2;
}

.gauge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
  margin: 0 auto;
  box-sizing: border-box;
  position: relative;
}

.gauge {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

.widget-button {
  border-radius: 50px;
  margin: 0px 5px;
  padding: 2px 7px;
}

.target {
  font-size: 22px;
  font-weight: bold;
  color: #0083bc;
}

.set-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Buttons */
button {

  background-color: #0083bc;
  color: whitesmoke;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  transform: scale(1.1);
}




</style>