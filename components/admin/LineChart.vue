<template>
  <div class="h-64">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const props = defineProps({
  data: Array,
  color: { type: String, default: '#3b82f6' }
})

const chartRef = ref(null)
let chartInstance = null

onMounted(() => {
  const ctx = chartRef.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.data.map(item => item.label),
      datasets: [{
        data: props.data.map(item => item.value),
        borderColor: props.color,
        backgroundColor: props.color + '20',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { grid: { display: false } }
      }
    }
  })
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>