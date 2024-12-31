<template>
    <div class="widget">
      <h2 class="widget-title">Temperatur</h2>
      <div class="gauge-container">
        <div ref="temperatureGauge" class="gauge"></div>
      </div>
      <div class="control-overlay">
        <h3 class="widget-value">{{ temperature }}°C</h3>
        <div class="set-value">
          <button 
            class="widget-button" 
            :disabled="disableButtons"
            @click="adjustTemperature(-1)"
          >−</button>
          <span class="target">{{ targetTemperature }}°C</span>
          <button 
            class="widget-button" 
            :disabled="disableButtons"
            @click="adjustTemperature(1)"
          >+</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { initGaugeChart, getDynamicColor } from '../utils/gaugeUtils';
  
  export default {
    props: {
      temperature: {
        type: Number,
        required: true
      },
      targetTemperature: {
        type: Number,
        required: true
      },
      offset: {
        type: Number,
        default: 2
      }
    },
    data() {
      return {
        gaugeInstance: null,
        debounceTimeoutTemp: null,
        disableButtons: false
      };
    },
    mounted() {
      this.initGauge();
    },
    watch: {
      temperature(newVal) {
        this.updateGauge(newVal, this.targetTemperature);
      },
      targetTemperature(newVal) {
        this.updateGauge(this.temperature, newVal);
      }
    },
    beforeUnmount() {
      this.disposeGauge();
    },
    methods: {
        initGauge() {
      this.$nextTick(() => {
        const offsets = { temperatureGauge: this.offset };
        this.gaugeInstance = initGaugeChart(
          this.$refs,
          { temperatureGauge: this.gaugeInstance },
          'temperatureGauge',
          this.temperature,
          this.targetTemperature,
          10,
          30,
          '°C',
          getDynamicColor,
          offsets
        );
        
        // Event an RoomDetail senden, um Gauge zu speichern
        this.$emit('register-gauge', 'temperatureGauge', this.gaugeInstance);
      });
    },

    disposeGauge() {
      if (this.gaugeInstance) {
        this.gaugeInstance.dispose();
        this.gaugeInstance = null;
      }
    },

      updateGauge(value, targetValue) {
        console.log('[TemperatureWidget] updateGauge: ', value, targetValue);
        if (this.gaugeInstance) {
          const dynamicColor = getDynamicColor(value, targetValue, this.offset);
          this.gaugeInstance.setOption({
            series: [
              {
                data: [{ value }],
                progress: {
                  itemStyle: {
                    color: dynamicColor
                  }
                }
              },
              {
                data: [{ value: targetValue }]
                
              }
            ]
          });
        }
      },
      adjustTemperature(change) {
        if (this.disableButtons) return;
  
        let newTarget = this.targetTemperature + change;
        newTarget = Math.max(10, Math.min(newTarget, 30));
  
        // Event senden, um Parent zu informieren
        this.$emit('update:targetTemperature', newTarget);
        
        this.updateGauge(this.temperature, newTarget);
  
        this.disableButtons = true;
        
        if (this.debounceTimeoutTemp) {
          clearTimeout(this.debounceTimeoutTemp);
        }
  
        // API-Call über Parent verzögert auslösen
        this.debounceTimeoutTemp = setTimeout(() => {
          this.$emit('save-target', newTarget);  // API-Call durch RoomDetail
          this.disableButtons = false;
        }, 500);
      },
      disposeGauge() {
        if (this.gaugeInstance) {
          this.gaugeInstance.dispose();
          this.gaugeInstance = null;
        }
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
  
  
  .widget-button{
  
  
  border-radius: 50px;
  }
  
  
  
  
  
  
  .disabled-button {
    color: hsl(0, 0%, 50%);
    cursor: not-allowed !important;
    pointer-events: none !important;
    background-color: #ccc !important;
  }
  
  </style>
  
  