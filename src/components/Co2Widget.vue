<template>
  <div class="widget">
    <h2 class="widget-title">CO₂-Gehalt</h2>
    <div class="gauge-container">
      <div ref="co2Gauge" class="gauge"></div>
    </div>
    <div class="control-co2-overlay">
      <h3 class="widget-value">{{ co2Display }}</h3>
    </div>
  </div>
</template>

<script>
import { initCo2Gauge, getCo2GaugeColor } from '../utils/gaugeUtils';

export default {
  name: 'Co2Widget',
  props: {
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
      updateFn: null
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
        this.updateFn = initCo2Gauge(
          this.$refs,
          { co2Gauge: this.gaugeInstance },
          this.co2,
          getCo2GaugeColor
        );
      });
    },
    updateGauge(newVal) {
      if (this.updateFn) {
        this.updateFn(newVal);
      }
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

.control-co2-overlay {
  position: absolute;
  bottom: 12px;
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
</style>