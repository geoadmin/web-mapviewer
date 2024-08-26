import { toRadians } from 'ol/math'
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'
import { useStore } from 'vuex'

import log from '@/utils/logging'

const dispatcher = { dispatcher: 'useDeviceOrientation.composable' }

// The values here below have been taken in order to have a good balance between reactivity
// performance and user experience. It is important to use a production build to test any changes
// on those values as on a debug build we have poorer performance
const DOWN_SAMPLING_INTERVAL_MS = 50
const ANIMATION_DURATION_MS = 200
let downSamplingDescriptor = null

// Unfortunately some mobile devices (like samsung) does not work well with device orientation
// they provide a bad absolute device orientation, while testing different devices I could not find
// a good pattern to differentiate between android devices that works well to the one that don't
// work. Therefore to avoid bad user experience for android devices we only allow device orientation
// on iphone where it works well and it can be detected from the user agent
const supportDeviceOrientation = /iphone/i.test(navigator.userAgent)

export default function useDeviceOrientation() {
    const olMap = inject('olMap')
    const store = useStore()

    const orientation = ref({
        absolute: {
            listener: 'deviceorientationabsolute',
            degree: null,
            compassHeading: null,
        },
        default: {
            listener: 'deviceorientation',
            absolute: null,
            degree: null,
            compassHeading: null,
        },
    })
    const orientationSampled = ref({
        absolute: {
            degree: null,
            compassHeading: null,
        },
        default: {
            absolute: null,
            degree: null,
            compassHeading: null,
        },
    })
    const heading = ref(null) // heading in radian
    const headingDegree = ref(null)

    const autoRotation = computed(() => store.state.position.autoRotation)
    const hasOrientation = computed(
        () => supportDeviceOrientation && store.state.position.hasOrientation
    )

    onBeforeMount(() => {
        startDeviceOrientationListener()
        startOrientationDownSampling()
    })

    onBeforeUnmount(() => {
        stopDeviceOrientationListener()
        stopOrientationDownSampling()

        // We need to reset the map rotation back to 0
        store.dispatch('setRotation', { rotation: 0, ...dispatcher })
        olMap.getView().animate({
            rotation: 0,
            duration: ANIMATION_DURATION_MS,
        })
    })

    watch(
        [
            () => orientationSampled.value.absolute.degree,
            () => orientationSampled.value.absolute.compassHeading,
            () => orientationSampled.value.default.compassHeading,
        ],
        () => {
            if (
                orientationSampled.value.absolute.compassHeading !== null ||
                orientationSampled.value.default.compassHeading !== null
            ) {
                // On Iphone webkitCompassHeading is clockwise, while the alpha is counterclockwise
                // to keep consistency we use everythink in counterclockwise therefore we use
                // 360 - heading
                headingDegree.value =
                    360 -
                    (orientationSampled.value.absolute.compassHeading ??
                        orientationSampled.value.default.compassHeading)
                heading.value = toRadians(headingDegree.value)
            } else if (orientationSampled.value.absolute.degree !== null) {
                headingDegree.value = orientationSampled.value.absolute.degree
                heading.value = toRadians(headingDegree.value)
            } else if (
                orientationSampled.value.default.absolute === true &&
                orientationSampled.value.default.degree !== null
            ) {
                headingDegree.value = orientationSampled.value.default.degree
                heading.value = toRadians(headingDegree.value)
            } else {
                headingDegree.value = null
                heading.value = null
            }
        }
    )

    watch(heading, (newValue) => {
        if (newValue !== null) {
            if (!hasOrientation.value) {
                store.dispatch('setHasOrientation', { hasOrientation: true, ...dispatcher })
            }

            if (autoRotation.value) {
                rotateMap(newValue)
            }
        }
    })

    watch(autoRotation, (newValue) => {
        if (newValue) {
            rotateMap(heading.value)
        } else {
            rotateMap(0)
        }
    })

    function rotateMap(value) {
        olMap.getView().animate({
            rotation: value,
            duration: ANIMATION_DURATION_MS,
        })
    }

    function startDeviceOrientationListener() {
        // There is 2 different event that returns the orientation;
        //  - deviceorientationabsolute
        //  - deviceorientation
        // While the first one is not supported by all browser (e.g. on iphone it is not supported)
        // the second one might not return the orientation in absolute value, but relative to the
        // device (meaning 0 is the initial device rotation when we started to listen to the event
        // and not necessarily north)
        // So here we listen to both events
        log.debug(`Activate device orientation listener`)
        // request permissions if IOS
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(() => {
                    window.addEventListener(
                        orientation.value.absolute.listener,
                        handleOrientationAbsolute
                    )
                    window.addEventListener(orientation.value.default.listener, handleOrientation)
                })
                .catch((error) => log.error(`Failed to add device orientation listener: ${error}`))
        } else {
            window.addEventListener(orientation.value.absolute.listener, handleOrientationAbsolute)
            window.addEventListener(orientation.value.default.listener, handleOrientation)
        }
    }

    function stopDeviceOrientationListener() {
        window.removeEventListener(orientation.value.absolute.listener, handleOrientationAbsolute)
        window.removeEventListener(orientation.value.default.listener, handleOrientation)
    }

    function handleOrientation(event) {
        // default listener
        orientation.value.default.absolute = event.absolute ?? null
        orientation.value.default.degree = event.alpha ?? null
        orientation.value.default.compassHeading = event.webkitCompassHeading ?? null

        if (
            orientation.value.default.degree === null &&
            orientation.value.default.compassHeading === null
        ) {
            // When the default listener doesn't return an alpha nor an webkitCompassHeading
            // this means that the device don't support at all orientation and we stop all listeners.
            log.warn(
                `Invalid alpha value from ${orientation.value.default.listener} listener: `,
                `${event.alpha}/${event.webkitCompassHeading}, stopping listener`,
                event
            )
            stopDeviceOrientationListener()
            stopOrientationDownSampling()
        } else if (
            orientation.value.default.absolute === false &&
            orientation.value.default.compassHeading === null
        ) {
            // the default listener only provide relative orientation that cannot be used therefore
            // remove the listener
            window.removeEventListener(orientation.value.default.listener, handleOrientation)
        }
    }

    function handleOrientationAbsolute(event) {
        // absolute listener
        orientation.value.absolute.degree = event.alpha ?? null
        orientation.value.absolute.compassHeading = event.webkitCompassHeading ?? null

        if (
            orientation.value.absolute.degree === null &&
            orientation.value.absolute.compassHeading === null
        ) {
            // the absolute listener don't provide any orientation, therefore remove the listener
            window.removeEventListener(
                orientation.value.absolute.listener,
                handleOrientationAbsolute
            )
        }
    }

    function startOrientationDownSampling() {
        downSamplingDescriptor = setInterval(() => {
            // default listener
            orientationSampled.value.default.absolute = orientation.value.default.absolute
            orientationSampled.value.default.degree = orientation.value.default.degree
            orientationSampled.value.default.compassHeading =
                orientation.value.default.compassHeading

            // absolute listener
            orientationSampled.value.absolute.degree = orientation.value.absolute.degree
            orientationSampled.value.absolute.compassHeading =
                orientation.value.absolute.compassHeading
        }, DOWN_SAMPLING_INTERVAL_MS)
    }

    function stopOrientationDownSampling() {
        // default listener
        orientationSampled.value.default.absolute = null
        orientationSampled.value.default.degree = null
        orientationSampled.value.default.compassHeading = null

        // absolute listener
        orientationSampled.value.absolute.degree = null
        orientationSampled.value.absolute.compassHeading = null
        clearInterval(downSamplingDescriptor)
        downSamplingDescriptor = null
    }

    return {
        heading,
        headingDegree,
        orientation,
        orientationSampled,
    }
}
