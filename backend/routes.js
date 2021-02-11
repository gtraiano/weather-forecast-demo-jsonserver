/*
PATH						METHOD			PARAMETERS 						HEADERS 										ACTION

/coords 					GET 																							get all cities in database
/coords/refetch 			GET 																							fetch forecast data from OpenWeather, update and return updated cities in database

/coords/:lat/:lon 			GET 			lat=latitude lon=longitude 														get data from database
/coords/:lat/:lon/refetch 	GET 			lat=latitide lon=longitude 														fetch forecast data from OpenWeather and update existing record

/coords						POST 			post data in request body														insert city in database (requires data in request body)
/coords/:lat/:lon			POST 			lat=latitude lon=longitude		Locales = comma separated list of locales		insert city in database (does not require data in request body)

/coords/:lat/:lon 			PUT 			lat=latitude lon=longitude 														update city in database

/coords/:lat/:lon 			DELETE 			lat=latitude lon=longitude 														delete city from database

/openweather/:lat/:lon 		GET 			lat=latitude lon=longitude 														OpenWeather forecast search

/nominatim/:name 			GET 											Locale = search results locale					Nominatim search
/nominatim/:lat:/lon 		GET 			lat=latitude lon=longitude 		Locale = search result locale					Nominatim reverse search
*/

const { searchCity } = require('./services/NominatimSearch');
const { searchLatLon } = require('./services/NominatimReverse');
const owService = require('./services/OpenWeatherOneCall');
const forecastDb = require('./forecastDatabase');

// special request headers names
const headers = {
	refetch: 'Refetch', 	// set to 'true' or '1' to fetch forecast data from OpenWeather
	locales: 'Locales',		// Nominatim search for multiple locales ('en', 'el')
	locale: 'Locale' 		// Nominatim search for single locale
};

const removeId = (req, res, next) => {
/* removes _id property when returning database documents as json */
// https://lemnik.wordpress.com/2017/07/31/writing-express-middleware-to-modify-the-response/
	res.format({
		'application/json': () => {
			const json_ = res.json;
			res.json = function(data) {
				if(data instanceof Array) {
					data.forEach(item => {
						if (Object(item).hasOwnProperty('_id'))
							delete item._id;
					});
				}
				else if(typeof data === 'object') {
					if (Object(data).hasOwnProperty('_id'))
						delete data._id;
				}
				json_.call(res, data);
			}
		}
	});

	next();
};

/*
const unixToJsDatetime = (req, res, next) => {
	res.format({
		'application/json': () => {
			const json_ = res.json;
			res.json = function(data) {
				if(data instanceof Array) {
					data.forEach(item => {
						if (Object(item).hasOwnProperty('hourly'))
							item.hourly.forEach(hr => {
								hr.dt *= 1000;
							})
					});
				}
				else if(typeof data === 'object') {
					if (Object(data).hasOwnProperty('hourly'))
						data.hourly.forEach(hr => {
							hr.dt *= 1000;
						})
				}
				json_.call(res, data);
			}
		}
	});

	next();
}
*/

const refetchForecastData = async (lat, lon) => {
/* refetches fresh data from OpenWeather fot city document */
	const forecastData = await owService.fetchCity(lat, lon);
	
	if(!forecastData) { // something wrong with the api call
		throw new Error('OpenWeather API call wrong parameter');
		return;
	}

	// get rid of coords from OpenWeather data
	delete forecastData.lat;
	delete forecastData.lon;

	return {
		lat: Number.parseFloat(lat),
		lon: Number.parseFloat(lon),
		...forecastData
	};
}

const express = require('express');
const router = express.Router();

// middleware
router.use(express.json());
router.use(removeId);
//router.use(unixToJsDatetime);

// routes
router.get('/coords', async (req, res, next) => {
/* get all cities from database */
	let results = await forecastDb.allCities();
	res.json(results);
});

router.get('/coords/refetch', async (req, res, next) => {
/* get all cities from database and refreshes their forecast data */
	let results = await forecastDb.allCities();
	
	results = await Promise.all(
		results.map( async city => ({ ...city, ...await refetchForecastData(city.lat, city.lon) }) )
	);
	await forecastDb.updateCities(results);

	res.json(results);
});

