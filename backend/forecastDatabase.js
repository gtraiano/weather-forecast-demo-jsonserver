const axios = require('axios');
const db = require('./database/database');
 
const dbName = 'onecall';
const uri = `http://localhost:${process.env.JSON_SERVER_PORT}/${dbName}`;

const insertCity = async city => {
	try {
		const result = await Promise.resolve(
			axios.post(`${uri}?lat=${Number.parseFloat(city.lat)}&lon=${Number.parseFloat(city.lon)}`,
				{ ...city },
				{ headers: { 'Content-Type': 'application/json' } }
			)
		);
		return result.data;
	}
	catch(error) {
		console.log(`Inserting (lat:${city.lat} lon:${city.lon}) failed`);
		return null;
	}
}

const insertCities = async cities => {
	const result = await Promise.all( cities.map(async city => insertCity(city)) );
	return result.data;
}

const updateCity = async (lat, lon, data) => {
	try {
		const exists = await findCity(lat, lon);
		const result = await Promise.resolve(
			axios.put(
				`${uri}/${exists.id}`,
				{ ...data },
				{ headers: { 'Content-Type': 'application/json' } }
			)
		);
		return result.data;
	}
	catch(error) {
		console.log(`lat: ${lat} lon: ${lon} does not exist`);
		return null;
	}
}

const updateCities = async cities => {
	const result = await Promise.all( cities.map(async city => updateCity(city.lat, city.lon, city)) );
	return result.data;	
}

const findCity = async (lat, lon) => {
	try {
		const result = await Promise.resolve(axios.get(`${uri}?lat=${Number.parseFloat(lat)}&lon=${Number.parseFloat(lon)}`));
		return result.data[0];
	}
	catch(error) {
		console.log(`lat: ${lat} lon: ${lon} does not exist`);
		return null;
	}
}

const allCities = async () => {
	const result = await Promise.resolve(axios.get(uri));
	return result.data;
}

const removeCity = async (lat, lon) => {
	try {
		const exists = await findCity(lat, lon);
		const result = await Promise.resolve(axios.delete(`${uri}/${exists.id}`));
		return result.status;
	}
	catch(error) {
		console.log(`lat: ${lat} lon: ${lon} does not exist`);
		return 404;
	}
}

const clearDatabase = async () => {
	//await collection.deleteMany({});
}

const connect = async () => {
	await db.checkDb();
	await Promise.resolve(axios.get(`http://localhost:${process.env.JSON_SERVER_PORT}/ping`));
}

const close = async () => {
	// close json server
}

module.exports = { 
	insertCity,
	insertCities,
	findCity,
	allCities,
	removeCity,
	updateCity,
	updateCities,
	clearDatabase,
	connect,
	close
};