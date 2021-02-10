<!--
  Copyright (c) 2019

  Displays detailed hourly forecast from OpenWeather data

  @author Georgios Traianos <gtraiano@gmail.com>
  @version 1.0
 -->
<template>
<div v-if="!loading">
	<div>
		<b-card-group
			deck
			id="deck-cards"
			:style="deckStyle"
			@wheel.prevent="onWheel"
		>
			<b-card
				v-for="(item, index) in cardSet"
				:key="item.dt"
				class="text-center"
				:style="cardStyle(index)"
				:title="day(item.dt*1000)"
			>
				<b-card-sub-title>
					{{ date(item.dt*1000)}}
				</b-card-sub-title>
				<b-card-img
					:src="`https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png`"
					img-alt="Card image"
					img-top
					style="object-fit: contain; min-height: 14vh; max-height: 14vh"
				>
				</b-card-img>
				<b-card-text>{{$t(item.weather[0].description)}}</b-card-text>
				<b-card-text>
					<b-container fluid class="m-0 p-0">
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="6" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('temperature')}}</b-col>
							<b-col cols="4" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.temp}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('humidity')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.humidity}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('pressure')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.pressure}}&nbsp;hPa</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('feels like')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.feels_like}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('cloudiness')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.clouds}}%</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('dew point')}}</b-col>
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{`${item.dew_point}\u2103`}}</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">{{$t('visibility')}}</b-col>
							<b-col cols="5" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">{{item.visibility}} m</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
						<b-row>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
							<b-col cols="3" class="ml-0 mr-0 pl-0 pr-0 text-left font-weight-bold text-truncate">
								{{$t('wind')}}
							</b-col>
							<b-col cols="7" class="ml-0 mr-0 pl-0 pr-0 text-right text-truncate">
								{{`${windDirection(item.wind_deg)} ${item.wind_speed} km/h`}}
							</b-col>
							<b-col cols="1" class="ml-0 mr-0 pl-0 pr-0" />
						</b-row>
					</b-container>
				</b-card-text>
			</b-card>
		</b-card-group>
		<div
			v-if="paginated"
			style="margin-top: 1vh"
		>
			<b-pagination
				v-model="currentPage"
				:total-rows="forecastData.hourly.length"
				:per-page="Math.trunc(cardsPerPage)"
				size="sm"
				align="center"
				first-class="m-0"
				next-class="m-0"
				last-class="m-0"
				page-class="m-0"
				prev-class="m-0"
				ellipsis-class="m-0"
			/>
		</div>
	</div>
</div>

<!-- loading animation -->
<div
	v-else
	style="margin-top: 25vh"
>
	<b-icon-three-dots scale="10" animation="throb" />
</div>
</template>

<script>
import { getCityLatLon } from '../controllers/backend'
import { BIconThreeDots } from 'bootstrap-vue'

