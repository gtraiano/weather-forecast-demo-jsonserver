import {
	pingProtocol,
	setActiveProtocol,
	getActiveProtocol,
	getActivePort
} from '../controllers/backend';

const state = () => ({
	backend: {
		availableProtocols: [],					// available backend protocols
		activeProtocol : getActiveProtocol(),	// active backend protocol
		port: getActivePort()					// active backend protocol port
	},

	frontend: {
		detailedForecastStyle: JSON.parse(window.localStorage.getItem('frontend.detailedForecastStyle')) || 'scrollbar',	// scrollbar or pagination for detailed forecast
		availableThemes: ['regular', 'dark', 'terminal'],																	// available app themes
		activeTheme: JSON.parse(window.localStorage.getItem('frontend.activeTheme')) || 'regular',							// active app theme
		autoRefetch: JSON.parse(window.localStorage.getItem('frontend.autoRefetch')) || false,								// automatically refresh forecast data
		autoRefetchOlderThan: JSON.parse(window.localStorage.getItem('frontend.autoRefetchOlderThan')) || 12, 				// forecast data is outdated if older than, in hours
		checkUpToDatePeriod: JSON.parse(window.localStorage.getItem('frontend.checkUpToDatePeriod')) || 60*60000 			// how often to check if forecast data is up to date, in minutes
	}
});

const getters = {
	getPreferences: state => state,
	getPreference: state => preference => {
		const path = preference.split('.'); // preference follows the form 'a.b'
		return path.length === 2 ? state[path[0]][path[1]] : undefined;
	},
	getAvailableProtocols: state => state.backend.availableProtocols
}

const actions = {
	setPreference: (context, { preference, value }) => {
	// preference follows the form 'a.b'
		context.commit('setPreference', { preference, value });
		window.localStorage.setItem(preference, JSON.stringify(/-?\d+\.?\d+/.test(value.toString()) ? Number.parseFloat(value) : value));
	},

	initializeAvailableProtocols: async context => {
	// ping backend for available protocols
		const protocols = await Promise.all(
			['http', 'https'].map(async protocol => await pingProtocol(protocol))
		);
		context.commit('setPreference', { preference: 'backend.availableProtocols', value: protocols });
		context.commit('setPreference', { preference: 'backend.activeProtocol', value: getActiveProtocol() });
	},

	setActiveProtocol: async (context, value) => {
		const ping = await pingProtocol(value); // ping to check if protocol is actually available
		if(!ping || ping.status !== 200) {
			console.log(protocol, 'backend server is not available');
			return;
		}
		setActiveProtocol(value.toLowerCase());
		context.commit('setPreference', { preference: 'backend.activeProtocol', value: value.toLowerCase() });
		context.commit('setPreference', { preference: 'backend.port', value: getActivePort() });
	}
}

const mutations = {
	setPreference: (state, { preference, value }) => {
		const path = preference.split('.'); // preferences follow the form 'a.b'
		
		if(value instanceof Array) { // assume type of array elements is ok
			state[path[0]][path[1]] = [...value];
		}
		else if(/-?\d+\.?\d+/.test(value.toString())) { // numeric
			state[path[0]][path[1]] = Number.parseFloat(value);
		}
		else if(/^[a-zA-Z]+$/.test(value.toString())) {
			state[path[0]][path[1]] = value;
		}
		else {
			state[path[0]][path[1]] = value;
		}
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}