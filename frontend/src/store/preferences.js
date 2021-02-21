import {
	pingProtocol,
	setActiveProtocol,
	getActiveProtocol,
	getActivePort
} from '../controllers/backend';

const state = () => ({
	backend: {
		availableProtocols: [],
		activeProtocol : getActiveProtocol(),
		port: getActivePort()
	},

	frontend: {
		detailedForecastStyle: JSON.parse(window.localStorage.getItem('frontend.detailedForecastStyle')) || 'scrollbar',
		availableThemes: ['regular', 'dark', 'terminal'],
		activeTheme: JSON.parse(window.localStorage.getItem('frontend.activeTheme')) || 'regular',
		autoRefetch: JSON.parse(window.localStorage.getItem('frontend.autoRefetch')) || false,
		autoRefetchPeriod: JSON.parse(window.localStorage.getItem('frontend.autoRefetchPeriod')) || 12 // hours
	}
});

const getters = {
	getPreferences: state => state,
	getPreference: state => preference => state[preference],
	getAvailableProtocols: state => state.backend.availableProtocols
}

const actions = {
	setPreference: (context, { preference, value }) => {
		context.commit('setPreference', { preference, value });
		window.localStorage.setItem(preference, JSON.stringify(/-?\d+\.?\d+/.test(value.toString()) ? Number.parseFloat(value) : value));
	},

	initializeAvailableProtocols: async context => {
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