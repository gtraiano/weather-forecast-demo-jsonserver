import store from './'
import { 
	getAllCities,
	postCityLatLon,
	deleteCityLatLon,
	updateCityLatLon
} from '../controllers/backend'

/*
city weather forecast object
------------------------------------------------------------------------------
	coords 						object		city coordinations
		lat 					float		latitude
		lon 					float		longitude
	
	name 						object 		city name in locales
		locale={en, el}			string 		name translation in locale (en, el)

	country

	continent
	
	id 							int			id
	
	forecast 					object		2-day forecast for city
		hourlyWeatherIcon 		[string]	hourly weather icon
		hourlyDt 				[int]		hourly datetime
		temperature 			[float]		hourly temperature
		humidity 				[float]		hourly humidity
		pressure 				[float]		hourly pressure
*/

const extractName = entry => {
/* extracts city name for all avalable locales */
	return Object.assign(
		{},
		...store.i18n.availableLocales.map(
			locale => (
				{
					[locale]: entry.location[locale].city || entry.location[locale].town || entry.location[locale].village
						|| entry.location[locale].address.city || entry.location[locale].address.town || entry.location[locale].address.village || entry.location[locale].address.county || entry.location[locale].address.region
						|| entry.location[locale].address.state
				}
			)
		)
	)
}

const extractCountry = entry => {
	return Object.assign(
		{},
		...store.i18n.availableLocales.map( locale => ({ [locale]: entry.location[locale].address.country || entry.location[locale].address.country_code  }) )
	)
}

const extractForecastData = entry => {
/* extracts hourly forecast data from OpenWeather API response */
	return {
		hourlyWeatherIcon: entry.hourly.map(hour => `https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`),
		hourlyDt: entry.hourly.map(hour => hour.dt*1000), // unix to js datetime
		temperature: entry.hourly.map(hour => hour.temp),
		humidity: entry.hourly.map(hour => hour.humidity),
		pressure: entry.hourly.map(hour => hour.pressure)
	}
}

const transformDatabaseData = entry => {
/* transforms OpenWeather API response for use by the app */
	return {
		coords: { lat: entry.lat, lon: entry.lon },
		name: extractName(entry),
		country: extractCountry(entry),
		continent: entry.timezone.substring(0, entry.timezone.indexOf('/')),
		id: entry.location.en.place_id,
		forecast: extractForecastData(entry)
	};
}

const state = () => ({
	allCityData: [], 	// forecast data for all cities
	lastChangedOn: 0, 	// datetime of last data fetch or data change
	fetching: false 	// data fetching is taking place
})

const getters = {
	getAllCityData: state => state.allCityData,
	getLastChangedOn: state => state.lastChangedOn,
	getCitiesCoords: state => new Map(state.allCityData.map(city => [`${city.coords.lat},${city.coords.lon}`, true])), // map of cities coordinates
	getFetching: state => state.fetching
}

const actions = {
	setAllCityData: (context, data) => {
		context.commit('setAllCityData', data);
		context.commit('setLastChangedOn', Date.now());
	},

	setAllCityDataAsync: async (context, refetch) => {
	// fetch and transform forecast data from backend
		context.commit('setFetching', true);

		let data = await getAllCities();
		data = data.map(city => transformDatabaseData(city));

		if(refetch) {
			data.forEach(async city => {
				// query backend to refresh city forecast and fetch data
				try {
					const updated = await updateCityLatLon(city.coords.lat, city.coords.lon);
					context.commit('updateCityForecastData', { lat: city.coords.lat, lon: city.coords.lon, data: transformDatabaseData(updated) });
				}
				catch(error) {
					// nothing to do
					console.error(error.message);
				}
			});
		}
		
		context.commit('setFetching', false);
		console.log('Fetched forecast data from', refetch ? 'OpenWeather' : 'backend');
		context.commit('setAllCityData', data); // save api data to state
		window.localStorage.setItem('upToDate', JSON.stringify( Math.min( ...data.map(d => d.forecast.hourlyDt[47]) ) ));
		context.commit('setLastChangedOn', Date.now());
	},

	setLastChangedOn: (context, datetime) => {
		context.commit('setLastChangedOn', datetime);
	},

	setFetching: (context, value) => {
		context.commit('setFetching', value);
	},

	appendCityAsync: async (context, city) => {
	// add and fetch forecast data for new city
		try {
			let newCity = await postCityLatLon(city.lat, city.lon, store.i18n.availableLocales);
			context.commit('appendCity', transformDatabaseData(newCity));
			context.commit('setLastChangedOn', Date.now());
			store.dispatch('search/setAddedCities', { lat: newCity.lat, lon: newCity.lon });
		}
		catch(error){
			console.error(error.message);
		}
	},

	updateCityForecastDataAsync: async (context, city) => {
		console.log(`Updating forecast data for ${city.name} lat:${city.coords.lat} lon:${city.coords.lon}`);
		context.commit('setFetching', true);
		try {
			const data = await updateCityLatLon(city.coords.lat, city.coords.lon);
			context.commit('updateCityForecastData', { lat: city.coords.lat, lon: city.coords.lon, data: transformDatabaseData(data) });
			context.commit('setFetching', false);
			context.commit('setLastChangedOn', Date.now());
		}
		catch(error) {
			console.error(error.message);
		}
	},

	removeCity: async (context, coords) => {
		try {
			await deleteCityLatLon(coords.lat, coords.lon);
			context.commit('removeCity', coords);
		}
		catch(error) {
			console.error(error.message);
		}
	}
}

const mutations = {
	setAllCityData: (state, data) => {
		state.allCityData = data;
	},

	setLastChangedOn: (state, datetime) => {
		state.lastChangedOn = datetime;
	},

	setFetching: (state, value) => {
		state.fetching = value;
	},

	appendCity: (state, city) => {
		state.allCityData = [...state.allCityData, city];
	},

	updateCityForecastData: (state, { lat, lon, data }) => {
		state.allCityData = [...state.allCityData.map(item => item.coords.lat !== lat && item.coords.lon !== lon ? item : data)];
		//state.allCityData = [...state.allCityData.filter(city => city.coords.lat !== lat && city.coords.lon !== lon ), data];
	},

	removeCity: (state, coords) => {
		state.allCityData = state.allCityData.filter(city => {
			return city.coords.lat != coords.lat && city.coords.lon != coords.lon;
		});
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}