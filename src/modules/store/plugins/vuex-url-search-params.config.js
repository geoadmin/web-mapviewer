
const emptyStateModifier = () => [];
const defaultModifier = value => value;

const pluginOptions = {
    subscribeTo: ["setZoom", "setLang"],
    modifiers: {
        setZoom: {
            key: "zoom"
        },
        setLang: {
            key: "lang"
        }
    }
};

// Going through config for each modifier. If the modifier doesn't specify one of the required property,
// it will replace it with the default value
Object.values(pluginOptions.modifiers).forEach((modifier) => {
    if (typeof(modifier.pushStateModifier) !== 'function') {
        modifier.pushStateModifier = defaultModifier;
    }
    if (typeof(modifier.popStateModifier) !== 'function') {
        modifier.popStateModifier = defaultModifier;
    }
    if (typeof(modifier.emptyStateModifier) !== 'function') {
        modifier.emptyStateModifier = emptyStateModifier;
    }
});

export default pluginOptions;
