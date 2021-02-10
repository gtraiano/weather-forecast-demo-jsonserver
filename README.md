# weather-forecast-demo
> Demo weather forecast website

## Information
Frontend written in Vue.js, backend in Node + Express.

The application utilizes
 - Nominatim and Openstreetmap API for location data
 - OpenWeather API for forecast data
 - Vue Leaflet to render the map
 - vue-chartjs to render plots

## Build Setup

### Backend
Make sure MongoDB is running before starting the backend

``` bash
# install dependencies
npm install

# run backend
npm start

# run backend for development
npm run dev
```

### Frontend
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
The build will be found under `./frontend/dist/`.

## Environment
A single .env file must reside at the project's root folder. A sample .env file is provided in `.env.sample`.

### Express server config
`EXPRESS_SERVER_PROTOCOLS` Comma separated list including HTTP and/or HTTPS protocols. If HTTPS is included, the frontend will prefer it over HTTP.

`EXPRESS_SERVER_HTTP_PORT` HTTP server port

`EXPRESS_SERVER_HTTPS_PORT` HTTPS server port
#### SSL credentials
`EXPRESS_SERVER_PRIVATE_KEY` SSL private key file absolute path

`EXPRESS_SERVER_CERTIFICATE` SSL public key file absolute path

`EXPRESS_SERVER_CA` SSL certification authority (optional)

### Backend config
`MONGODB_PORT` MongoDB port

`BACKEND_DOMAIN` Backend domain

`BACKEND_API_ENDPOINT` Backend endpoint

`OW_API_KEY` OpenWeather API key

### Webpack Dev Server config
`WEBPACK_DEV_SERVER_HTTPS` Set to 1 to run server with HTTPS protocol

#### SSL credentials
If not provided, Webpack Dev Server will generate its own.

`WEBPACK_DEV_SERVER_PRIVATE_KEY` SSL private key absolute path

`WEBPACK_DEV_SERVER_CERTIFICATE` SSL public key absolute path

`WEBPACK_DEV_SERVER_CA` SSL certification authority (optional)


## License - Proprietary
Copyright - Spiros Dimopoulos <sdimopoulos@irisweb.gr>
Modification and additions - Georgios Traianos <gtraiano@gmail.com>
It is provided as is without any guarantee for demonstration purposes solely.
Not to be redistributed in any form, copied or sold.