<!--
  Copyright (c) 2019

  Detailed forecasts page

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
    <b-container fluid>
        <b-row align-v="center">
            <b-col cols="1"/>
            
            <b-col
                cols="1"
                :style="{textAlign: 'left'}"
            >
                <b-button-group>
                    <!-- table varaible -->
                    <Controls
                        :variables="variables"
                        :selectedVariable="selectedVar"
                        v-on:selected_var="selectedVar = $event;"
                    />
                    <!-- table settings -->
                    <b-dropdown size="sm">
                        <template #button-content>
                            {{$t('options')}}
                        </template>
                        <!-- forecast columns # -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('table columns')}}</label>
                            <b-form-spinbutton
                                inline
                                :value="overviewColumns"
                                size="sm"
                                min="1"
                                max="48"
                                @change="overviewColumns = $event"
                            />
                        </b-dropdown-form>
                        <!-- forecast columns period -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('period')}}</label>
                            <b-form-spinbutton
                                inline
                                :value="overviewPeriod"
                                size="sm"
                                min="1"
                                max="24"
                                @change="overviewPeriod = $event"
                            />
                        </b-dropdown-form>
                    </b-dropdown>
                </b-button-group>
            </b-col>

            <b-col cols="8">
                <h3>{{$t('overview')}}</h3>
            </b-col>
            
            <b-col cols="1"/>
        </b-row>
        
        <b-row>    
        </b-row>

        <!-- forecast overview table -->
        <b-row
            md="12"
            class="mt-4 mb-4"
        >
            <b-col/>
            
            <!-- forecasts table renders only if cityData is populated -->
            <transition name="fade-overview-table">
                <b-col
                    v-if="cityData && cityData.length"
                    cols="10"
                    key="overviewTable"
                >
                    <b-row>
                        <!-- filter input -->
                        <b-col cols="2">
                            <div>
                                <b-input-group
                                    size="sm"
                                    class="mb-1"
                                >
                                    <b-form-input
                                        :value="tableFilter"
                                        :placeholder="$t('filter')"
                                        :debounce="filterDebounce"
                                        trim
                                        @update="tableFilter = $event"
                                        :style="{ 'border-right': !tableFilter ? '' : 'none' }"
                                    />
                                    <b-input-group-append v-if="tableFilter">
                                        <b-input-group-text style="background-color: white; border-left: none; cursor: pointer;">
                                            <b-icon-x @click="tableFilter = null" />
                                        </b-input-group-text>
                                    </b-input-group-append>
                                </b-input-group>
                            </div>
                        </b-col>
                        <!-- table title -->
                        <b-col
                            cols="8"
                            style="vertical-align: middle"
                        >
                            <h5>{{tableTitle}}</h5>
                        </b-col>
                    </b-row>
                    <!-- forecasts table -->
                    <transition name="resize">
                        <b-row :style="tableStyle">
                            <b-col cols="12" :style="tableStyle">
                                <ForecastsTableCustom
                                    :forecastData="cityData"
                                    :tableItems="tableCells"
                                    :tableFields="tableHeader"
                                    :selectedRow="selectedCity"
                                    :tableStyle="tableStyle"
                                    :tableFilter="tableFilter"
                                    @selectedRowUpdate="(index, value) => { $emit('selectedRowUpdate', index, value); }"
                                    @sortingChanged="value => { $emit('sortingChanged', value) }"
                                    @showPlot="$emit('showPlot');"
                                    @showDetailedForecast="$emit('showDetailedForecast')"
                                    @filterChanged="index => $emit('filterChanged', index)"
                                    ref="table"
                                />
                            </b-col>
                        </b-row>
                    </transition>
                </b-col>
                <!-- otherwise display no forecasts message -->
                <b-col
                    v-else
                    key="noForecast"
                    cols="10"
                >
                    <h3>{{ $t('no forecasts') }}</h3>
                </b-col>
            </transition>
            
            <b-col/>
        </b-row>
        
        <!-- detailed forecast -->
        <transition name="fade"
            v-on:before-leave="beforeLeave"
            v-on:after-leave="afterLeave"
        >
            <b-container
                v-if="selectedCity !== -1 && showDetailedForecast"
                fluid
                style="min-height: 47vh;"
            >
                <b-row>
                    <b-col cols="2"/>

                    <b-col cols="8">
                        <h4>{{cityData[selectedCity].name[this.$i18n.locale]}}</h4>
                    </b-col>
                    <b-col cols="1" class="pr-0">
                          <b-button-close @click="showPlot ? showDetailedForecast = false : selectedCity = -1; showDetailedForecast = false;" />
                    </b-col>
                    
                    <b-col/>
                </b-row>
                
                <b-row>
                    <b-col/>
                    
                    <b-col cols="10">
                        <DetailedForecast
                            :lat="cityData[selectedCity].coords.lat"
                            :lon="cityData[selectedCity].coords.lon"
                            :perPage=6
                            :paginated="preferences.frontend.detailedForecastStyle === 'paginated' ? true : false"
                        />
                    </b-col>
                    
                    <b-col/>
                </b-row>
            </b-container>
        </transition>

        <!-- forecast variable plot -->
        <transition
            name="fade"
            v-on:before-leave="beforeLeave"
            v-on:after-leave="afterLeave"
        >
            <b-container
                v-if="selectedCity !== -1 && showPlot"
                fluid
            >
                <b-row class="pb-2">
                    <b-col/>
                    
                    <b-col
                        cols="1"
                        :style="{textAlign: 'left'}"
                    >
                        <!-- plot timeline duration control -->
                        <b-form-spinbutton
                            :value="endHours"
                            min="1"
                            max="48"
                            size="sm"
                            inline
                            @change="endHours = $event"
                        />
                        <span>{{ $t('hours') }}</span>
                    </b-col>
                    
                    <b-col cols="8">
                        <h4>
                            {{ $t('plot for') }} {{ cityData[selectedCity].name[$i18n.locale] }}
                        </h4>
                    </b-col>
                    
                    <b-col class="pr-0">
                        <!-- container close button -->
                        <b-button-close @click="showDetailedForecast ? showPlot = false : selectedCity = -1; showPlot = false;" />
                    </b-col>
                    
                    <b-col/>
                </b-row>
                
                <b-row>
                    <b-col/>
                    
                    <b-col cols="10">
                        <!-- actual plot -->
                        <LineChartAsync :chartData="preparePlotData(endHours, selectedVar)" />
                    </b-col>
                    
                    <b-col/>
                </b-row>
            </b-container>
        </transition>

    </b-container>
