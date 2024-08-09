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

export default function useDeviceOrientation() {
    const olMap = inject('olMap')
    const store = useStore()

    const orientation = ref({
        absolute: null,
        degree: null,
        compassHeading: null,
    })
    const orientationSampled = ref({
        absolute: null,
        degree: null,
        compassHeading: null,
    })
    const heading = ref(null) // heading in radian
    const headingDegree = ref(null)
    const listener = ref(null)

    const autoRotation = computed(() => store.state.position.autoRotation)
    const hasOrientation = computed(() => store.state.position.hasOrientation)

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
            () => orientationSampled.value.absolute,
            () => orientationSampled.value.degree,
            () => orientationSampled.value.compassHeading,
        ],
        () => {
            if (orientationSampled.value.compassHeading !== null) {
                // On Iphone webkitCompassHeading is clockwise, while the alpha is counterclockwise
                // to keep consistency we use everythink in counterclockwise therefore we use
                // 360 - heading
                headingDegree.value = 360 - orientationSampled.value.compassHeading
                heading.value = toRadians(headingDegree.value)
            } else if (
                orientationSampled.value.absolute === true &&
                orientationSampled.value.degree !== null
            ) {
                headingDegree.value = orientationSampled.value.degree
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
        log.debug(`Activate device orientation listener`)
        // request permissions if IOS
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(() => {
                    listener.value = 'deviceorientation'
                    window.addEventListener(listener.value, handleOrientation)
                })
                .catch((error) => log.error(`Failed to add device orientation listener: ${error}`))
        } else {
            listener.value = 'deviceorientationabsolute'
            window.addEventListener(listener.value, handleOrientation)
        }
    }

    function stopDeviceOrientationListener() {
        log.debug(`Deactivate device orientation listener`)
        if (listener.value) {
            window.removeEventListener(listener.value, handleOrientation)
        }
    }

    function handleOrientation(event) {
        orientation.value.absolute = event.absolute ?? null
        orientation.value.degree = event.alpha ?? null
        orientation.value.compassHeading = event.webkitCompassHeading ?? null

        if (orientation.value.degree === null && orientation.value.compassHeading) {
            log.warn(
                `Invalid alpha value for device orientation: ${event.alpha}/${event.webkitCompassHeading}, stopping orientation listener`,
                event
            )
            stopDeviceOrientationListener()
            stopOrientationDownSampling()
        }
    }

    function startOrientationDownSampling() {
        downSamplingDescriptor = setInterval(() => {
            orientationSampled.value.absolute = orientation.value.absolute
            orientationSampled.value.degree = orientation.value.degree
            orientationSampled.value.compassHeading = orientation.value.compassHeading
        }, DOWN_SAMPLING_INTERVAL_MS)
    }

    function stopOrientationDownSampling() {
        orientationSampled.value.absolute = null
        orientationSampled.value.degree = null
        orientationSampled.value.compassHeading = null
        clearInterval(downSamplingDescriptor)
        downSamplingDescriptor = null
    }

    return {
        heading,
        headingDegree,
        orientation,
        orientationSampled,
        listener,
    }
}
