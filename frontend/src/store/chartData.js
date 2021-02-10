import store from './'
/*
  chartData Schema
  ----------------
  chartData = [
  	{
		city.name,
		city.id,
		variables: {
			temperature: [values],
			humidity: [values],
			pressure: [values]
		}
  	},
  	...
  ]
*/

const units = {
	temperature: '\u2103',
	humidity: '%',
	pressure: 'hPa'
}

const forecastVariables = source => {
/* returns a list of plot variables */
    let variables = Object.keys(source.forecast).filter(key => !['hourlyDt', 'hourlyWeatherIcon'].includes(key)); // exclude non-variable properties
    return variables;
}

const generateCityChartData = async city => {
/* prepares plot data for given city */
	if (city) {
		let chartData = [];
		let labels = [];
		let data = [];

		forecastVariables(city).forEach(variable => {
			data = city.forecast[variable];
			labels = city.forecast.hourlyDt;

			chartData[variable] = {
				locale: store.i18n.locale,
	    		variable: `${store.i18n.t(variable)} ${units[variable]}`, // pass selected variable name
	    		labels: labels,
	    		title: city.name[store.i18n.locale],
	    		datasets: [{
	           		fill: false,
	           		tension: 0.1,
	           		borderColor: "#80b6f4", // if more than one datasets, color should be set randomly or left to chart.js to decide
	           		label: city.name[store.i18n.locale],
	           		data: data
	        	}]
			};
		})

		return new Promise((resolve, reject) => {
			resolve({
				name: city.name[store.i18n.locale],
				id: city.id,
				variables: chartData		
			});
		})
	}
	else {
	  return {};
	}
}

const generateData = source => {
/* returns plot data for all cities */
	return source && source.length ? source.map(async city => await generateCityChartData(city)) : [] // promises to be resolved when necessary
}

const state = () => ({
	chartData: []
})

const getters = {
	getChartData: state => state.chartData,
	getLocale: state => state.locale
}

const mutations = {
	setChartData: (state, data) => {
		state.chartData = data;
	},

	setLocale: (state, locale) => {
		state.locale = locale;
    }
}

const actions = {
	generateChartData: (context, source) => {
		context.commit('setChartData', generateData(source));
	},

	setLocale: ({ commit }, locale) => {
    	commit('setLocale', locale);
    }
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}