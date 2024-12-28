import * as echarts from 'echarts';
import VChart from 'vue-echarts';

// Globales ECharts Plugin
export default {
  install(app) {
    app.component('v-chart', VChart);
  }
};
