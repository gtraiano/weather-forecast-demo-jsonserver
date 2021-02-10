<!--
  Copyright (c) 2020

  About component

  @author Spiros Dimopoulos <sdimopoulos@irisweb.gr>
  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->


<template>
<b-container fluid>
	<b-row>
		<b-col/>
		
		<b-col cols="10">
			<h1>{{ $t('about') }}</h1>
		</b-col>

		<b-col/>
	</b-row>
	
	<b-row>
		<b-col />

		<b-col cols="5">
			<div style="text-align: left">
				<h2>{{$t('the story')}}</h2>
				<h3 v-html="$t('story')"></h3>
			</div>
		</b-col>
		
		<b-col cols="5">
			<h2 style="text-align: left">{{$t('tools services')}}</h2>
			<div style="text-align: left" v-html="$t('about info')"></div>
		</b-col>

		<b-col />
	</b-row>
	
	<b-row>
		<b-col/>
		
		<b-col cols="10">
			<h1>{{$t('functions')}}</h1>
		</b-col>

		<b-col/>
	</b-row>

	<b-row/>
	
	<b-row>
		<b-col/>

		<b-col cols="5">
			<div class="text-left">
				<h2>{{$t('search-add.header')}}</h2>
				<li>
					<ul>
						{{$t('search-add.step1')}}
					</ul>
					<ul>
						<div style="display: inline-block;">
							<b-input-group>
							    	<b-form-input
							    		class="search"
							    		:placeholder="$t('add city')"
							    	/>
							    	<template #append>
							      		<b-button
							      			:title="$t('search forecast data')"
							      		>
							      			<b-icon-search/>
							      		</b-button>
							    	</template>
							  	</b-input-group>
						</div>
					</ul>

					<ul>
						{{$t('search-add.step2')}}
					</ul>
					<ul>
						<SearchResults
							:results="[
								{ lat: 0, lon: 0, name: $t('city name'), region: $t('region'), postCode: $t('postal code'), country: $t('country') },
								{ lat: 1, lon: 1, name: 'Another City', region: 'Nowhere', postCode: '123456', country: 'Noland' }
							]" 
							:onClick="() => {}"
						/>
					</ul>
					<ul id="promptlist">
						{{$t('search-add.step3')}}
					</ul>
					<ul>
						{{$t('search-add.step4')}}
					</ul>
					<ul>
						<SearchResults
							:results="[
								{ lat: 0, lon: 0, name: $t('city name'), region: $t('region'), postCode: $t('postal code'), country: $t('country') },
								{ lat: 1, lon: 1, name: 'Another City', region: 'Nowhere', postCode: '123456', country: 'Noland' }
							]" 
							:onClick="() => {}"
							:alreadyAdded="[{ lat: 0, lon: 0 }]"
							:exists="[{ lat: 1, lon: 1 }]"
						/>
					</ul>
				</li>
			</div>

			<div class="text-left mt-5">
				<h2>{{$t('refresh forecast')}}</h2>
				<li>
					<ul>
						{{$t('click on')}} <b-icon-arrow-clockwise class="ml-1 mr-1" scale="1.5" /> {{$t('refetch data')}}
					</ul>
				</li>
				<h2 class="text-capitalize">{{$t('preferences')}}</h2>
				<li>
					<ul>
						{{$t('click on')}} <b-icon-gear class="ml-1 mr-1" scale="1.5" /> {{$t('set preferences')}}
					</ul>
				</li>
			</div>
		</b-col>

		<b-col cols="5">
			<div class="text-left">
			<h2>{{ $t('forecasts') }}</h2>
			<!--h5>{{ $t('forecasts.header2', [$t('actions'), $t('overview')]) }}</h5-->
			<li>
				<ul>
					{{$t('click on')}}
					<Controls
						class="ml-1 mr-1"
						:variables="['temperature', 'humidity', 'pressure']"
						@selected_var="variable => { selectedVar = variable }"
					/>
					{{$t('forecasts.step0.0')}}
				</ul>
				<ul>
					{{$t('click on')}}
					<b-dropdown size="sm" class="ml-1 mr-1">
                        <template #button-content>
                            <!--b-icon-gear/--> {{$t('options')}}
                        </template>
                        <!-- forecast columns # -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('table columns')}}</label>
                            <b-form-spinbutton
                                inline
                                size="sm"
                                :value="4"
                                min="1"
                                max="48"
                            />
                        </b-dropdown-form>
                        <!-- forecast columns period -->
                        <b-dropdown-form>
                            <label class="text-nowrap">{{$t('period')}}</label>
                            <b-form-spinbutton
                                inline
                                size="sm"
                                :value="4"
                                min="1"
                                max="24"
                            />
                        </b-dropdown-form>
                    </b-dropdown>
                    {{$t('forecasts.step0.1')}}
				</ul>
				<ul>
					{{$t('forecasts.step0.2')}}
					<div style="max-width: 50%; min-width: 50%; margin-top: 1vh;">
                        <b-input-group
                            size="sm"
                            class="mb-1"
                        >
                            <b-form-input
                                :value="tableFilter"
                                :placeholder="$t('filter')"
                                debounce="250"
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
				</ul>
				<ul>
					<b-table
						striped hover borderless sticky-header small head-variant="light"
						:fields="[
							{ key: 'actions', label: $t('actions'), sortable: false },
							{ key: 'index', label:'#', sortable: false },
							{ key: 'city', label: $t('city'), sortable: true, thStyle: {'background-image': 'none'}, sort: null },
							{ key: 'country', label: $t('country'), sortable: true, thStyle: {'background-image': 'none'}, sort: null },
							{ key: 'continent', label: $t('continent'), sortable: true, thStyle: {'background-image': 'none'}, sort: null },
							{ key: 'forecasts', label: $t('forecasts'), sortable: true, thStyle: {'background-image': 'none'}, sort: null }
						]"
						:items="[
							{ index:'1', 'city': this.$i18n.locale === 'en' ? 'City Name' : 'Όνομα Πόλης', country: $t('country'), continent: $t('continent'), 'forecasts': selectedVar ? $t(selectedVar) : '', coords: { lat: 0, lon: 1 } },
							{ index:'2', 'city': this.$i18n.locale === 'en' ? 'Another City' : 'Άλλη Πόλη', country: $t('country'), continent: $t('continent'), 'forecasts': selectedVar ? $t(selectedVar) : '', coords: { lat: 1, lon: 0 } }
						]"
						:filter="tableFilter"
						@contextmenu.native.prevent
					>
						<template v-slot:head()="data"><!-- header custom rendering-->
					  		<!-- on sortable field, clear sorting on right clicking sorted field header -->
						    <div 
						        v-if="data.field.sortable"
						        @click.left="data.field.sort = data.field.sort ? !data.field.sort : true"
						        @click.right="data.field.sort = null"
						    >
						        <div style="display: inline-block; position: relative;">{{ data.label }}</div>
						        <div style="display: inline-block; position: relative;"><!-- custom sort icon -->
						            <b-icon-chevron-up v-if="data.field.sort" />
						            <b-icon-chevron-down v-else-if="data.field.sort === false" />  
						        </div>
						          
						    </div>
							<!-- on regular field, disable right click context menu -->
						    <div
						        v-else
						        @click.right.prevent
						    >
						    	{{ data.label }}
						    </div>
					    </template>
						<template v-slot:cell(city)="data">
							<a
								href=""
								@click.prevent
								v-b-tooltip.hover.bottom.ds500
								:title="`lat: ${data.item.coords.lat} lon: ${data.item.coords.lon}`"
							>
								{{data.item.city}}
							</a>
							
						</template>
						<template v-slot:cell(actions)="data">
					        <a
					            class="ml-1 mr-1"
					            href=""
					            style="color: unset"
					            @click.prevent
					            v-b-tooltip.bottom.ds500
					            :title="$t('plot')"
					        >
					          <b-icon-graph-up/>
					        </a>
					      	<a
					            class="ml-1 mr-1"
					      		href=""
					      		style="color: unset"
					      		@click.prevent
					      		v-b-tooltip.bottom.ds500
					      		:title="$t('refresh forecast data')"
					      	>
					      		  <b-icon-arrow-clockwise/>
					      	</a>
					      	<a
					            class="ml-1 mr-1"
					      		href=""
					      		style="color: unset"
					      		@click.prevent
					      		v-b-tooltip.bottom.ds500
					      		:title="$t('delete')"
					      	>
					      		  <b-icon-trash/>
					      	</a>
					    </template>
					</b-table>
				</ul>
				<ul>
					<h5>{{ $t('forecasts.header2', [$t('actions'), $t('overview')]) }}</h5>
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-graph-up class="ml-1 mr-1"/> {{$t('forecasts.step2')}}
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-trash class="ml-1 mr-1"/> {{$t('forecasts.step3')}}
				</ul>
				<ul>
					{{$t('click on')}} <b-icon-arrow-clockwise class="ml-1 mr-1"/> {{$t('forecasts.step4')}}
				</ul>
				<ul>
					<h5>{{ $t('forecasts.header2', [$t('city'), $t('overview')]) }}</h5>
				</ul>
				<ul>
					{{ $t('forecasts.step1') }}
				</ul>
				<ul>
					<h5>{{ $t('forecasts.header3', [$t('overview')]) }}</h5>
				</ul>
				<ul>{{$t('forecasts.step5')}}</ul>
			</li>
		</div>

		<div class="text-left mt-5">
			<h2>{{ $t('meteomap') }}</h2>
			<li>
				<ul>
					{{$t('map.step1')}}
				</ul>
				<ul>
					{{$t('map.step2')}}
				</ul>
			</li>
		</div>
		</b-col>

		<b-col/>
	</b-row>
</b-container>
</template>

<script>
import { BIconSearch, BIconTrash, BIconArrowClockwise, BIconGraphUp, BIconChevronUp, BIconChevronDown, BIconX, BIconGear } from 'bootstrap-vue'
import SearchResults from './SearchResults.vue'
import Controls from './Controls.vue'
import Vue from 'vue'

export default {
	name: 'About',
	
	components: {
		BIconSearch,
		SearchResults,
		BIconTrash,
		BIconArrowClockwise,
    	BIconGraphUp,
    	BIconChevronUp,
    	BIconChevronDown,
    	BIconX,
    	BIconGear,
    	Controls
	},
	
	data() {
		return {
			selectedVar: null,
			tableFilter: null
		}
	}
}
</script>

<style scoped>
ul, >>> ul {
  list-style-type: none;
  padding: 0;
}

li, >>> li {
  display: inline-block;
  margin: 0 10px;
}

>>> .tooltip-inner {
  max-width: max-content;
  min-width: max-content;
}
</style>
