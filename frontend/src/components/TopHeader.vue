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
		style="
			height: 100%;
			margin: 0;
			padding-top: auto;
			padding-bottom: auto;
			position: relative;
		"
	>
		<!--b-navbar-brand>
			<img src="../assets/logo_rect.png" class="logo">
		</b-navbar-brand-->
		<b-navbar-toggle
			target="nav-collapse"
			style="height: 100%;"
		/>
			<b-collapse
				id="nav-collapse"
				is-nav
				style="height: 100%;"
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
			        		v-b-tooltip.hover.bottom.ds500.title="`${$t('preferences')}`"
			        	>
			        		<template #button-content>
        						<b-icon-gear/>
      						</template>
      						<!-- backend protocol select -->
      						<b-dropdown-form style="width: 20vw;">
      							<b-form-group
      								:label="$t('backend protocol')"
      								class="mb-2"
      								title=""
      							>
							         <b-form-select
							         	:disabled="preferences.backend.availableProtocols.filter(p => p.status !== 404).length <= 1"
								        :options="preferences.backend.availableProtocols.filter(p => p.status !== 404).map(p => ({ text: p.protocol.toUpperCase(), value: p.protocol }) )"
								        :value="preferences.backend.activeProtocol"
								        @change="$event => $store.dispatch('preferences/setActiveProtocol', $event)"
								     />
								     <!--label>on port {{ preferences.backend.port }}</label-->
						        </b-form-group>
						        
						        <!-- detailed forecast pagination/scrollbar select -->
						        <b-form-group
						        	:label="$t('detailed forecast style')"
						        	title=""
						        >
						          	<b-form-select
							          	:options="['paginated', 'scrollbar'].map(o => ({ text: $t(o), value: o}))"
							          	:value="preferences.frontend.detailedForecastStyle"
							          	@change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.detailedForecastStyle', value: $event })"
							      	/>
						        </b-form-group>
						        
						        <!-- theme -->
						        <b-form-group
						        	:label="$t('theme')"
						        	title=""
						        >
						          	<b-form-select
							          	:options="preferences.frontend.availableThemes"
							          	:value="preferences.frontend.activeTheme"
							          	@change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.activeTheme', value: $event })"
							      	/>
						        </b-form-group>

						        <!-- auto refetch -->
						        <b-form-group>
							        <b-form-checkbox
							        	:checked="preferences.frontend.autoRefetch"
							        	@change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.autoRefetch', value: $event })"
							        >
							    		{{$t('auto refresh')}}
							    	</b-form-checkbox>
						    	</b-form-group>

						    	<!-- auto refetch period -->
						    	<b-form-group
						    		:style="{ opacity: preferences.frontend.autoRefetch ? 1 : 0.5 }"
						    		title=""
						    	>
						    		{{$t('auto refresh period')}}
							    	<b-form-input
							    		style="
							    			min-width: 15%;
							    			max-width: 20%;
							    			display: inline;
							    			padding: 0% 1% 0% 1%;
							    			text-align: center;
							    		"
							    		type="number"
							    		:value="preferences.frontend.autoRefetchOlderThan"
							    		min="1"
							    		max="72"
							    		@change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.autoRefetchOlderThan', value: $event })"
							    		:disabled="!preferences.frontend.autoRefetch"
							    	/>
							    	{{$t('hours')}}
						    	</b-form-group>

						    	<!-- check fresh data period -->
						    	<b-form-group
						    		:style="{ opacity: preferences.frontend.autoRefetch ? 1 : 0.5 }"
						    		title=""
						    	>
						    		{{$t('check period')}}
							    	<b-form-input
							    		style="
							    			min-width: 15%;
							    			max-width: 20%;
							    			display: inline;
							    			padding: 0% 1% 0% 1%;
							    			text-align: center;
							    		"
							    		type="number"
							    		:value="preferences.frontend.checkUpToDatePeriod/60000"
							    		min="1"
							    		@change="$event => $store.dispatch('preferences/setPreference', { preference: 'frontend.checkUpToDatePeriod', value: $event*60000 })"
							    		:disabled="!preferences.frontend.autoRefetch"
							    	/>
							    	{{$t('mins')}}
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

	methods: {
		async refreshForecastData() {
			await this.$store.dispatch('allCityData/setAllCityDataAsync', true);
		},

		async searchCity() {
			await this.$store.dispatch('search/setShowResults', true);
			await this.$store.dispatch('search/searchCity');
		}
	},

	computed: {
		...mapGetters({
			preferences: 'preferences/getPreferences',
			refreshing: 'allCityData/getFetching'
		})
	}
}
</script>

<style scoped>
.top-header {
    background-color: var(--dark);
    /*margin-bottom: 1%;*/
    position: sticky;
    top: 0;
    z-index: 2147483647;
    min-height: 4vh;
    max-height: 4vh;
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

>>> .dropdown-menu {
	top: 4.75vh;
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
