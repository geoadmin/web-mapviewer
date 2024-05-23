import log from '@/utils/logging.js'

/**
 * Sends information to the iFrame's parent about features, through the use of the postMessage
 * HTML/Javascript API.
 *
 * @param {LayerFeature[]} features List of features for which we want to send information to the
 *   iFrame's parent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 */
export function sendFeatureInformationToIFrameParent(features) {
    const targetWindow = parent ?? window.parent ?? window.opener ?? window.top
    if (!targetWindow) {
        log.debug(
            'Embed view loaded as root document of a browser tab, cannot communicate with opener/parent'
        )
        return
    }
    // if no features are given, nothing to do
    if (features?.length === 0) {
        return
    }
    log.debug('sending information about selected features to iframe parent')
    // from what I can understand from the codepen, one event is fired per feature with a structured response
    features.forEach((feature) => {
        targetWindow.postMessage(
            {
                // see codepen above, for backward compatibility reasons we need to use the same type as mf-geoadmin3
                type: 'gaFeatureSelection',
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
