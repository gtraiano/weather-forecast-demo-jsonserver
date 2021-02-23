<!--
  Copyright (c) 2019

  Main App File

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @version 1.0
 -->

<template>
    <div 
        v-if="backendStatus"
        id="app"
        tabindex="0"
        @keydown.esc="$store.dispatch('search/clear')"
    >
        <!-- display overlay with search results -->
        <b-overlay
            style="height: 99vh;"
            :show="$store.getters['search/getShowResults'] && !$store.getters['action/getShow']"
            :z-index="(Number.MAX_VALUE/8).toLocaleString('fullwide', { useGrouping: false })"
        >
            <template #overlay>
                <div style="min-width: 20vw; max-width: 30vw;">
                    <h3> {{ $t('search for')}} <i>"{{ $store.getters['search/getSearchTerm'] }}"</i></h3>

                    <div style="margin-bottom: 1vh; height: inherit;">
                        <b-input-group>
                            <b-form-input
                                id="search-input"
                                class="search"
                                :value="$store.getters['search/getSearchTerm']"
                                :placeholder="$t('add city')"
                                trim
                                @keydown.enter="searchCity()"
                                style="background-color: #fff; height: inherit;"
                            />
                            <template #append>
                                <b-button
                                  @click="searchCity()"
                                >
                                  <b-icon-search/>
                                </b-button>
                            </template>
                          </b-input-group>
                      </div>

                    <div v-if="$store.getters['search/getShowResults']">
                        <SearchResults :results="$store.getters['search/getSearchResults']" />
                    </div>
                    <br>
                    <b-button @click="$store.dispatch('search/clear')">
                        {{ $t('close') }}
                    </b-button>
                </div>
            </template>
            
            <TopHeader/>
            
            <router-view/>
            
            <!-- intended to render modal inside the overlay but had trouble with its z-index being lower than the overlay's -->
            <b-modal
                no-fade
                hide-backdrop
                centered
                :title="$store.getters['action/getTitle']"
                :visible="$store.getters['action/getShow']"
                :okTitle="$t('yes')"
                :cancelTitle="$t('no')"
                @ok="$store.dispatch('action/setAnswer', true)"
                @cancel="$store.dispatch('action/setAnswer', false)"
                @close="$store.dispatch('action/setAnswer', false)"
                @hidden="$store.dispatch('action/setAnswer', false)"
            >
                <p>
                    {{ $store.getters['action/getMessage'] }}
                </p>
            </b-modal>
        </b-overlay>
    </div>
    
    <!-- when backend is unaivalable -->
    <div id="app" tabindex="0" v-else>
        <!-- message -->
        <h2 style="margin-top: 50vh">{{$t('await backend')}}</h2>
        <p>
            <b-icon-lightning
                class="h1"
                animation="fade"
            />
        </p>
        <!-- present alternatives on link click -->
        <p v-if="$store.getters['preferences/getPreferences'].backend.availableProtocols.length">
            {{$t('or check other')}} <a href="" @click.prevent = "showAvailable = !showAvailable">{{$t('available options')}}</a>
        </p>
        <!-- alternatives -->
        <div v-if="showAvailable">
            <h6>Available URLs</h6>
            <div>
              <a
                  v-for="available in $store.getters['preferences/getPreferences'].backend.availableProtocols.filter(p => p.status === true)"
                  href=""
                  @click.prevent="$store.dispatch('preferences/setActiveProtocol', available.protocol)"
              >
                  {{ available.url }}
              </a>
              <br>
            </div>

            <!-- set backend url manually (experimental, not working) -->
            <!--div style="margin-left: 39%; margin-right: 39%; margin-top: 2vh;">
                <h6>Set URL manually</h6>
                <b-form
                    @submit="setBackendUrl($event.srcElement[0]._value)"
                    @reset="$event.srcElement[0]._value = null"
                >
                    <b-form-group
                        id="input-group-1"
                        label-for="input-1"
                      >
                          <b-form-input
                            id="input-1"
                            type="url"
                            placeholder="Enter backend URL"
                            required
                            trim
                          />
                      </b-form-group>

                      <b-button type="submit" variant="primary">Submit</b-button>
                      <b-button type="reset" variant="danger">Reset</b-button>
                </b-form>
            </div-->
        </div>
    </div>
</template>

<script>
import TopHeader from './components/TopHeader.vue';
import { BOverlay, BButton, BModal, BIconLightning, BIconSearch } from 'bootstrap-vue'
import SearchResults from './components/SearchResults.vue';
import { pingActiveProtocol, setBackendUrl } from './controllers/backend.js';
import { mapGetters } from 'vuex'