export default {
	name: 'DetailedForecast',
	
	props: {
		// latitude & longitude of city
		lat: {
			type: Number,
			required: true
		},
		
		lon: {
			type: Number,
			required: true
		},
		
		paginated: Boolean, // whether to use pagination or scrollbar
		
		perPage: { // cards per page
			type: Number,
			required: true,
			validator: prop => typeof prop === 'number' && Number.isInteger(prop) && prop > 0
		},
	},

	components: { BIconThreeDots },

	data() {
		return {
			currentPage: 1,
			loading: true,
			forecastData: [],
			deckWidth: 0, // used to watch card deck width
			cardsPerPage: 0 // cards per page adjusted to card deck width
		}
	},

	methods: {
		extractName(entry, locale = this.$i18n.locale) {
			return (
				entry.location[locale].city || entry.location[locale].town || entry.location[locale].village
				|| entry.location[locale].address.city || entry.location[locale].address.town || entry.location[locale].address.village || entry.location[locale].address.county || entry.location[locale].address.region
			)
		},

		date(datetime) {
			return new Date(datetime).toLocaleDateString(this.$i18n.locale, { day:'2-digit', month: 'long', hour: '2-digit' });
		},

		day(datetime) {
			return new Date(datetime).toLocaleDateString(this.$i18n.locale, { weekday: 'long'});
		},

		windDirection(degrees) {
		// converts degrees to wind direction (https://www.campbellsci.com/blog/convert-wind-directions)
			const windDir = {
				en: ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"],
				el: ["Β","ΒΒΑ","ΒΑ","ΑΒΑ","Α","ΑΝΑ","ΝΑ","ΝΝΑ","Ν","ΝΝΔ","ΝΔ","ΔΝΔ","Δ","ΔΒΔ","ΒΔ","ΒΒΔ","Β"]
			};
			return windDir[this.$i18n.locale][Math.round((degrees % 360) / 22.5)];
 		},

 		resized() {
 			const el = document.getElementById('deck-cards');
 			this.deckWidth = el.clientWidth;
 		},

 		onResize() {
 		// debounce resize event handler
 		// https://stackoverflow.com/questions/5489946/how-to-wait-for-the-end-of-resize-event-and-only-then-perform-an-action
 			setTimeout(this.resized, 175);
 		},

 		cardStyle(index) {
 		// css style for cards
 			return {
	 			'max-width': `${100 / Math.trunc(this.cardsPerPage)}%`,
				'min-width': this.paginated ? 'auto' : `${(100 - this.cardsPerPage*1.25) / Math.trunc(this.cardsPerPage)}%`,
				'transition': 'all 0.01s',
				...!this.paginated && {
					'margin-bottom': '1vh', // space before scrollbar
					'margin-left': index == 0 ? '0px' : '', // 1st card
					'margin-right': index == this.forecastData.hourly.length - 1 ? '0px' : '' // last card
				}
			};
 		},

 		scrollCards(event) {
 		// automatically scroll cards
 			const el = document.getElementById('deck-cards');
 			if(event.type == 'wheel') {
 				if(this.paginated) { // paginated version
 					this.currentPage += Math.sign(-event.deltaY) > 0 ? 1 : -1;
 					if(this.currentPage < 1) { // up to first page
 						this.currentPage = 1;
 					}
 					else if(this.currentPage > Math.trunc( this.forecastData.hourly.length / Math.trunc(this.cardsPerPage) )) { // up to last page
 						this.currentPage = Math.trunc(this.forecastData.hourly.length / Math.trunc(this.cardsPerPage));
 					}
 				}
 				else { // scrollbar version
 					const cardIndex = Math.round( (el.scrollLeft + Math.sign(-event.deltaY) * el.children[1].offsetLeft) / el.children[1].offsetLeft ) // estimate card index
 					el.scrollLeft = cardIndex > 0 ? el.children[cardIndex].offsetLeft : 0 // align scroll amount with card scroll offset	
 				}
 			}
 		},

 		onWheel(event) {
 		// debounce wheel event handler
 			setTimeout(this.scrollCards(event), 250);
 		}
	},

	computed: {
		coords() {
		// latitude & longitude of presented location
			return { lat: this.lat, lon: this.lon };
		},

		cardSet() {
		// subset of forecast data to be presented in cards
 			return this.paginated
 				? this.forecastData.hourly.slice(Math.trunc(this.cardsPerPage)*(this.currentPage - 1), this.currentPage*Math.trunc(this.cardsPerPage))
 				: this.forecastData.hourly;
 		},

 		deckStyle() {
 		// css style for card deck
 			if(!this.paginated) {
 				return {
 					'overflow-x': 'auto',
					'scrollbar-width': 'thin',
					'flex-wrap': 'nowrap',
					'margin-bottom': '2vh',
					'scroll-behavior': 'smooth',
				};
			}
 		}
	},

	created() {
		window.addEventListener('resize', this.onResize);
	},

	destroyed() {
		window.removeEventListener('resize', this.onResize);
	},

	async mounted() {
		this.loading = true;
		this.forecastData = await getCityLatLon(this.lat, this.lon);
		this.loading = false;
		this.cardsPerPage = this.perPage;

		await this.$nextTick();
		this.resized();
	},

	watch: {
		async coords(newValue, oldValue) {
			this.loading = true;
			this.currentPage = 1;
			this.forecastData = await getCityLatLon(newValue.lat, newValue.lon);
			this.loading = false;	
		},

		deckWidth(newValue, oldValue) {
		// change number of cards per page when card deck is resized
			let dw = (newValue - oldValue) / oldValue;
			let adjusted = new Number((this.cardsPerPage*(1 + dw)).toFixed(1));

			if(window.innerWidth === screen.width || adjusted > this.perPage) {
				this.cardsPerPage = this.perPage;
			}
			else if(adjusted <= 1) {
				this.cardsPerPage = 1;
			}
			else {
				this.cardsPerPage = adjusted;
			}
		}
	}
}
</script>