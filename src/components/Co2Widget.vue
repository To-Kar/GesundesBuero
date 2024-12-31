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

.control-co2-overlay {
  position: absolute;
  bottom: 14px;
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