export default {
	name: 'app',

	components: {
		TopHeader,
    BOverlay,
    BButton,
    BModal,
    SearchResults,
    BIconLightning,
    BIconSearch
	},

  data() {
      return {
          backendStatus: null,          // backend is available
          pingHandle: null,             // backend ping setInterval handle
          showAvailable: false,         // show available backend options when backend is unavailable
          upToDate: null,               // forecast data is up to date (or needs to be refetched from openweather)
          upToDateHandle: null,         // check up to date setInterval handle
          upToDateLastChecked: null,    // last checked data up to date
          //upToDateCheckInterval: 60000  // check every 60 seconds
      }
  },

  methods: {
      async checkBackendStatus() {
          this.backendStatus = await pingActiveProtocol() !== 404;
      },

      checkUpToDate() {
      /* checks forecast data is up to date */
          let upToDate = JSON.parse(window.localStorage.getItem('upToDate')) || 0;
          // if option to refresh outdated forecast data is disabled, return always true
          this.upToDate = !this.autoRefetch ? true : !(upToDate < (Date.now() + this.preferences.frontend.autoRefetchOlderThan*3600000));
          this.upToDateLastChecked = Date.now();
      },

      setCheckUpToDateInterval(interval) {
      /* sets interval for checkUpToDate(), use 0 to clear interval */
          this.upToDateHandle = interval
              ? setInterval(this.checkUpToDate, interval)
              : clearInterval(this.upToDateHandle);
      },

      async initializateApp() {
      /* app initialization */
          try {
              // check backend status 
              console.log('Checking backend status');
              await this.$store.dispatch('preferences/initializeAvailableProtocols');
              await this.checkBackendStatus();
              if(this.backendStatus) {
                  console.log('Loading forecast data');
                  if(this.autoRefetch) {
                      // check if forecast data is needs to be refreshed
                      this.checkUpToDate();
                      await this.$store.dispatch('allCityData/setAllCityDataAsync', !this.upToDate);
                      // enable check up to date interval
                      this.setCheckUpToDateInterval(this.upToDateCheckInterval);
                  }
                  else {
                      await this.$store.dispatch('allCityData/setAllCityDataAsync', false);
                  }
              }
          }
          catch(error) {
              console.log('Backend status is', this.backendStatus ? 'online' : 'offline'); 
              console.error(error.message);
          }
      },

      setBackendUrl(url) {
          setBackendUrl(url);
      },

      async searchCity() {
          this.$store.dispatch('search/setSearchTerm', document.getElementById('search-input').value);
          await this.$store.dispatch('search/setShowResults', true);
          await this.$store.dispatch('search/searchCity');
      }
  },

  computed: {
      ...mapGetters({
          preferences: 'preferences/getPreferences'
      }),

      theme() {
      // active app theme
          return this.preferences.frontend.activeTheme;
      },

      autoRefetch() {
      // automatic refetch
          return this.preferences.frontend.autoRefetch;
      },

      upToDateCheckInterval() {
          return this.preferences.frontend.checkUpToDatePeriod;
      }
  },

  watch: {
      async backendStatus() {
          await this.checkBackendStatus();
          console.log('Backend status is', this.backendStatus ? 'online' : 'offline'); 
          this.backendStatus
              ? (clearInterval(this.pingHandle), await this.initializateApp())
              : this.pingHandle = setInterval(this.checkBackendStatus, 3000); // reset interval if necessary
      },

      theme() {
          document.documentElement.setAttribute('theme', this.theme);
      },

      autoRefetch() {
          if(!this.autoRefetch) {
              this.setCheckUpToDateInterval(0);
          }
          else {
              this.checkUpToDate();
              this.setCheckUpToDateInterval(this.upToDateCheckInterval);
          }
          console.log(this.autoRefetch ? 'Enabled' : 'Disabled', 'automatic refetch');
      },

      async upToDateLastChecked() {
          console.log(`Forecast data is ${!this.upToDate ? 'not' : ''} up to date on ${new Date(this.upToDateLastChecked)}`);
          if(!this.upToDate) {
              // refresh forecast data
              console.log('Forecast data is outdated, fetching fresh data');
              await this.$store.dispatch('allCityData/setAllCityDataAsync', !this.upToDate);
          }
      },

      upToDateCheckInterval() {
          console.log('Set up to date check interval to', this.upToDateCheckInterval);
          this.setCheckUpToDateInterval(this.upToDateCheckInterval);
      }
  },

  async created() {
      await this.initializateApp();
  },

  mounted() {
      document.documentElement.setAttribute('theme', this.theme);
  }
}
</script>

<style>
/* host fonts locally (used https://google-webfonts-helper.herokuapp.com/fonts) */
/* roboto-regular - greek_latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto'), local('Roboto-Regular'),
       url('./assets/fonts/roboto-v20-greek_latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-v20-greek_latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-700 - greek_latin */
@font-face {
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 700;
  src: local('Roboto Bold'), local('Roboto-Bold'),
       url('./assets/fonts/roboto-v20-greek_latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-v20-greek_latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-mono-regular - greek_latin */
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 400;
  src: local('Roboto Mono'), local('RobotoMono-Regular'),
       url('./assets/fonts/roboto-mono-v7-greek_latin-regular.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-mono-v7-greek_latin-regular.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

/* roboto-mono-700 - greek_latin */
@font-face {
  font-family: 'Roboto Mono';
  font-style: normal;
  font-weight: 700;
  src: local('Roboto Mono Bold'), local('RobotoMono-Bold'),
       url('./assets/fonts/roboto-mono-v7-greek_latin-700.woff2') format('woff2'), /* Chrome 26+, Opera 23+, Firefox 39+ */
       url('./assets/fonts/roboto-mono-v7-greek_latin-700.woff') format('woff'); /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
}

#app {
  /*font-family: Helvetica, Arial, sans-serif;*/
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
}

h1, h2 {
  font-weight: normal;
}

a {
  color: #42b983;
}

.tooltip .arrow {
  display: none !important;
}
</style>
