import type { Map } from 'ol'
import type { Ref } from 'vue'

import log from '@swissgeo/log'
import { toRadians } from 'ol/math'
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue'

import usePositionStore from '@/store/modules/position.store'

const dispatcher = { name: 'useDeviceOrientation.composable' }

// The values here below have been taken in order to have a good balance between reactivity
// performance and user experience. It is important to use a production build to test any changes
// on those values as on a debug build we have poorer performance
const DOWN_SAMPLING_INTERVAL_MS = 50
const ANIMATION_DURATION_MS = 200
let downSamplingDescriptor: ReturnType<typeof setInterval> | undefined = undefined

// Unfortunately some mobile devices (like samsung) does not work well with device orientation
// they provide a bad absolute device orientation, while testing different devices I could not find
// a good pattern to differentiate between android devices that works well to the one that don't
// work. Therefore to avoid bad user experience for android devices we only allow device orientation
// on iphone where it works well and it can be detected from the user agent
const supportDeviceOrientation = /iphone/i.test(navigator.userAgent)

interface OrientationData {
    absolute: {
        listener: string
        degree: number | undefined
        compassHeading: number | undefined
    }
    default: {
        listener: string
        absolute: boolean | undefined
        degree: number | undefined
        compassHeading: number | undefined
    }
}

interface OrientationSampledData {
    absolute: {
        degree: number | undefined
        compassHeading: number | undefined
    }
    default: {
        absolute: boolean | undefined
        degree: number | undefined
        compassHeading: number | undefined
    }
}

