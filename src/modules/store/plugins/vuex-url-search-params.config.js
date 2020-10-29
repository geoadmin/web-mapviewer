
const emptyStateModifier = () => [];
const defaultModifier = value => value;
const getterPushStateModifier = (_, store, getterName) => store.getters[getterName];

const pluginOptions = {
    subscriptions: [
        {
            listenTo: 'setExtent',
            urlParamKey: 'zoom',
            dispatchTo: 'setZoom',
            pushStateModifier: getterPushStateModifier,
        },
        {
            listenTo: 'setLang',
            urlParamKey: 'lang',
            dispatchTo: 'setLang',
        },
    ]

};

// Going through config for each modifier. If the modifier doesn't specify one of the required property,
// it will replace it with the default value
Object.values(pluginOptions).forEach((subscription) => {
    if (typeof(subscription.pushStateModifier) !== 'function') {
        subscription.pushStateModifier = defaultModifier;
    }
    if (typeof(subscription.popStateModifier) !== 'function') {
        subscription.popStateModifier = defaultModifier;
    }
    if (typeof(subscription.emptyStateModifier) !== 'function') {
        subscription.emptyStateModifier = emptyStateModifier;
    }
});

export default pluginOptions;
