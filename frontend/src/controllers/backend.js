import axios from 'axios';

let backendProtocol = process.env.EXPRESS_SERVER_PROTOCOLS.split(',').map(p => p.trim().toLowerCase()).includes('https') ? 'https' : 'http';
let backendDomain = process.env.BACKEND_DOMAIN;
let backendPort = backendProtocol === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : process.env.EXPRESS_SERVER_HTTP_PORT;
let backendEndpoint = process.env.BACKEND_API_ENDPOINT;
let baseUrl = `${backendProtocol}://${backendDomain}:${backendPort}${backendEndpoint}`;

const pingTimeout = 3000;
// ping active protocol
const pingActiveProtocol = async () => {
	try {
		return await axios.get(
			`${baseUrl}ping`,
			{
				timeout: pingTimeout,
				headers: { 'Access-Control-Allow-Origin': true }
			}
		)
	}
	catch(error) {
		console.log(error.message);
	}
}

// ping specific protocol
const pingProtocol = async protocol => {
	try {
		if(protocol.toLowerCase() === 'http') {
			return await axios.get(
				`http://${process.env.BACKEND_DOMAIN}:${process.env.EXPRESS_SERVER_HTTP_PORT}${process.env.BACKEND_API_ENDPOINT}ping`,
				{
					timeout: pingTimeout,
					headers: { 'Access-Control-Allow-Origin': true } 
				}
			);
		}
		else if(protocol.toLowerCase() === 'https') {
			return await axios.get(
				`https://${process.env.BACKEND_DOMAIN}:${process.env.EXPRESS_SERVER_HTTPS_PORT}${process.env.BACKEND_API_ENDPOINT}ping`,
				{
					timeout: pingTimeout,
					headers: { 'Access-Control-Allow-Origin': true } 
				}
			);
		}
	}
	catch(error) {
		console.error(error.message);
		return null;
	}
}
// get and set backend parameters
const setActiveProtocol = value => {
	backendProtocol = value;
	backendPort = backendProtocol === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : process.env.EXPRESS_SERVER_HTTP_PORT;
	baseUrl = `${backendProtocol}://${process.env.BACKEND_DOMAIN}:${backendPort}${process.env.BACKEND_API_ENDPOINT}`;
}

const getActiveProtocol = () => backendProtocol

const getActivePort = () => backendPort

const setBackendUrl = url => {
/* parse url and set backend parameters */
	const params = [...url.matchAll(/(.*):\/{2}(.+?):??(?=\d+)(\d*?)(\/.*)/gm)];
	if(!params.length) return;
	
	backendProtocol = params[1];
	backendDomain = params[2];
	backendPort = params[3] || 80;
	backendEndpoint = params[4];
	baseUrl = url;
}

// Nominatim calls
const nominatimSearchName = async (name, locale) => {
	try {
		const results = await axios.get(`${baseUrl}nominatim/${name}`, { headers: { Locale: locale }});
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const nominatimSearchLatLon = async (lat, lon, locale) => {
	try {
		const results = await axios.get(`${baseUrl}nominatim/${lat}/${lon}`, { headers: { Locale: locale } });
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// OpenWeather call
const openWeatherSarch = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}openweather/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database get city
const getAllCities = async () => {
	try {
		const results = await axios.get(`${baseUrl}coords`);
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const updateAllCities = async () => {
	try {
		const results = await axios.get(`${baseUrl}coords/refetch`);
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}	
}

const getCityLatLon = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}coords/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const updateCityLatLon = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}coords/${lat}/${lon}/refetch`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}


// database put city
const putCityLatLon = async (lat, lon, data) => {
	try {
		const result = axios.put(`${baseUrl}coords`, data);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database delete city
const deleteCityLatLon = async (lat, lon, locale) => {
	try {
		const result = await axios.delete(`${baseUrl}coords/${lat}/${lon}`);
		return result;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database post city
const postCityLatLon = async (lat, lon, locales) => {
	try {
		const result = await axios.post(`${baseUrl}coords/${lat}/${lon}`, {}, { headers: { Locales: locales.toString() } });
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const postCity = async data => {
	try {
		const result = await axios.post(`${baseUrl}coords`, data);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const getDetailedForecastLatLon = async (lat, lon) => {
	try {
		const result = await axios.post(`${baseUrl}detailed/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error);
	}
}

export { 
	nominatimSearchName,
	nominatimSearchLatLon,
	openWeatherSarch,
	getAllCities,
	updateAllCities,
	getCityLatLon,
	updateCityLatLon,
	putCityLatLon,
	deleteCityLatLon,
	postCityLatLon,
	postCity,
	getDetailedForecastLatLon,
	pingActiveProtocol,
	pingProtocol,
	setActiveProtocol,
	getActiveProtocol,
	getActivePort,
	setBackendUrl
};