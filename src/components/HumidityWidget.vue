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
          '%',
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


<style scoped>
.widget {
  background-color: #f9f9f9;
  border-radius: 18px;
  box-shadow: 2px 4px 12px #00000014;
  width: 340px;
  height: 340px;
  text-align: center;
  position: relative;
}

.widget-title {
  font-size: 26px;
  line-height: 30.8px;   
  font-weight: 700;       
  color: black; 
}

.widget-value {
  font-size: 22px;
  line-height: 30.8px;   
  font-weight: 700;       
  color: black; 
}

.control-overlay {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  bottom: 30px;
  z-index: 2;
}

.gauge-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 100px);
  padding: 0 12px;
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
  padding: 0px 24px;
}

.target {
  font-size: 22px;
  line-height: 30.8px;   
  font-weight: 700;
  color: #0083bc;
}

.set-value {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Buttons */
button {
  background-color: #0083bc;
  color: whitesmoke;
  border: none;
  cursor: pointer;
  font-size: 22px;
  font-weight: 700;
  margin: 12px;
  transition: all .3s cubic-bezier(0, 0, .5, 1);
}

button:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
}
</style>