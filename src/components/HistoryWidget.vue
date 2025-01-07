<template>
  <div class="history-widget">
    <h3 class="widget-title">Historische Daten</h3>
    <!-- Navigation für Diagramme -->
    <div class="chart-navigation">
      <button v-for="chart in charts" :key="chart.name" @click="currentChart = chart.name" :class="{ active: currentChart === chart.name }">
        {{ chart.label }}
      </button>
    </div>

    <!-- Navigation für Zeitintervalle -->
    <div class="time-navigation">
<button
  v-for="interval in intervals"
  :key="interval.name"
  @click="setInterval(interval)"
  :class="{ active: selectedInterval?.name === interval.name }"
>
  {{ interval.label }}
</button>
</div>

    <div ref="chart" class="chart"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import { historyService } from "../services/historyService";

export default {
  props: {
    roomId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      chart: null,
      currentChart: "temperature", // Standardmäßig Temperatur-Chart
      selectedInterval: null, // Ausgewähltes Zeitintervall
      charts: [
        { name: "temperature", label: "Temperatur" },
        { name: "humidity", label: "Luftfeuchtigkeit" },
        { name: "co2", label: "CO₂" },
      ],
      intervals: [
        { name: "1year", label: "1 Jahr", duration: 365 * 24 * 60 * 60 * 1000 },
        { name: "6months", label: "6 Monate", duration: 6 * 30 * 24 * 60 * 60 * 1000 },
        { name: "1month", label: "1 Monat", duration: 30 * 24 * 60 * 60 * 1000 },
        { name: "7days", label: "7 Tage", duration: 7 * 24 * 60 * 60 * 1000 },
        { name: "1day", label: "24h", duration: 1 * 24 * 60 * 60 * 1000, hourly: true },
      ],
    };
  },
  methods: {
    setInterval(interval) {
      this.selectedInterval = interval;
      this.fetchData(); // Daten neu laden
    },
    async fetchData() {
  if (!this.selectedInterval) {
    this.selectedInterval = this.intervals[3]; // Standard auf 7 Tage setzen
  }

  const now = new Date();
const endDate = new Date(now.getTime() + (60 * 60 * 1000)).toISOString(); // UTC+1 (60 Minuten hinzufügen)
const startDate = new Date(
  new Date(endDate).getTime() - this.selectedInterval.duration
).toISOString();

console.log("StartDate (UTC+1):", startDate);
console.log("EndDate (UTC+1):", endDate);

  try {
    const data = await historyService.fetchRoomHistory(
      this.roomId,
      startDate,
      endDate,
      this.selectedInterval.hourly
    );

    if (!Array.isArray(data) || data.length === 0) {
      this.renderChart([]); // Leeres Diagramm rendern
      return;
    }

    const aggregatedData = this.getAggregatedData(data);
    this.renderChart(aggregatedData);
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
    this.renderChart([]);
  }
},

isMobileView() {
  return window.innerWidth <= 768; // Grenze für Handy-Ansicht
},


getAggregatedData(data) {
let targetPoints = data.length; // Standard: Keine Aggregation

// Aggregationslogik basierend auf dem ausgewählten Zeitintervall
if (this.selectedInterval.name === "1year") {
  targetPoints = 30; // 1 Jahr -> 365 Punkte
} else if (this.selectedInterval.name === "6months") {
  targetPoints = 30; // 6 Monate -> 180 Punkte
} else if (this.selectedInterval.name === "1month") {
  targetPoints = 30; // 1 Monat -> 30 Punkte
} else if (this.selectedInterval.name === "7days") {
  targetPoints = 30; // 1 Woche -> 21 Punkte
}

if (data.length > targetPoints) {
  return this.aggregateData(data, targetPoints);
}

return data; // Keine Aggregation erforderlich
},


aggregateData(data, targetPoints) {
const factor = Math.ceil(data.length / targetPoints); // Aggregationsfaktor

return data.reduce((result, _, index) => {
  if (index % factor === 0) {
    // Gruppiere und berechne Mittelwert
    const group = data.slice(index, index + factor);
    const averageEntry = {
      timestamp: group[0].timestamp, // Nimm den ersten Zeitstempel
      temperature: group.reduce((sum, entry) => sum + entry.temperature, 0) / group.length,
      humidity: group.reduce((sum, entry) => sum + entry.humidity, 0) / group.length,
      co2: group.reduce((sum, entry) => sum + entry.co2, 0) / group.length,
    };
    result.push(averageEntry);
  }
  return result;
}, []);
},





renderChart(data) {
if (!this.chart) {
  this.chart = echarts.init(this.$refs.chart);
} else {
  this.chart.clear(); // Entfernt alten Inhalt
}

let timestamps = [];
let seriesData = [];
let chartTitle = "";

if (this.selectedInterval?.hourly) {
  // Stündliche Ansicht (letzte 24 Stunden)
  const now = new Date();
  const hourlyTimestamps = Array.from({ length: 24 }).map((_, i) => {
    const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000); // Letzte 24 Stunden
    return date.toLocaleTimeString("de-DE", { hour: "2-digit" }); // Nur Stunden
  });

  timestamps = hourlyTimestamps;

  // Mappe Daten auf die stündlichen Zeitstempel
  seriesData = hourlyTimestamps.map((timestamp) => {
    const entry = data.find((d) => {
      const dataTime = new Date(d.timestamp).toLocaleTimeString("de-DE", {
        hour: "2-digit",
      });
      return dataTime === timestamp;
    });
    return entry ? entry[this.currentChart] : null; // Fehlende Werte werden als `null` dargestellt
  });
} else {
  
  timestamps = data.map((entry) => {
    const date = new Date(entry.timestamp);
    return date.toLocaleDateString("de-DE");
  });

  seriesData = data.map((entry) => entry[this.currentChart]);
}

if (this.currentChart === "temperature") {
  chartTitle = "Temperaturverlauf in °C";
} else if (this.currentChart === "humidity") {
  chartTitle = "Luftfeuchtigkeitsverlauf in %";
} else if (this.currentChart === "co2") {
  chartTitle = "CO₂-Verlauf in ppm";
}

console.log("Timestamps für Chart:", timestamps);
console.log("Series Data:", seriesData);

// Chart-Optionen
const option = {
title: {
  text: chartTitle,
  left: "center",
},
xAxis: {
  type: "category",
  data: timestamps, // Zeitstempel (stunden- oder tageweise)
  boundaryGap: false,
  axisLabel: {
    interval: this.selectedInterval?.hourly
      ? this.isMobileView() ? 1 : 0 // Alle 2 Stunden in Handy-Ansicht, sonst jede Stunde
      : "auto", // Automatische Anzeige für andere Intervalle
    rotate: this.selectedInterval?.hourly ? 45 : 0, // Labels rotieren, falls stündlich
  },
},

yAxis: {
  type: "value",
  name: "Wert",
  boundaryGap: [0, "10%"],
  min: this.currentChart === "temperature" ? 15
        : this.currentChart === "humidity" ? 10 
        : this.currentChart === "co2" ? 100 
        : null, // Dynamischer Startwert
  max: this.currentChart === "temperature" ? 30 
        : this.currentChart === "humidity" ? 90 
        : this.currentChart === "co2" ? 1800 
        : null, // Dynamischer Endwert
},
grid: {
  left: this.isMobileView() ? "12.6%" : "10%",
  right: "10%",
  top: "20%",
  bottom: "15%",
},
series: [
  {
    name: this.currentChart,
    type: "line",
    data: seriesData,
    smooth: true,
    lineStyle: {
      width: 2,
    },
    itemStyle: {
      color: "#0083bc",
    },
  },
],
};

this.chart.setOption(option);
},




    resizeChart() {
      if (this.chart) {
        this.chart.resize();
      }
    },
  },
  watch: {
    currentChart() {
      this.fetchData();
    },
  },
  mounted() {
    this.selectedInterval = this.intervals[3]; // Standard: 7 Tage
    this.fetchData();
    window.addEventListener("resize", this.resizeChart);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resizeChart);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
};
</script>

