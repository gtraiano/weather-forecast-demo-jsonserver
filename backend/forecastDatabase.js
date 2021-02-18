const axios = require('axios');
const db = require('./database/database');
 
const dbName = 'onecall';
const uri = `http://localhost:${process.env.JSON_SERVER_PORT}/${dbName}`;

/* CRUD operations */

const insertCity = async city => {
// (C)reates city
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
		throw new Error(`Inserting lat:${city.lat} lon:${city.lon} failed`);
	}
}

const findCity = async (lat, lon) => {
// (R)eads city
	try {
		const result = await Promise.resolve(axios.get(`${uri}?lat=${Number.parseFloat(lat)}&lon=${Number.parseFloat(lon)}`));
		if(result.data.length)
			return result.data[0];
		else
			throw new Error(`lat: ${lat} lon: ${lon} does not exist`);
	}
	catch(error) {
		throw error;
	}
}

const updateCity = async (lat, lon, data) => {
// (U)pdates city
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
		if(error.message.includes('not exist'))
			throw error;
		else
			throw new Error(`Updating lat: ${lat} lon: ${lon} failed`);
	}
}

const removeCity = async (lat, lon) => {
// (D)eletes city
	try {
		const exists = await findCity(lat, lon);
		const result = await Promise.resolve(axios.delete(`${uri}/${exists.id}`));
		//return result.status;
	}
	catch(error) {
		if(error.message.includes('not exist'))
			throw error;
		else
			throw new Error(`Deleting lat: ${lat} lon: ${lon} failed`);
	}
}

/* batch operations */
const insertCities = async cities => {
// inserts multiple cities
	const result = await Promise.all(
		cities.map(async city => {
			try {
				return await insertCity(city);
			}
			catch(error) {
			}
		})
	);
	return result.data;
}

const updateCities = async cities => {
// updates multiple cities
	const result = await Promise.all(
		cities.map(async city => {
			try {
				return await updateCity(city.lat, city.lon, city);
			}
			catch(error) {	
				return city;		
			}
		})
	);
	return result.data;	
}

const allCities = async () => {
// reads all cities
	const result = await Promise.resolve(axios.get(uri));
	return result.data;
}

const clearDatabase = async () => {
// deletes all cities
	const cities = await allCities();
	cities.forEach(async city => {
		try {
			await removeCity(city.lat, city.lon);
		}
		catch(error) {

		}
	})

	return (await allCities()).length == 0;
}

/* database connection */
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