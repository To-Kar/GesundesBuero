import * as echarts from 'echarts';

// ECharts Initialisierung
export function initGaugeChart(refs, gaugeInstances, refName, value, targetValue, min, max, unit, getDynamicColor, offsets) {
  console.log(`Gauge init: ${refName} - Wert: ${value}, Ziel: ${targetValue}`);
  
  const gaugeElement = refs[refName];
  if (!gaugeElement) {
    console.log(`Ref ${refName} ist nicht verfügbar`);
    return;
  }

  const chart = echarts.init(gaugeElement);

  const option = {
    series: [
      {
        name: 'Aktueller Wert',
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: min,
        max: max,
        radius: '100%',
        center: ['50%', '65%'],
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 22,
            color: [[1, 'rgba(224, 224, 224, 1)']]
          }
        },
        pointer: { show: false },
        progress: {
          show: true,
          width: 22,
          roundCap: true,
          itemStyle: {
            color: getDynamicColor(value, targetValue, offsets[refName])
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          show: false,
          formatter: `{value}${unit}`,
          fontSize: 24,
          offsetCenter: [0, '0%'],
          color: '#333',
          fontWeight: 'bold'
        },
        data: [{ value: value }]
      },
      {
        name: 'Zielwert',
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: min,
        max: max,
        radius: '80%',
        center: ['50%', '65%'],
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 7,
            color: [[1, 'rgba(224, 224, 224, 1)']]
          }
        },
        pointer: { show: false },
        progress: {
          show: true,
          width: 7,
          roundCap: true,
          itemStyle: {
            color: getGaugeColor(refName)
          }
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        data: [{ value: targetValue }]
      }
    ]
  };

  chart.setOption(option);
  gaugeInstances[refName] = chart;
}


export function initCo2Gauge(refs, gaugeInstances, co2, getCo2GaugeColor) {
    const gaugeElement = refs.co2Gauge;
    if (!gaugeElement) return;
  
    const chart = echarts.init(gaugeElement);
  
    const option = {
      series: [
        {
          name: 'CO₂-Wert',
          type: 'gauge',
          startAngle: 220,
          endAngle: -40,
          min: 0,
          max: 2000,
          radius: '90%',
          center: ['50%', '60%'],
          axisLine: {
            roundCap: true,
            lineStyle: {
              width: 16,
              color: getCo2GaugeColor(co2)
            }
          },
          pointer: {
            length: '100%',
            width: 6,
            itemStyle: {
              color: '#666',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          progress: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            show: false,
            formatter: '{value} ppm',
            fontSize: 22,
            offsetCenter: [0, '60%'],
            color: '#333',
            fontWeight: 'bold'
          },
          data: [{ value: co2 || 0 }]
        }
      ]
    };
  
    chart.setOption(option);
    gaugeInstances['co2Gauge'] = chart;
  
    // Aktualisieren der Linie bei Änderungen von co2
    return (newValue) => {
      chart.setOption({
        series: [
          {
            axisLine: {
              lineStyle: {
                color: getCo2GaugeColor(newValue)
              }
            },
            data: [{ value: newValue || 0 }]
          }
        ]
      });
    };
  }

  
  export function getCo2GaugeColor(value) {
    console.log('außerhalb',value)
    if (value === null || value === undefined || value === 'N/A') {
      console.log(value)
      return [
        [1, '#ddd']  // Die gesamte Linie wird grau (ohne Verlauf)
      ];
    }
    return [
      [1, {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'rgb(0, 204, 102)' },  
          { offset: 0.2, color: 'rgb(102, 255, 102)' }, 
          { offset: 0.35, color: 'rgb(255, 239, 130)' },  
          { offset: 0.5, color: 'rgb(255, 215, 0)' },  
          { offset: 0.65, color: 'rgb(255, 165, 0)' },  
          { offset: 0.85, color: 'rgb(255, 99, 71)' },  
          { offset: 1, color: 'rgb(205, 92, 92)' }
        ]
      }]
    ];
  }

 export function getDynamicColor(value, target, offset) {
    const lowerThreshold = target - offset;
    const upperThreshold = target + offset;
    console.log('Wert Offset:', offset);
  
  
    if (value < lowerThreshold) {
      // Farbverlauf für kälter als Zielwert (Blau -> Grün)
      return {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'rgb(0, 102, 255)' },  // Dunkelblau
          { offset: 1, color: 'rgb(173, 216, 230)' } // Hellblau
        ]
      };
    }
    
    if (value > upperThreshold) {
      // Farbverlauf für wärmer als Zielwert (Gelb -> Rot)
      return {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'rgb(255, 180, 130)' },  // Orange
          { offset: 1, color: 'rgb(230, 97, 76)' }     // Rot
        ]
      };
    }
  
    // Grün für innerhalb des Zielbereichs (statisch oder leicht verlaufend)
    return {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 1,
      y2: 0,
      colorStops: [
        { offset: 0, color: 'rgb(76, 175, 80)' },  // Dunkelgrün
        { offset: 1, color: 'rgb(152, 251, 152)' } // Hellgrün
      ]
    };
  }

  export function getGaugeColor(refName) {
    if (refName === 'temperatureGauge') {
      return {
        type: 'linear',
        x: 0.3,
        y: 0.7,
        x2: 1,
        y2: 1.4,
        colorStops: [
          { offset: 0, color: 'rgb(173, 216, 230)' },
          { offset: 0.1, color: 'rgb(152, 251, 152)' },
          { offset: 0.4, color: 'rgb(255, 239, 130)' },
          { offset: 0.5, color: 'rgb(255, 180, 130)' },
          { offset: 1, color: 'rgb(230, 97, 76)' }
        ]
      };
    } else if (refName === 'humidityGauge') {
      return {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 1,
        y2: 0,
        colorStops: [
          { offset: 0, color: 'rgb(192, 230, 255)' },
          { offset: 0.5, color: 'rgb(100, 200, 255)' },
          { offset: 1, color: 'rgb(0, 100, 200)' }
        ]
      };
    }
    return 'rgb(224, 224, 224)';
  }


  export function disposeGauges(gaugeInstances) {
    Object.keys(gaugeInstances).forEach((key) => {
      if (gaugeInstances[key]) {
        gaugeInstances[key].dispose();
        delete gaugeInstances[key];
      }
    });
  }
  