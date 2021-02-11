require('dotenv').config()
const fs = require('fs')
const path = require('path');

const dbFile = path.resolve(__dirname, process.env.DB_FILE_PATH);

// lifted straight from the package's documentation
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router(dbFile)
const middlewares = jsonServer.defaults()

async function checkFileExists(filepath) {
	try {
   		await fs.promises.access(filepath, fs.constants.F_OK);
   		return true;
  	}
	catch(e) {
		return false;
	}
}

async function checkDb() {
	// make sure db file exists and prepare it if empty
	if(await checkFileExists(dbFile)) {
		console.log(dbFile, 'exists, checking size');
		fs.stat(dbFile, (err, stats) => {
			if (stats.size < '{"onecall":[]}'.length) { // minimum content for db to be valid
				fs.writeFileSync(dbFile, '{"onecall":[]}', 'utf8');
				console.log(dbFile, 'was empty, setting minimum data');
			}
			else {
				console.log('size OK');
			}
		})
	}
	else {
		console.log(dbFile, 'does not exist, creating');
		fs.mkdir(path.dirname(dbFile), { recursive: true }, (err) => {
			if (err) throw err;
		});
		fs.writeFileSync(dbFile, '{"onecall":[]}', 'utf8') // create file
	}
}

server.use(middlewares)

// useful for checking if server is running
server.get('/ping', (req, res) => {
	res.jsonp('pong')
})
 
// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
	if (req.method === 'POST' || req.method === 'PUT') {
		req.body.createdAt = Date.now() // add timestamp on records
	}
	// Continue to JSON Server router
	next()
})
 
// Use default router
server.use(router)
server.listen(process.env.JSON_SERVER_PORT)

module.exports = { server, checkDb }