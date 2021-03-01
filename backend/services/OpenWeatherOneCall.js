/* Module for OneCall OpenWeather API. Returns historical data for a city for 48 hours. */
const axios = require('axios');

const cities = require('./supportedcities.json');
const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
let apiKey = process.env.OW_API_KEY;


// params = (lat, lon)
const prepareQuery = (lat, lon) => {
	return `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
}

// fetch single query
const fetchQuery = async (query, retries = 2) => {
	try {
		console.log(`Fetching ${query}`)
		return await axios.get(query, { timeout: 1073741824 }); // needs to be resolved
	}
	catch (error) {
		console.log(`Retrying ${query}`)
		if (retries === 1) {
			console.log(`Failed ${query}`);
			throw new Error(`Failed ${query}`);
		}
		
		setTimeout(() => {}, 200);
		return fetchQuery(query, retries - 1);
	}
}

// mass api query for multiple cities
const fetchBatch = async batch => {
	let data = [];

	data = batch.map(async (entry, index) => { // entry = { id, name, lat, lon }
		let query = prepareQuery(entry.lat, entry.lon)
		let response;
		try {
			response = await Promise.resolve(fetchQuery(query));
			return ({
				cityId: entry.id,
				name: entry.name,
				...response.data
			});
		}
		catch(error) {
			return ({
				cityId: entry.id,
				name: entry.name,
			});
		}
	});

	return Promise.all(data);
}

const fetchCity = async (lat, lon) => {
	try {
		const response = await Promise.resolve(fetchQuery(prepareQuery(lat, lon)));
		return response.data;
	}

	catch (error) {
		throw error;
	}
}

// query api for all cities
const fetchAllCities = async (cityList = cities) => {
	try {
		const response = await fetchBatch(cityList);
		return response;
	}
	catch (error) {
		//console.log(error.message);
	}
}

const setOWApiKey = key => {
	apiKey = key;
}

const getOWApiKey = () => {
	return apiKey;
}

module.exports = { fetchAllCities, fetchCity, getOWApiKey, setOWApiKey }