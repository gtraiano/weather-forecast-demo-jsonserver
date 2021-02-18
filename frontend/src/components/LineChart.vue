<!--
  Copyright (c) 2019

  Chart component, uses vue chart.js to plot meteorological data

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<script>
import { Line, mixins } from 'vue-chartjs' // We specify what type of chart we want from vue-chartjs and the mixins module
const { reactiveProp } = mixins
import moment from 'moment'
import elLocale from 'moment/locale/el'

/*
  Inside the chartData prop, we may pass the following properties:

    Name        Type      Action 
    ---------------------------------------------------------------------
    title       string    sets the plot title
    variable    string    sets the plot y-axis label
    locale      string    converts x-axis dates according to given locale
*/

export default {
    extends: Line,
    mixins: [reactiveProp],
    props: {
        scale: { // plot scale factor (used for zooming)
            type: Number,
            required: false,
            default: 1.0
        },

        maintainAspectRatio: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data () {
        return {
            options: {
                scales: { // axes
                    yAxes: [
                        { // variable (temperature pressure etc.) axis
                            scaleLabel: {
                                display: true,
                                labelString: this.chartData.variable
                            },
                            /*ticks: { // better left to be calculated automatically
                                //beginAtZero: true,
                                //stepSize: 1
                            },*/
                            gridLines: {
                                display: true
                            }
                        }
                    ],
                    xAxes: [
                        { // hour axis
                            type: 'time',
                            time: {
                                unit: 'hour',
                                displayFormats: {
                                    hour: 'HH:mm'
                                }
                            },
                            gridLines: {
                                display: false
                            }
                      },
                      { // date axis
                          type: 'time',
                          time: {
                              unit: 'day',
                              parser: dt => { // change date locale
                                  moment.locale(this.chartData.locale)
                                  return dt
                              }
                          },
                          ticks: {
                              fontStyle: 'bold'
                          },
                          gridLines: {
                              zeroLineColor: 'rgba(0, 0, 0, 0.1)'
                          }
                      }
                  ]
                },
                title: {
                    display: this.chartData.title ? true : false,
                    //text: this.chartData.title ? this.chartData.title : null,
                    fontSize: 14,
                    padding: 6
                },
                legend: {
                    display: false
                },
                responsive: true,
                maintainAspectRatio: this.maintainAspectRatio,
                devicePixelRatio: this.scale*window.devicePixelRatio, // take display scaling into account (https://stackoverflow.com/questions/46791052/detect-scale-settings-dpi-with-javascript-or-css)
                animation: {
                },
                elements: {
                    point: {
                    }
                }
            }
        }
    },

    methods: {
        scaleTooltip (scale) {
        /* set tooltip options according to scale */
            return {
                // default values divided by scale (https://www.chartjs.org/docs/latest/configuration/tooltip.html)
                titleFontSize: (12 / scale)*window.devicePixelRatio,
                bodyFontSize:  (12 / scale)*window.devicePixelRatio,
                titleSpacing: (2 / scale)*window.devicePixelRatio,
                titleMarginBottom: (6 / scale)*window.devicePixelRatio,
                bodySpacing: (2 / scale)*window.devicePixelRatio,
                footerSpacing: (2 / scale)*window.devicePixelRatio,
                footerMarginTop: (6 / scale)*window.devicePixelRatio,
                xPadding: (6 / scale)*window.devicePixelRatio,
                yPadding: (6 / scale)*window.devicePixelRatio,
                caretPadding: (2 / scale)*window.devicePixelRatio,
                caretSize: (5 / scale)*window.devicePixelRatio,
                cornerRadius: (6 / scale)*window.devicePixelRatio
            }
        },

        exportImage(scale) {
            /* export scaled canvas image to base64 string */
            let oldDuration = this.options.animation.duration || Chart.defaults.global.animation.duration
            let oldRadius = this.options.elements.point.radius || Chart.defaults.global.elements.point.radius
            
            this.options.devicePixelRatio = scale*window.devicePixelRatio // scale canvas
            this.options.animation.duration = 0 // disable animation (otherwise we get blank image)
            this.options.elements.point.radius = 0 // hide points
            this.renderChart(this.chartData, this.options)
            //let uri = this.$refs.canvas.toDataURL("image/png")
            let uri = this.$data._chart.toBase64Image()
            
            /* restore options and chart */
            this.options.devicePixelRatio = this.scale*window.devicePixelRatio
            this.options.animation.duration = oldDuration
            this.options.elements.point.radius = oldRadius
            this.options.tooltips = this.scaleTooltip(this.scale*window.devicePixelRatio)
            this.renderChart(this.chartData, this.options)

            return uri
        },

        breakText: (text, limit, fontSize) => {
            if(!text) return [];
            let out = [];
            let acc = '';
            let words = text.split(' ');
          
            for(const word of words) {
                if((acc.length + word.length)*fontSize <= limit) {
                  acc = acc ? `${acc} ${word}` : `${word}`
                }
                else {
                  out.push(acc);
                  acc = `${word}`;
                }
            }
            out.push(acc);
            return out;
        }
    },

    watch: {
        chartData () { // options are not reactive, so we use a watcher
            let newOptions = { ...this.options }
            
            newOptions.devicePixelRatio = this.scale*window.devicePixelRatio // scaling factor
            newOptions.scales.yAxes[0].scaleLabel.labelString = this.chartData.variable // update y-axis variable label
            newOptions.title.text = this.chartData.title // update plot title

            newOptions.tooltips = this.scaleTooltip(this.scale*window.devicePixelRatio)
            
            this.renderChart(this.chartData, newOptions) // render anew
        },

        scale () {
            let newOptions = { ...this.options }
            
            newOptions.devicePixelRatio = this.scale*window.devicePixelRatio // set scaling factor
            newOptions.responsiveAnimationDuration = 0 // disable animations when scaling
            newOptions.animation = { duration : 0 }

            newOptions.tooltips = this.scaleTooltip(this.scale*window.devicePixelRatio)
            
            this.renderChart(this.chartData, newOptions) // render anew
        }
    },

    mounted () {
        this.options.title.text = this.chartData.title ? this.breakText(this.chartData.title, this.width, this.options.title.fontSize) : null;
        this.renderChart(this.chartData, this.options)
    }
}
</script>