</template>

<script>
import Controls from './Controls.vue'
import LineChart from './LineChart.vue'
import { mapGetters } from 'vuex'
import DetailedForecast from './DetailedForecast.vue'
import LineChartAsync from './LineChartAsync.vue'
import ForecastsTableCustom from './ForecastsTableCustom.vue'
import { BIconX } from 'bootstrap-vue'

const hoursPassed = (end, start) => {
    return Math.floor((end - start)/3600000);
}

export default {
  name: 'Forecasts',

  data() {
      return {
          variables: ['temperature', 'humidity', 'pressure'],
          selectedVar: 'temperature',
          selectedCity: -1, // index of city in cityData
          selectedCityIndexSorted: -1,
          endHours: 48, // timeline duration in hours for plot
          tableSorted: 0, // forecasts table is sorted
          tableStyle: { minHeight: '70vh', maxHeight: '70vh' }, // table css styling
          showPlot: false,
          showDetailedForecast: false,
          overviewColumns: 8, // number of forecast columns in overview table
          overviewPeriod: 4, // hours between forecast columns
          tableFilter: null, // string to filter table by
          filterDebounce: 250 // filter input debounce (in ms)
      }
  },

  components: {
      Controls,
      LineChart,
      DetailedForecast,
      LineChartAsync,
      ForecastsTableCustom,
      BIconX
  },

  methods: {
      findCityIndex (coords) {
      /* find city index */
          return this.cityData.findIndex(city => {
              return city.coords.lat == coords.lat && city.coords.lon == coords.lon
          })
      },

      preparePlotData: async function (endHours, variable) {
      /* prepares dataset for plot */
          let chartdata = (await this.chartData[this.selectedCity]).variables[this.selectedVar];
          delete chartdata.title // remove plot title
          chartdata = {...chartdata, labels: chartdata.labels.slice(0, endHours)} // x-axis points for endHours hours

          return chartdata
      },

      beforeLeave: function (el) {
          document.getElementById("app").style.overflow = "hidden"; // temporarily disable while transitioning
      },

      afterLeave: function (el) {
          document.getElementById("app").style.overflow = "auto"; // enable after transition
      },
  },

  computed: {
      tableCells: function () {
      /* prepares table rows */
          let data_for_table = [];
          let now = Date.now();
          let nowIndex = null;
          
          this.cityData.forEach(city => {
              nowIndex = city.forecast.hourlyDt.findIndex(dt => hoursPassed(now, dt) === 0) // find closest datetime to now + first column hours
              let curr_data = {
                  'city' : { name: city.name[this.$i18n.locale], coords: city.coords }, // city column
                  'country': city.country[this.$i18n.locale],
                  'continent': this.$t(city.continent.toLowerCase())
              }
              for (let counter = 0; counter < this.overviewColumns && nowIndex !== -1 && nowIndex + counter*this.overviewPeriod < city.forecast[this.selectedVar].length; counter++) // if nowIndex === =1, there is no up to date forecast data to pass to the table
              {
                  curr_data[String(counter)] = city.forecast[this.selectedVar][nowIndex + counter*this.overviewPeriod]; // hour forecast columns
              }
              data_for_table.push(curr_data);
          });
          return data_for_table;
      },

      tableHeader: function () {
      /* prepares table fields (i.e. column names) */
          let currentDate = new Date();
          let now = Date.now();
          let options = { weekday: 'short', hour: '2-digit'};
          let fields = [
              {
                key: 'city',
                label: this.$t('city'),
                sortable: true
              },
              {
                key: 'country',
                label: this.$t('country'),
                sortable: true
              },
              {
                key: 'continent',
                label: this.$t('continent'),
                sortable: true
              }
          ];

          for (let counter = 0; counter < this.overviewColumns; counter++)
          {
              //currentDate.setTime(currentDate.getTime() + counter*this.overviewPeriod*60*60*1000)
              currentDate = new Date(now + counter*this.overviewPeriod*60*60*1000);
              let new_label = {
                  key: String(counter),
                  sortable: true,
                  label: currentDate.toLocaleDateString(this.$i18n.locale, options)
              }
              fields.push(new_label);
          }
        return fields;
      },

      tableTitle: function () {
          let unit_map = {
              "temperature" : "\u2103",
              "pressure" : "hPa",
              "humidity" : "%",
          };
          return `${this.$t(this.selectedVar)} ${this.$t('in')} ${unit_map[this.selectedVar]}`;
      },

      ...mapGetters({
          cityData: 'allCityData/getAllCityData',
          chartData: 'chartData/getChartData',
          preferences: 'preferences/getPreferences'
      })
  },

  watch: {
      overviewColumns() {
          window.localStorage.setItem('overviewColumns', JSON.stringify(this.overviewColumns))
      },

      overviewPeriod() {
          window.localStorage.setItem('overviewPeriod', JSON.stringify(this.overviewPeriod))
      },

      selectedCity(newValue, oldValue) {
          this.tableStyle.maxHeight = this.tableStyle.minHeight = newValue === -1 ? '70vh' : '25vh';
          if (newValue === -1) { // plot was closed, no city selected
              this.$refs.table.scrollToRow(0);
              this.selectedCityIndexSorted = -1;
          }
      },

      selectedCityIndexSorted(newValue, oldValue) {
          if(newValue === -1) { // plot was closed, no city selected
              this.$refs.table.scrollToRow(0);
          }
          else if(oldValue === -1) { // plot was closed, city selected
              this.$refs.table.scrollToRow(this.selectedCityIndexSorted);
          }
      },

      tableSorted(newValue, oldValue) {
          if(this.selectedCity !== -1) { // scroll sorted table to follow selected city
              this.$refs.table.scrollToRow(this.selectedCityIndexSorted); // when table unsorted, selectedCity == selectedCityIndexSorted
          }
      },

      tableFilter(newValue, oldValue) {
          this.tableStyle.maxHeight = 'auto';
          if(this.selectedCity === -1) { // when no city selected
              this.$refs.table.scrollToRow(0); // reset table scroll between filter inputs
          }
          else {
              setTimeout(() => { // wait for selected city index to be updated
                  this.$refs.table.scrollToRow(this.selectedCityIndexSorted);
              }, this.filterDebounce + 50);
          }
      }
  },
  
  async created() {
      this.overviewColumns = JSON.parse(window.localStorage.getItem('overviewColumns')) || this.overviewColumns;
      this.overviewPeriod = JSON.parse(window.localStorage.getItem('overviewPeriod')) || this.overviewPeriod;
  },

  mounted() {
      this.$on('selectedRowUpdate', ({index, coords}) => {
          this.selectedCity = this.findCityIndex(coords);
          this.selectedCityIndexSorted = index;
      });

      this.$on('sortingChanged', value => {
          this.tableSorted = value;
      });

      this.$on('showPlot', () => { this.showPlot = true; });
      
      this.$on('showDetailedForecast', () => { this.showDetailedForecast = true; });
  },

  destroyed() {
      this.$off();
  }
}
</script>

<style type="text/css" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .25s linear;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.fade-overview-table-enter-active, .fade-overview-table-leave-active {
  transition: opacity .5s;
  display: none;
}
.fade-overview-table-enter, .fade-overview-table-leave-to {
  opacity: 0;
}

.resize-enter-active, .resize-leave-active {
  transition: max-height 1s ease-in;
}
.resize-enter, .resize-leave-to {
  transition: max-height 1s ease-out;
}
</style>