export default function useDeviceOrientation(): {
    heading: Ref<number | undefined>
    headingDegree: Ref<number | undefined>
    orientation: Ref<OrientationData>
    orientationSampled: Ref<OrientationSampledData>
} {
    const olMap = inject<Map>('olMap')!
    const positionStore = usePositionStore()

    const orientation = ref<OrientationData>({
        absolute: {
            listener: 'deviceorientationabsolute',
            degree: undefined,
            compassHeading: undefined,
        },
        default: {
            listener: 'deviceorientation',
            absolute: undefined,
            degree: undefined,
            compassHeading: undefined,
        },
    })
    const orientationSampled = ref<OrientationSampledData>({
        absolute: {
            degree: undefined,
            compassHeading: undefined,
        },
        default: {
            absolute: undefined,
            degree: undefined,
            compassHeading: undefined,
        },
    })
    const heading = ref<number | undefined>()
    const headingDegree = ref<number | undefined>()

    const autoRotation = computed(() => positionStore.autoRotation)
    const hasOrientation = computed(() => supportDeviceOrientation && positionStore.hasOrientation)

    onBeforeMount(() => {
        startDeviceOrientationListener()
        startOrientationDownSampling()
    })

    onBeforeUnmount(() => {
        stopDeviceOrientationListener()
        stopOrientationDownSampling()

        // We need to reset the map rotation back to 0
        positionStore.setRotation(0, dispatcher)
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
                orientationSampled.value.absolute.compassHeading ||
                orientationSampled.value.default.compassHeading
            ) {
                // On Iphone webkitCompassHeading is clockwise, while the alpha is counterclockwise
                // to keep consistency we use everything in counterclockwise therefore we use
                // 360 - heading
                headingDegree.value =
                    360 -
                    (orientationSampled.value.absolute.compassHeading ??
                        orientationSampled.value.default.compassHeading!)
                heading.value = toRadians(headingDegree.value)
            } else if (orientationSampled.value.absolute.degree) {
                headingDegree.value = orientationSampled.value.absolute.degree
                heading.value = toRadians(headingDegree.value)
            } else if (
                orientationSampled.value.default.absolute === true &&
                orientationSampled.value.default.degree
            ) {
                headingDegree.value = orientationSampled.value.default.degree
                heading.value = toRadians(headingDegree.value)
            } else {
                headingDegree.value = undefined
                heading.value = undefined
            }
        }
    )

    watch(heading, (newValue) => {
        if (newValue) {
            if (!hasOrientation.value) {
                positionStore.setHasOrientation(true, dispatcher)
            }

            if (autoRotation.value) {
                rotateMap(newValue)
            }
        }
    })

    watch(autoRotation, (newValue) => {
        if (newValue) {
            rotateMap(heading.value ?? 0)
        } else {
            rotateMap(0)
        }
    })

    function rotateMap(value: number): void {
        olMap.getView().animate({
            rotation: value,
            duration: ANIMATION_DURATION_MS,
        })
    }

    function startDeviceOrientationListener(): void {
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
        if (
            typeof DeviceOrientationEvent !== 'undefined' &&
            'requestPermission' in DeviceOrientationEvent &&
            typeof DeviceOrientationEvent.requestPermission === 'function'
        ) {
            DeviceOrientationEvent.requestPermission()
                .then(() => {
                    window.addEventListener(
                        orientation.value.absolute.listener,
                        handleOrientationAbsolute
                    )
                    window.addEventListener(orientation.value.default.listener, handleOrientation)
                })
                .catch((error: Error) => {
                    log.error({
                        title: 'useDeviceOrientation.composable',
                        messages: [`Failed to add device orientation listener`, error]
                    })
                })
        } else {
            window.addEventListener(orientation.value.absolute.listener, handleOrientationAbsolute)
            window.addEventListener(orientation.value.default.listener, handleOrientation)
        }
    }

    function stopDeviceOrientationListener(): void {
        window.removeEventListener(orientation.value.absolute.listener, handleOrientationAbsolute)
        window.removeEventListener(orientation.value.default.listener, handleOrientation)
    }

    function handleOrientation(event: Event): void {
        const orientationEvent = event as DeviceOrientationEvent
        // default listener
        orientation.value.default.absolute = orientationEvent.absolute ?? undefined
        orientation.value.default.degree = orientationEvent.alpha ?? undefined
        orientation.value.default.compassHeading =
            'webkitCompassHeading' in orientationEvent
                ? (orientationEvent.webkitCompassHeading as number | undefined)
                : undefined

        if (
            !orientation.value.default.degree &&
            !orientation.value.default.compassHeading
        ) {
            // When the default listener doesn't return an alpha nor an webkitCompassHeading
            // this means that the device don't support at all orientation and we stop all listeners.
            let compassHeading: number | undefined
            if ('webkitCompassHeading' in orientationEvent) {
                compassHeading = (orientationEvent as DeviceOrientationEvent & {
                    webkitCompassHeading?: number
                }).webkitCompassHeading
            } else {
                compassHeading = undefined
            }
            log.warn(
                `Invalid alpha value from ${orientation.value.default.listener} listener: ${orientationEvent.alpha}/${compassHeading}, stopping listener`,
                orientationEvent
            )
            stopDeviceOrientationListener()
            stopOrientationDownSampling()
        } else if (
            orientation.value.default.absolute === false &&
            !orientation.value.default.compassHeading
        ) {
            // the default listener only provide relative orientation that cannot be used therefore
            // remove the listener
            window.removeEventListener(orientation.value.default.listener, handleOrientation)
        }
    }

    function handleOrientationAbsolute(event: Event): void {
        const orientationEvent = event as DeviceOrientationEvent
        // absolute listener
        orientation.value.absolute.degree = orientationEvent.alpha ?? undefined
        orientation.value.absolute.compassHeading =
            'webkitCompassHeading' in orientationEvent
                ? (orientationEvent.webkitCompassHeading as number | undefined)
                : undefined

        if (
            !orientation.value.absolute.degree &&
            !orientation.value.absolute.compassHeading
        ) {
            // the absolute listener don't provide any orientation, therefore remove the listener
            window.removeEventListener(
                orientation.value.absolute.listener,
                handleOrientationAbsolute
            )
        }
    }

    function startOrientationDownSampling(): void {
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

    function stopOrientationDownSampling(): void {
        // default listener
        orientationSampled.value.default.absolute = undefined
        orientationSampled.value.default.degree = undefined
        orientationSampled.value.default.compassHeading = undefined

        // absolute listener
        orientationSampled.value.absolute.degree = undefined
        orientationSampled.value.absolute.compassHeading = undefined
        if (downSamplingDescriptor) {
            clearInterval(downSamplingDescriptor)
            downSamplingDescriptor = undefined
        }
    }

    return {
        heading,
        headingDegree,
        orientation,
        orientationSampled,
    }
}
