<!--
  Copyright (c) 2019-2020

  Wrapper for LineChart element to work with Promises

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->
<template>
    <line-chart
        v-if="loaded"
        :chart-data="data"
        :scale="scale"
    />
</template>

<script>
import LineChart from './LineChart.vue'

export default {
    name: 'LineChartAsync',
    props: {
        chartData: {
            type: Promise
        },

        scale: { // plot scale factor (used for zooming)
            type: Number,
            required: false,
            default: 1.0
        },

        maintainAspectRatio: {
            type: Boolean,
            required: false,
            default: false
        },
    },
  
  components: { LineChart },
  
  data: () => ({
      loaded: false,
      data: null
  }),

  watch: {
      async chartData(newValue, oldValue) {
          this.loaded = false
          try {
              this.data = await newValue
              this.loaded = true
          }
          catch(e) {
              console.error(e)
          }
      },

      scale(newValue, oldValue) {
          console.log(newValue);
      }
  },
  
  async mounted () {
      this.loaded = false
      try {
          this.data = await this.chartData
          this.loaded = true
      }
      catch (e) {
          console.error(e)
      }
  }
}
</script>
