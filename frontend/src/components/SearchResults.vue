<template>
	<!-- render results if they exist -->
	<b-list-group
		v-if="results.length"
		:style="{ maxHeight: '500px', overflow: 'auto', scrollbarWidth: 'thin'}"
	>
		<b-list-group-item
			v-for="(result, index) in results"
			:key="index"
			active
			class="flex-column align-items-start"
		>
		    <div class="d-flex w-100 justify-content-between">
			    <h5 class="mb-1 text-left">{{ result.name }}</h5>
			    <span v-if="isAdded(result)"> <b-icon-check scale="2"/> </span>
			    <span v-else-if="alreadyExists(result)" :style="{fontSize: '80%'}">{{ $t('already added') }}</span>
		      	<b-button
		      		v-else
		      		size="sm"
		      		@click="typeof onClick === 'undefined' ? $store.dispatch('action/add', result) : onClick"
		      	>
		      		{{ $t('add') }}
		      	</b-button>
		      	
		      	
		    </div>
		    <p class="mb-1 d-flex w-100 text-left">
		    	{{ result.region }}, {{ result.postCode }}, {{ result.country }}
		    </p>
		</b-list-group-item>
	</b-list-group>
	
	<!-- show animation while searching -->
	<div
		v-else-if="$store.getters['search/getSearching']"
	>
		<b-icon-three-dots scale="8" animation="throb" />
	</div>

	<!-- no results -->
	<div v-else>
		<h4> {{ $t('no results') }}	</h4>
	</div>
</template>

<script type="text/javascript">
import { BIconCheck, BIconThreeDots } from 'bootstrap-vue'
import { mapGetters } from 'vuex'

export default {
	name: 'SearchResults',
	
	components: {
		BIconCheck,
		BIconThreeDots
	},
	
	props: {
		results: {
			type: [Array, null],
			required: true,
			default: []
		},

		onClick: {
		/* add button function */
			type: Function,
			required: false
		},

		alreadyAdded: {
		/* list of added results (for demo purposes only) */
			type: Array,
			required: false,
			default: function() {
				return [];
			}
		},

		exists: {
		/* list of results that already exist (for demo purposes only) */
			type: Array,
			required: false,
			default: function() {
				return [];
			}	
		}
	},

	methods: {
		isAdded(result) {
		/* returns true if result has been added */
			if(this.alreadyAdded.length) {
				return this.alreadyAdded.findIndex(city => {
					return city.lat == Number.parseFloat(result.lat) && city.lon == Number.parseFloat(result.lon);	
				}) !== -1
			}
			else {
				return this.addedCities.findIndex(city => {
					return city.lat == Number.parseFloat(result.lat) && city.lon == Number.parseFloat(result.lon);
				}) !== -1;
			}
		},

		alreadyExists(result) {
		/* returns true if result already exists */
			if(this.exists.length) {
				return this.exists.findIndex(city => {
					return city.lat === Number.parseFloat(result.lat) && city.lon === Number.parseFloat(result.lon)
				}) !== -1;
			}
			else {
				return this.citiesCoords.has(`${Number.parseFloat(result.lat)},${Number.parseFloat(result.lon)}`);
			}
		}
	},

	computed: {
		...mapGetters({
			addedCities: 'search/getAddedCities',
			citiesCoords: 'allCityData/getCitiesCoords'
		})
	}
}
</script>