require('dotenv').config({ path: '../.env' });

const path = require('path');
const fs = require('fs');

const protocols = process.env.EXPRESS_SERVER_PROTOCOLS.split(',').map( p => p.trim().toLowerCase() );

// routes and services
const router = require('./routes');
const searchCity = require('./services/NominatimSearch');
const searchLatLon = require('./services/NominatimReverse');
const owService = require('./services/OpenWeatherOneCall');
const forecastDb = require('./forecastDatabase');

// server components
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const server = express();

// middleware
server.use(function timeLog (req, res, next) { // logging timestamp
	console.log(`${new Date().toLocaleString()} ${req.protocol} ${req.method} ${req.path} ${res.statusCode}`);
	next();
});
server.use(compression());
server.use(cors());
server.use(process.env.BACKEND_API_ENDPOINT, router);

// http & https servers
if(protocols.includes('http')) {
	const http = require('http');
	var httpServer = http.createServer(server);
}

if(protocols.includes('https')) {
	const https = require('https');
	// prepare credentials
	const privateKey  = fs.readFileSync(path.resolve(process.env.EXPRESS_SERVER_PRIVATE_KEY), 'utf8');
	const certificate = fs.readFileSync(path.resolve(process.env.EXPRESS_SERVER_CERTIFICATE), 'utf8');
	if(process.env.EXPRESS_SERVER_CA) var certificateAuthority = fs.readFileSync(path.resolve(process.env.EXPRESS_SERVER_CA), 'utf8');
	const credentials = {
		key: privateKey,
		cert: certificate,
		...process.env.EXPRESS_SERVER_CA && { ca: certificateAuthority }
	};
	var httpsServer = https.createServer(credentials, server);
}

// init database connection and server listening ports
connectDb()
	.then(() => {
		if(protocols.includes('http'))
			httpServer.listen(process.env.EXPRESS_SERVER_HTTP_PORT, () => {
				console.log("HTTP server is running on port", process.env.EXPRESS_SERVER_HTTP_PORT);
			});

		if(protocols.includes('https'))
			httpsServer.listen(process.env.EXPRESS_SERVER_HTTPS_PORT, () => {
				console.log("HTTPS server is running on port", process.env.EXPRESS_SERVER_HTTPS_PORT);
			});
	});

// handle process events
process.on('exit', async () => {
	await exit();
});

process.on('close', async () => {
	await exit();
});

process.on('SIGINT', async () => {
	await exit();
});

process.on('SIGTERM', async () => {
	await exit();
});

process.on('uncaughtException', async error => {
	//console.log('Express server error');
	console.error(error.message);
	await exit(1);
})

// helper functions
// connect to db up to #retries attempts
async function connectDb(retries = 5) {
	try {
		console.log('Connecting to MongoDB server')
		await forecastDb.connect();
		console.log('Connected to MongoDB server on port', process.env.MONGODB_PORT);	
	}
	catch(error) {
		if(retries === 1) {
			console.error('Exiting');
			process.exitCode = 1;
			process.exit();
		}
		console.error(`Failed to connect to MongoDB server on port ${process.env.MONGODB_PORT} [Error: ${error.message}]`);
		console.log(`Retrying to connect to MongoDB server, remaining attempts: ${retries - 1}`);
		return connectDb(retries - 1);
	}
}

// exit app gracefully with given code
async function exit(exitCode = 0) {
	await forecastDb.close();
	console.log('Closed MongoDB connection');
	
	console.log('Shutting server');
	if(protocols.includes('http')) httpServer.close();
	if(protocols.includes('https')) httpsServer.close();
	
	console.log('Exiting');
	process.exitCode = exitCode;
	process.exit();
};