/* Module for OneCall OpenWeather API. Returns historical data for a city for 48 hours. */
const axios = require('axios');

const cities = require('./supportedcities.json');
const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
const apiKey = process.env.OW_API_KEY;


// params = (lat, lon)
const prepareQuery = (lat, lon) => {
	return `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
}

// fetch single query
const fetchQuery = async (query, retries = 5) => {
	try {
		console.log(`Fetching ${query}`)
		return await axios.get(query); // needs to be resolved
	}
	catch (error) {
		console.log(`Retrying ${query}`)
		if (retries === 1) {
			console.log(`Failed ${query}`);
			throw error
		}
		
		setTimeout(() => {}, 100)
		return fetchQuery(query, retries - 1);
	}
}

// mass api query for multiple cities
const fetchBatch = async batch => {
	let data = [];

	try {
		data = batch.map(async entry => { // entry = { id, name, lat, lon }
			let query = prepareQuery(entry.lat, entry.lon)
			let response = await fetchQuery(query)

			return ({
				cityId: entry.id,
				name: entry.name,
				...response.data
			});
		});
	}
	catch (error) {
		throw error;
	}

	return Promise.all(data);
}

const fetchCity = async (lat, lon) => {
	try {
		const response = await fetchQuery(prepareQuery(lat, lon));
		return response.data;
	}

	catch (error) {
		console.log(error.message);
	}
}

// query api for all cities
const fetchAllCities = async (cityList = cities) => {
	try {
		const response = await fetchBatch(cityList);
		return response;
	}
	catch (error) {
		console.log(error.message);
	}
}

module.exports = { fetchAllCities, fetchCity }