<template>
  <div class="widget">
    <h2 class="widget-title">Luftfeuchtigkeit</h2>
    <div class="gauge-container">
      <!-- Container für ECharts-Gauge -->
      <div ref="humidityGauge" class="gauge"></div>
    </div>

    <div class="control-overlay">
      <!-- Aktueller Wert im Template anzeigen -->
      <h3 class="widget-value">{{ humidity }}%</h3>

      <!-- Buttons zum Ändern der Zieltemperatur -->
      <div class="set-value">
        <button class="widget-button" @click="emitAdjust(-5)">−</button>
        <span class="target">{{ targetHumidity }}%</span>
        <button class="widget-button" @click="emitAdjust(5)">+</button>
      </div>
    </div>
  </div>
</template>

<script>
import { initGaugeChart, getDynamicColor } from '../utils/gaugeUtils';

export default {
  name: 'HumidityWidget',
  props: {
    humidity: {
      type: Number,
      default: 0
    },
    targetHumidity: {
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
      gaugeInstance: null
    };
  },
  mounted() {
    this.initGauge();
  },
  watch: {
    humidity(newVal) {
      this.updateGauge(newVal, this.targetHumidity);
    },
    targetHumidity(newVal) {
      this.updateGauge(this.humidity, newVal);
    }
  },
  methods: {
    //Diese Methode emit’t ein Event, damit der Parent (RoomDetail) den Zielwert ändern kann.
    emitAdjust(change) {
      this.$emit('adjust-target-humidity', change);
    },
    initGauge() {
      this.$nextTick(() => {
        const offsets = {
          humidityGauge: this.offset
        };
        // gaugeInstance speichern, um später updaten zu können
        this.gaugeInstance = initGaugeChart(
          this.$refs, // DOM-Refs
          { humidityGauge: this.gaugeInstance }, // gaugeInstances, dummy
          'humidityGauge', // refName
          this.humidity, 
          this.targetHumidity, 
          this.minValue,
          this.maxValue,
          '°C',
          getDynamicColor,
          offsets
        );
      });
    },

    //Updated die Daten des Gauges (aktueller Wert + Zielwert).
    updateGauge(value, target) {
      if (!this.gaugeInstance) return;
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
.gauge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 250px;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;
}
.set-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.gauge {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}
</style>