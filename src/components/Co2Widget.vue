<template>
    <div class="widget">
      <h2 class="widget-title">CO₂-Gehalt</h2>
      <div class="gauge-container">
        <!-- Ganz wichtig: ref="co2Gauge" damit der Parent später initCo2Gauge() aufrufen kann. -->
        <div ref="co2Gauge" class="gauge"></div>
      </div>
      <div class="control-co2-overlay">
        <!-- Zeigt den aktuellen CO2-Wert an (oder 'N/A') -->
        <h3 class="widget-value">{{ co2Display }}</h3>
      </div>
    </div>
  </template>
  
  <script>
  import { initCo2Gauge, getCo2GaugeColor } from '../utils/gaugeUtils';

  export default {
    name: 'Co2Widget',
    props: {
      /** Aktueller CO2-Wert (ppm) **/
      co2: {
        type: Number,
        default: 0
      },
      maxValue: {
        type: Number,
        default: 2000
        }
    },
    data() {
    return {
      gaugeInstance: null,
      updateFn: null // Falls du die Rückgabe von initCo2Gauge speichern möchtest
    };
  },
  computed: {
    co2Display() {
      return this.co2 !== null ? this.co2 + ' ppm' : 'N/A';
    }
  },
  mounted() {
    this.initGauge();
  },
  watch: {
    co2(newVal) {
      this.updateGauge(newVal);
    }
  },
  methods: {
    initGauge() {
      this.$nextTick(() => {
        // initCo2Gauge gibt oft eine update-Funktion zurück
        this.updateFn = initCo2Gauge(
          this.$refs,
          { co2Gauge: this.gaugeInstance },
          this.co2,
          getCo2GaugeColor
        );
      });
    },
    updateGauge(newVal) {
      // Nur wenn initCo2Gauge() erfolgreich war:
      if (this.updateFn) {
        this.updateFn(newVal);
      }
    }
  }
};
  </script>
  
  <style scoped>

  
  .control-co2-overlay {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 2;
  }
  </style>
  