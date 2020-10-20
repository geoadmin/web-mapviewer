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
     * @param {Object}  options.subscriptions
     * @param {String} options.qs
     */
    constructor({ store, subscriptions = [], qs = ''} = {}) {
        this.urlParams = new URLSearchParams(qs);
        this.urlParamsKeys = subscriptions.map(sub => sub.urlParamKey);

        this.store = store;
        this.subscribeTo = subscriptions.map(sub => sub.listenTo);
        this.subscriptions = subscriptions;
        this.commitUrlParams(this.urlParams);

        this.store.subscribe(this.subscribe.bind(this));
        window.onpopstate = this.popState.bind(this);
    }

    addBypassFlag(key, payload) {
        if (payload) {
            if (Array.isArray(payload)) {
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
        const modifier = this.subscriptions.find(sub => sub.listenTo === type);
        const { urlParamKey, pushStateModifier } = modifier;
        // we check that this subscribe is not raised by one action of this module (otherwise we could be stuck
        // in a loop of 'set state -> subscribe -> set state -> ...')
        if (this.hasBypassFlag(urlParamKey, payload)) {
            // we can clear this flag as soon as we've used it
            this.removeBypassFlag(urlParamKey);
            return
        }
        if (typeof key !== 'string' || !urlParamKey || typeof pushStateModifier !== 'function') {
            return
        }
        this.pushState(urlParamKey, pushStateModifier(payload, this.store, urlParamKey))
    }


    /**
     * Pushes given `key` with given `value` to the `window.history`
     *
     * @param {String} key
     * @param {String} value
     */
    pushState(key, value) {
        this.urlParams.delete(key);
        if (Array.isArray(value) && value.length !== 0) {
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

        if (queryString && queryString.length !== 0) {
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
        if (state && state.length > 0) {
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
        const processedUrlParamKeys = [];
        for (const urlParamKey of urlParams.keys()) {
            if (processedUrlParamKeys.includes(urlParamKey)) {
                // eslint-disable-next-line no-continue
                continue
            }
            const subscription = this.subscriptions.find(sub => sub.urlParamKey === urlParamKey);
            const { popStateModifier, isArray } = subscription
            if (subscription && typeof popStateModifier === 'function') {
                let value = urlParams.getAll(urlParamKey);
                if (!isArray) {
                    value = value[0];
                }
                const modifiedValue = popStateModifier(value, this.store);
                this.addBypassFlag(urlParamKey, modifiedValue);
                this.store.dispatch(subscription.dispatchTo, modifiedValue);
            }
            processedUrlParamKeys.push(urlParamKey);
        }

        if (!processedUrlParamKeys.length) {
            return;
        }

        this.commitEmpty(this.urlParamsKeys.filter(key => processedUrlParamKeys.includes(key)));
    }


    /**
     * Commits empty state values to the `Vuex` store for the given keys
     *
     * @memberof VuexURLSearchParams
     *
     * @param {String[]} [urlParamKeys=[]]
     */
    commitEmpty(urlParamKeys = []) {
        for (const urlParamKey of urlParamKeys) {
            const subscribtion = this.subscriptions.find(sub => sub.urlParamKey === urlParamKey);
            const { emptyStateModifier } = subscribtion

            if (subscribtion && typeof emptyStateModifier === 'function') {
                const modifiedValue = emptyStateModifier(this.store);
                this.addBypassFlag(urlParamKey, modifiedValue);
                this.store.dispatch(subscribtion.dispatchTo, modifiedValue);
            }
        }
    }
}


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
