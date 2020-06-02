import _ from 'lodash'

import { isNumber } from "@/numberUtils";

// Persist and rehydrate the `Vuex` store via url search params (window.location.search)
// To do that, it will listen (`subscribe` in Vuex terms) to all store mutators, and if one matches the configuration
// it will extract the value needed for the URL and update the URL params.
// At app startup, it will read the URL params and set the state according to what's present in the configuration
class VuexURLSearchParams {

    // Used for bypassing handling in the store subscription with arrays
    static bypassKeyForArray = 'SUBSCRIBE_BYPASS';
    // Used for bypassing handling in the store subscription with other types than array
    static bypassSimpleValue = {};


    /**
     * @param {Object} options
     * @param {Object} options.store
     * @param {Array}  options.subscribeTo
     * @param {Object} options.modifiers
     * @param {String} options.qs
     */
    constructor({
                    store,
                    subscribeTo = [],
                    modifiers = {},
                    qs = ''
                } = {}) {
        this.urlParams = new URLSearchParams(qs);
        this.urlParamsKeys = _.map(Object.values(modifiers), 'key');

        this.store = store;
        this.subscribeTo = subscribeTo;
        this.modifiers = modifiers;

        this.commitUrlParams(this.urlParams);

        this.store.subscribe(this.subscribe.bind(this));
        window.onpopstate = this.popState.bind(this);
    }

    addBypassFlag(key, payload) {
        if (payload) {
            if (_.isArray(payload)) {
                payload[VuexURLSearchParams.bypassKeyForArray] = true;
            } else {
                VuexURLSearchParams.bypassSimpleValue[key] = isNumber(payload) ? Number(payload) : payload;
            }
        }
    }

    removeBypassFlag(key) {
        if (VuexURLSearchParams.bypassSimpleValue[key]) {
            delete VuexURLSearchParams.bypassSimpleValue[key];
        }
    }

    hasBypassFlag(key, payload) {
        return !payload
            || payload[VuexURLSearchParams.bypassKeyForArray]
            || VuexURLSearchParams.bypassSimpleValue[key] === payload;
    }

    /**
     * Subscribes to the `Vuex` store mutations
     *
     * @param {Object} options
     * @param {String} options.type
     * @param {*}      options.payload
     */
    subscribe({type, payload}) {
        if (!this.subscribeTo.includes(type)) {
            return
        }
        const modifier = this.modifiers[type];
        const key = _.get(modifier, 'key');
        // we check that this subscribe is not raised by one action of this module (otherwise we could be stuck
        // in a loop of 'set state -> subscribe -> set state -> ...')
        if (this.hasBypassFlag(key, payload)) {
            // we can clear this flag as soon as we've used it
            this.removeBypassFlag(key);
            return
        }
        const pushStateModifier = _.get(modifier, 'pushStateModifier');
        if (typeof key !== 'string' || !key || typeof pushStateModifier !== 'function') {
            return
        }
        this.pushState(key, pushStateModifier(payload, this.store))
    }


    /**
     * Pushes given `key` with given `value` to the `window.history`
     *
     * @param {String} key
     * @param {String} value
     */
    pushState(key, value) {
        this.urlParams.delete(key);
        if (_.isArray(value) && !_.isEmpty(value)) {
            const normalizedValues = (Array.isArray(value) || value[Symbol.iterator]) ? value : [value];
            for (const normalized of normalizedValues) {
                this.urlParams.append(key, normalized)
            }
        } else if (value) {
            this.urlParams.append(key, value);
        } else {
            return;
        }

        const queryString = this.urlParams.toString();

        if (!_.isEmpty(queryString)) {
            window.history.pushState(queryString, null, `?${queryString}`)
        } else {
            const {origin, pathname} = window.location;
            window.history.pushState(null, null, origin + pathname)
        }
    }


    /**
     * Handles `window.history` state popping
     *
     * @param {String} state
     */
    popState({state} = {state: ''}) {
        if (_.isEmpty(state)) {
            this.commitEmpty(this.urlParamsKeys);
            return;
        }
        this.commitUrlParams(new URLSearchParams(state));
    }


    /**
     * Commits popped state value to the `Vuex` store
     *
     * @param {URLSearchParams} urlParams
    */
    commitUrlParams(urlParams) {
        const processedKeys = [];

        for (const key of urlParams.keys()) {
            if (processedKeys.includes(key)) {
                // eslint-disable-next-line no-continue
                continue
            }
            const mutation = _.findKey(this.modifiers, {key});
            const modifier = this.modifiers[mutation];
            const popStateModifier = _.get(modifier, 'popStateModifier');
            const isArray = _.get(modifier, 'isArray');
            if (mutation && typeof popStateModifier === 'function') {
                let value = urlParams.getAll(key);
                if (!isArray) {
                    value = value[0];
                }
                const modifiedValue = popStateModifier(value, this.store);
                this.addBypassFlag(key, modifiedValue);
                this.store.commit(mutation, modifiedValue);
            }
            processedKeys.push(key);
        }

        if (!processedKeys.length) {
            return;
        }

        this.commitEmpty(_.difference(this.urlParamsKeys, processedKeys));
    }


    /**
     * Commits empty state values to the `Vuex` store for the given keys
     *
     * @memberof VuexURLSearchParams
     *
     * @param {String[]} [keys=[]]
     */
    commitEmpty(keys = []) {
        for (const key of keys) {
            const mutation = _.findKey(this.modifiers, {key});
            const modifier = this.modifiers[mutation];
            const emptyStateModifier = _.get(modifier, 'emptyStateModifier');

            if (modifier && typeof emptyStateModifier === 'function') {
                const modifiedValue = emptyStateModifier(this.store);
                this.addBypassFlag(key, modifiedValue);
                this.store.commit(mutation, modifiedValue);
            }
        }
    }
}

const emptyStateModifier = () => [];
const defaultModifier = value => value;

export const pluginOptions = {
    subscribeTo: ["setZoom"],
    modifiers: {
        setZoom: {
            key: "zoom",
            pushStateModifier: defaultModifier,
            popStateModifier: defaultModifier,
            emptyStateModifier
        }
    }
};

export function getVuexURLSearchParams(options) {
    const defaultOptions = {
        subscribeTo: [],
        modifiers: {},
        qs: (window => (
            window &&
            window.location &&
            window.location.search &&
            window.location.search.replace(/^\?/, '') ||
            ''
        ))(window),
    };
    return store => new VuexURLSearchParams({
        store,
        ...defaultOptions,
        ...options,
    });
}
