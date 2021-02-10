<!--
  Copyright (c) 2019

  Map display component, shows a geographical/meteorological map

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Geirgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<b-container fluid>
    <!-- display map -->
    <b-row>
        <b-col/>

        <b-col cols=10>
            <GeneralMap
                height="85vh"
                width="100%"
                :zoom="zoom"
                :center="center"
                :mapUrl="mapUrl"
                :iconScale="(zoom/18)*1.5"
                :markerData="cityData"
                :chartData="chartData"
                :openWeatherOptions="options"
                :openWeatherTileUrls="generateOpenWeatherTileLayers"
                :activeCityPopup="activeCityPopup"
                :activeOpenWeatherLayers="activeLayers"
                :markerContextMenu="removeMarker"
                :markerCurrentWeatherIcon="currentWeatherIcon"
                @zoomUpdated="value => $emit('zoomUpdated', value)"
                @centerUpdated="value => $emit('centerUpdated', value)"
                @boundsUpdated="value => $emit('boundsUpdated', value)"
                @activeCityPopupUpdated="value => $emit('activeCityPopupUpdated', value)"
                @activeOpenWeatherLayersUpdated="layers => $emit('activeOpenWeatherLayersUpdated', layers)"
            /><!-- alternatively could have updated data members directly (e.g. zoom = value) -->
        </b-col>

        <b-col/>
    </b-row>

    <b-row class="pt-1">
        <b-col/>
    </b-row>

    <!-- display center, zoom, bounds tags -->
    <b-row align-v="end" class="pb-0 mb-0">
        <b-col/>

        <b-col cols=2>
            <span><strong>{{$t('center')}}</strong></span>
        </b-col>

        <b-col cols=2>
            <span><strong>{{$t('zoom')}}</strong></span>
        </b-col>

        <b-col cols=6>
            <span><strong>{{$t('bounds')}}</strong></span>
        </b-col>

        <b-col/>
    </b-row>

    <!-- display center, zoom, bounds values -->
    <b-row align-v="start" class="pt-0 mt-0">
        <b-col/>

        <b-col cols=2>
            <span style="font-family: 'Roboto Mono', courier; font-size: 90%">{{ centerSimple }}</span>
        </b-col>

        <b-col cols=2>
            <span style="font-family: 'Roboto Mono', courier; font-size: 90%">{{ zoom }}</span>
        </b-col>

        <b-col cols=6>
            <span style="font-family: 'Roboto Mono', courier; font-size: 90%">{{ boundsSimple }}</span>
        </b-col>

        <b-col/>
    </b-row>

</b-container>
</template>

<script>
import { mapGetters } from 'vuex'
import GeneralMap from './GeneralMap.vue'

const hoursPassed = (end, start) => {
    return Math.floor((end - start)/3600000);
}

export default {
    name: 'Map',

    components: {
        GeneralMap
    },

    data () {
        return {
            // map url and options
            mapUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            zoom: 6,
            center: { lat: 38.436111, lng: 26.112442 },
            bounds: null,
            //iconScale: 1.0,

            activeCityPopup: -1, // city id of displayed popup
          
            options: [], // OpenWeather tiles switch box options
            activeLayers: [], // selected OpenWeather tiles (temperature and clouds by default, checks 'activeLayers' item in localStorage on created()
        };
    },

    async created() {
        this.options = this.populateOptions();

        if(window.localStorage.getItem('activeLayers')) { // load control panel options from local storage
            this.activeLayers = JSON.parse(window.localStorage.getItem('activeLayers'));
        }
        else {
            this.activeLayers = ['temp_new', 'clouds_new']; // default values
        }
    },

    mounted() {
        // map event listeners
        this.$on('zoomUpdated', value => { this.zoom = value; });
        this.$on('centerUpdated', value => { this.center = value; });
        this.$on('boundsUpdated', value => { this.bounds = value; });
        this.$on('activeCityPopupUpdated', value => { this.activeCityPopup = value; });
        this.$on('activeOpenWeatherLayersUpdated', value => {
            this.activeLayers = value;
            window.localStorage.setItem('activeLayers', JSON.stringify(this.activeLayers)); // save control panel options
        });
    },

    beforeUpdate() {
        // update switch box labels on languange change
        this.options = this.populateOptions();
    },

    destroyed() {
        this.$off()
    },

    methods: {
        populateOptions() {
        // switch box options
        // available OpenWeather tiles: [ 'temp_new', 'clouds_new', 'precipitation_new', 'pressure_new', 'wind_new' ], 
            return [
                { text: this.$t('temperature'), value: 'temp_new'} ,
                { text: this.$t('clouds'), value: 'clouds_new' },
                { text: this.$t('precipitation'), value: 'precipitation_new' },
                { text: this.$t('pressure'), value: 'pressure_new' },
                { text: this.$t('wind'), value: 'wind_new' }
            ]
        },

        removeMarker(city) {
            //this.$store.dispatch('allCityData/removeCity', coords);
            this.$store.dispatch('action/delete', city);
        },

        currentWeatherIcon(city) {
        /* returns weather icon for current datetime hour */
            const index = city.forecast.hourlyDt.findIndex( dt => hoursPassed(Date.now(), dt) == 0 );
            return index !== -1 ? city.forecast.hourlyWeatherIcon[index] : null;
        }
    },

    computed: {
        centerSimple() {
        /* formats center as "(lat, lng)" */
            return `(${this.center.lat.toFixed(6)}, ${this.center.lng.toFixed(6)})`;
        },

        boundsSimple() {
        /* formats bounds as "SW: (lat, lng) NE: (lat, lng)" */
            var out = "";
            if (this.bounds) {
                Object.keys(this.bounds).forEach(
                    (el) => {
                        // add values for each property
                        out += el + ": (" + Object.values(this.bounds[el]).join(", ") + ") ";
                    }
                )
            }

            return out
                .replace("_southWest", "SW")
                .replace("_northEast", "NE");
        },

        generateOpenWeatherTileLayers() {
            /* creates urls for active OpenWeather map layers */
            return this.activeLayers.map(layer => `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${process.env.OW_API_KEY}`)
        },

        // map store state to computed properties
        ...mapGetters({ 
            cityData: 'allCityData/getAllCityData',
            chartData: 'chartData/getChartData'
        })
    }
}
</script>