import log from '@/utils/logging'

const targetWindow = parent ?? window.parent ?? window.opener ?? window.top

/**
 * All events fired by the iFrame postMessage implementation.
 *
 * @enum
 */
export const IFRAME_EVENTS = {
    /**
     * Event raised whenever the app changes its state (the URL changed).
     *
     * Payload of this event : a String with the new URL of the viewer
     */
    CHANGE: 'gaChange',
    /**
     * Event raised when a feature has been selected. Will fire as many events as there are feature
     * selected on the map (won't bundle all features into one event)
     *
     * Payload of this event : a JSON containing the layerId and featureId of the selected feature
     */
    FEATURE_SELECTION: 'gaFeatureSelection',
}

/**
 * Sends information to the iFrame's parent about features, through the use of the postMessage
 * HTML/Javascript API.
 *
 * @param {LayerFeature[]} features List of features for which we want to send information to the
 *   iFrame's parent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 * @see https://codepen.io/geoadmin/pen/yOBzqM?editors=0010
 */
export function sendFeatureInformationToIFrameParent(features) {
    if (!targetWindow) {
        log.debug(
            'Embed view loaded as root document of a browser tab, cannot communicate with opener/parent'
        )
        return
    }
    // if no features are given, nothing to do
    if (!Array.isArray(features) || features.length === 0) {
        return
    }
    log.debug('sending information about selected features to iframe parent')
    // from what I can understand from the codepen, one event is fired per feature with a structured response
    features.forEach((feature) => {
        targetWindow.postMessage(
            {
                // see codepen above, for backward compatibility reasons we need to use the same type as mf-geoadmin3
                type: IFRAME_EVENTS.FEATURE_SELECTION,
                payload: {
                    layerId: feature.layer.id,
                    featureId: feature.id,
                    // if we want to expose more stuff from our features (EGID, EWID, etc...), it should come here...
                },
            },
            // meaning anyone, any host, can receive this event when adding our app as embedded on their website,
            // so let's be cautious with what we add to the payload
            '*'
        )
        // mf-geoadmin3 was also sending the same feature in a different unstructured/string format "layerId#featureId"
        // but this comment here https://github.com/geoadmin/mf-geoadmin3/blob/6a7b99a2cc9980eec27b394ee709305a239549f1/src/components/tooltip/TooltipDirective.js#L661-L668
        // suggest that this was already to accommodate some legacy support, and was supposed to be removed "soon"
        // so let's not implement this format in the new viewer and see what happens.
    })
}

/**
 * Is used to notify the parent the state of the app has changed. While embedding with VueJS, it's
 * not possible to watch the iFrame src attribute, so an event is required to be notified of a
 * children change.
 *
 * This is mainly used so that the iframe generator (menu share -> embed) can change the iframe
 * snippet if the user decide to move / zoom the map while looking at the preview
 */
export function sendChangeEventToParent() {
    if (!targetWindow) {
        log.debug(
            'Embed view loaded as root document of a browser tab, cannot communicate with opener/parent'
        )
        return
    }
    targetWindow.postMessage(
        {
            type: IFRAME_EVENTS.CHANGE,
            payload: {
                newUrl: window.location.href,
            },
        },
        '*'
    )
}