router.get('/coords/:lat/:lon', async (req, res, next) => {
/* get city by lat & lon */
	try {
		let forecastData = null;
		let cityData = await forecastDb.findCity(req.params.lat, req.params.lon);

		if(!cityData) {
			res.status(404).end();
			return;
		}

		forecastData = await forecastDb.findCity(req.params.lat, req.params.lon);
		forecastData ? res.json(forecastData) : res.status(404).end();
	}
	catch(error) {
		res.status(404).end();
		next(error);
	}
});

router.get('/coords/:lat/:lon/refetch', async (req, res, next) => {
/* get city by lat & lon */
	try {
		let forecastData = null;
		let cityData = await forecastDb.findCity(req.params.lat, req.params.lon);

		if(!cityData) {
			res.status(404).end();
			return;
		}

		const updated = await refetchForecastData(req.params.lat, req.params.lon);
		forecastData = await forecastDb.updateCity(req.params.lat, req.params.lon, { ...cityData, ...updated });
		forecastData ? res.json(forecastData) : res.status(404).end();
	}
	catch(error) {
		res.status(404).end();
		next(error);
	}
});

router.get('detailed/:lat/:lon', async (req, res, next) => {
	try {
		let forecast = await forecastDb.findCity(req.params.lat, req.params.lon);
		if(!forecast) {
			res.status(404).end();
			return;
		}
		res.json(detailed.hourly);
	}
	catch(error) {
		res.status(404).end();
		next(error);
	}
});

router.put('/coords/:lat/:lon', async (req, res, next) => {
/* modify city data with data contained in request body */
	try {
		const body = req.body;
		if (Object.keys(body).length === 0 && body.constructor === Object) { // empty object
			res.status(400).end();

		}
		const result = await forecastDb.updateCity(req.params.lat, req.params.lon, body);
		if(result) res.json(200).end();
		//else if(result.matchedCount && !result.modifiedCount) res.status(304).end();
		else res.status(404).end();
	}
	catch(error){
		res.status(404).end()
		next(error);
	}
});

router.post('/coords', async (req, res, next) => {
/* add city with data in request body */
	try {
		const body = req.body;
		if (Object.keys(body).length === 0 && body.constructor === Object) { // empty object
			res.status(400).end();

		}
		const result = await forecastDb.insertCity(body);
		res.status(201).json(body);
	}
	catch(error) {
		res.status(404).end();
		next(error);
	}
});

router.post('/coords/:lat/:lon', async (req, res, next) => {
/* add city with coordinates (no data in body required) */
	try {
		if(typeof req.get(headers.locales) === 'undefined') {
			res.status(400).end();
			return;
		}

		const locales = req.get(headers.locales).split(',');
		const locationData = Object.assign(
			{},
			...await Promise.all( locales.map(async locale => ({ [locale]: await searchLatLon(req.params.lat, req.params.lon, locale) }) ) )
		);

		forecastData = await owService.fetchCity(req.params.lat, req.params.lon);
		
		if(!forecastData || !locationData) { // something wrong with the api calls parameters
			res.status(400).end();
			return;
		}

		// we want keep coords from location data only
		delete forecastData.lat;
		delete forecastData.lon;

		const toInsert = {
			location: locationData,
			lat: Number.parseFloat(req.params.lat),
			lon: Number.parseFloat(req.params.lon),
			...forecastData
		};
		
		const result = await forecastDb.insertCity(toInsert);
		res.status(201).json(toInsert);
	}
	catch(error) {
		res.status(404).end();
		next(error);
	}
});

router.delete('/coords/:lat/:lon', async (req, res, next) => {
	const result = await forecastDb.removeCity(req.params.lat, req.params.lon);
	res.status(result).end();
});

router.get('/openweather/:lat/:lon', async (req, res, next) => {
/* OpenWeather call by lat, lon */
	try {
		const data = await owService.fetchCity(req.params.lat, req.params.lon);
		res.json(data);
	}
	catch(error) {
		next(error);
	}
});

router.get('/nominatim/:name', async (req, res, next) => {
/* Nominatim search by name */
	try {
		const data = await searchCity(req.params.name, req.get(headers.locale) || 'en');
		res.json(data);
	}
	catch(error) {
		next(error);
	}
})

router.get('/nominatim/:lat/:lon', async (req, res, next) => {
/* reverse Nominatim search by lat, lon */
	try {
		const data = await searchLatLon(req.params.lat, req.params.lon, req.get(headers.locale) || 'en');
		res.json(data);
	}
	catch(error) {
		next(error);
	}
})

router.get('/ping', (req, res) => {
	res.send('pong');
});

module.exports = router;