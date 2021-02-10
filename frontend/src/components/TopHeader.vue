<!--
  Copyright (c) 2019

  Top Header component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->

<template>
<div class="top-header">
	<b-navbar
		toggleable="md"
		type="dark"
		variant="dark"
	>
		<!--b-navbar-brand>
			<img src="../assets/logo_rect.png" class="logo">
		</b-navbar-brand-->
		<b-navbar-toggle
			target="nav-collapse"
		/>
			<b-collapse
				id="nav-collapse"
				is-nav
			>
				<!-- Right aligned nav items -->
				<b-navbar-nav
					class="ml-auto"
					style="z-index: 9999;"
				><!-- draw dropdown menu on top of all other elements -->
					<!-- meteorological map -->
					<b-nav-item>
						<router-link
							class="regular"
							to="/"
							exact
						>
							{{$t('meteomap')}}
						</router-link>
					</b-nav-item>
					
					<!-- forecasts -->
					<b-nav-item>
						<router-link
							class="regular"
							to="/forecasts"
							exact
						>
							{{$t('forecasts')}}
						</router-link>
					</b-nav-item>
					
					<!-- about -->
					<b-nav-item>
						<router-link
							class="regular"
							to="/about"
							exact
						>
							{{$t('about')}}
						</router-link>
					</b-nav-item>
					
					<!-- swich language -->
					<LanguageSwitcher />
					
					<!-- search city -->
					<div>
					 	<b-input-group>
					    	<!--template #prepend>
					      		<b-input-group-text >{{$t('city')}}</b-input-group-text>
					    	</template-->
					    	<b-form-input
					    		class="search"
					    		:value="$store.getters['search/getSearchTerm']"
					    		:placeholder="$t('add city')"
					    		trim
					    		@input="$store.dispatch('search/setSearchTerm', $event);"
					    		@keydown.enter="searchCity()"
					    	/>
					    	<template #append>
					      		<b-button
					      			:title="$t('search forecast data')"
					      			v-b-tooltip.hover.bottom.ds500
					      			@click="searchCity()"
					      		>
					      			<b-icon-search/>
					      		</b-button>
					    	</template>
					  	</b-input-group>
					</div>
					
					<!-- refresh meteorological data -->
					<div>
						<b-button
							type="dark"
							variant="dark"
							@click="!refreshing ? refreshForecastData() : null"
							v-b-tooltip.hover.bottom.ds500
							:title="$t('refresh forecast data')"
						>
							<!-- spin icon while fetching data -->
				        	<b-icon-arrow-clockwise
				          		
				          		icon="arrow-clockwise"
				          		:animation="refreshing ? 'spin' : ''"
				          	/>
				        </b-button>
			    	</div>
			        
			        <!-- preferences -->
			        <div>
			        	<b-dropdown
			        		variant="dark"
			        		right
			        		lazy
			        		@show="$store.dispatch('preferences/initializeAvailableProtocols')"
			        		v-b-tooltip.hover.bottom.ds500
							:title="$t('preferences')"
			        	>
			        		<template #button-content>
        						<b-icon-gear/>
      						</template>
      						<!-- backend protocol select -->
      						<b-dropdown-form style="min-width: max-content; max-width: max-content;">
      							<b-form-group
      								:label="$t('backend protocol')"
      								class="mb-2"
      							>
							         <b-form-select
							         	:disabled="preferences.backend.availableProtocols.filter(p => p.status === true).length === 1"
								        :options="preferences.backend.availableProtocols.filter(p => p.status === true).map(p => ({ text: p.protocol.toUpperCase(), value: p.protocol }) )"
								        :value="preferences.backend.activeProtocol"
								        @change="$event => $store.dispatch('preferences/setActiveProtocol', $event)"
								     />
								     <!--label>on port {{ preferences.backend.port }}</label-->
						        </b-form-group>
						        
						        <!-- detailed forecast pagination/scrollbar select -->
						        <b-form-group :label="$t('detailed forecast style')">
						          <b-form-select
							          :options="['paginated', 'scrollbar'].map(o => ({ text: $t(o), value: o}))"
							          :value="preferences.frontend.detailedForecastStyle"
							          @change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.detailedForecastStyle', value: $event })"
							      />
						        </b-form-group>
						        
						        <!-- theme -->
						        <b-form-group :label="$t('theme')">
						          <b-form-select
							          :options="preferences.frontend.availableThemes"
							          :value="preferences.frontend.activeTheme"
							          @change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.activeTheme', value: $event })"
							      />
						        </b-form-group>
      						</b-dropdown-form>
			        	</b-dropdown>
			        </div>
				</b-navbar-nav>
			</b-collapse>
	</b-navbar>
</div>
</template>

<script type = "text/javascript">
import Vue from 'vue';
import LanguageSwitcher from './LanguageSwitcher.vue';
import { BIconArrowClockwise, BIconSearch, BIconGear } from 'bootstrap-vue';
import { pingProtocol } from '../controllers/backend';
import { mapGetters } from 'vuex';

export default {
	components: {
		LanguageSwitcher,
		BIconArrowClockwise,
		BIconSearch,
		BIconGear
	},

	data() {
		return {
			refreshing: false
		}
	},

	methods: {
		async refreshForecastData() {
			this.refreshing = true;
			await this.$store.dispatch('allCityData/setAllCityDataAsync', true);
			this.refreshing = false;
		},

		async searchCity() {
			await this.$store.dispatch('search/setShowResults', true);
			await this.$store.dispatch('search/searchCity');
		}
	},

	computed: {
		...mapGetters({
			preferences: 'preferences/getPreferences'
		})
	}
}
</script>

<style scoped>
.top-header {
    background-color: gray;
    margin-bottom: 1%;
    position: sticky;
    top: 0;
    z-index: 2147483647;
}

.logo {
    height: 50px;
}

.regular {
	color: #42b983;
}

.regular:hover {
	color: yellow;
	text-decoration: none;
}

.router-link-active, .router-link-active:hover {
    /*text-decoration: underline;*/
	text-decoration: none;
    font-weight: bold;
	color: white;
}

*:focus {
	outline: none;
}

.search {
	font-size: 80%;
}

.form-control {
	height: unset;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}
</style>