<style scoped>
.history-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: auto;
  height: 100%;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 18px;
  box-shadow: 2px 4px 12px #00000014;
}

.chart {
  width: 100%;
  height: 400px; /* Feste Höhe für das Diagramm */
}

.chart-navigation,
.time-navigation {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  flex-wrap: wrap; /* Für mobile Ansicht */
}

.chart-navigation button,
.time-navigation button {
  background: #ddd;
  border: none;
  padding: 8px 16px;
  margin: 5px;
  cursor: pointer;
  font-size: 14px;
  line-height: 19.6px;
  letter-spacing: 0.007em; 
  font-weight: 400;
  border-radius: 4px;
  flex: 1; /* Gleichmäßige Verteilung */
  text-align: center;
}

.chart-navigation button.active,
.time-navigation button.active {
  background: #0083bc;
  color: white;
  font-weight: bold;
}
.widget-title{
  font-size: 26px;
  line-height: 30.8px;   
  font-weight: 700;       
  color: black;
}

@media screen and (max-width: 920px) {
  .history-widget {
    width: 100%;
    padding: 10px;
  }

  .chart-navigation button,
  .time-navigation button {
    font-size: 12px;
    padding: 6px 8px;
  }

  .chart {
    height: 300px; /* Kleinere Höhe für mobile Ansicht */
  }
}
</style>
