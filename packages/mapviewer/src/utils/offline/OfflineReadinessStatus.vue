<script setup lang="ts">
// conditional declaration of the component, as service-worker is not setup when we test with Cypress
// #v-ifdef MODE!='test'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import log, { LogPreDefinedColor } from '@geoadmin/log'
import GeoadminTooltip from '@geoadmin/tooltip'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { APP_VERSION } from '@/config/staging.config'
import SimpleWindow from '@/utils/components/SimpleWindow.vue'

// check for updates every hour
const period = 60 * 60 * 1000

const { withText = false } = defineProps<{
    withText?: boolean
}>()

const isServiceWorkerActive = ref(false)
const swValidationFailed = ref(false)
const swInsecureContext = ref(false)

const { t } = useI18n()

/**
 * Check if service worker versioning/configuration is valid by fetching the validation file
 */
async function checkSwValidation() {
    if (import.meta.env.DEV || swInsecureContext.value) {
        return
    }

    try {
        const response = await fetch(`${APP_VERSION}/sw-ready.json`, {
            cache: 'no-store',
            headers: {
                'cache-control': 'no-cache',
            },
        })

        if (!response.ok) {
            log.warn({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['SW validation file not found - SW versioning may have failed'],
            })
            swValidationFailed.value = true
            return
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.includes('application/json')) {
            log.warn({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: [
                    'SW validation response is not JSON - SW versioning may not be active in this mode',
                    contentType,
                ],
            })
            return
        }

        const validationData = await response.json()

        if (!validationData.swVersioned) {
            log.error({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: [
                    'SW validation FAILED - service worker was not properly versioned',
                    validationData,
                ],
            })
            swValidationFailed.value = true
        } else {
            log.debug({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['SW validation passed', validationData],
            })
        }
    } catch (error) {
        log.error({
            title: 'OfflineReadinessStatus',
            titleColor: LogPreDefinedColor.Sky,
            messages: ['Failed to check SW validation', error],
        })
        swValidationFailed.value = true
    }
}

/**
 * This function will register a periodic sync check every hour and check if there are newer
 * versions of cached files online
 */
function registerPeriodicSync(serviceWorkerUrl: string, registration: ServiceWorkerRegistration) {
    setInterval(() => {
        void (async () => {
            if ('onLine' in navigator && !navigator.onLine) {
                return
            }

            const resp = await fetch(serviceWorkerUrl, {
                cache: 'no-store',
                headers: {
                    'cache-control': 'no-cache',
                },
            })

            if (resp?.status === 200) {
                await registration.update()
            }
        })()
    }, period)
}

type BooleanRefLike = { value: boolean }

let offlineReadySource: BooleanRefLike = { value: false }
let needRefreshSource: BooleanRefLike = { value: false }
const offlineReady = computed(() => offlineReadySource.value)
const needRefresh = computed(() => needRefreshSource.value)
let updateServiceWorker: (_reloadPage?: boolean) => Promise<void> = () => Promise.resolve()

if (window.isSecureContext) {
    const registerSw = useRegisterSW({
        immediate: true,
        onRegisterError(error) {
            log.error({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['ServiceWorker registration failed', error],
            })
            // mark service worker validation as failed
            swValidationFailed.value = true
        },
        onRegisteredSW(serviceWorkerUrl, registration) {
            log.debug({
                title: 'OfflineReadinessStatus',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['ServiceWorker registration pending', registration],
            })
            if (registration?.active?.state === 'activated') {
                log.debug({
                    title: 'OfflineReadinessStatus',
                    titleColor: LogPreDefinedColor.Sky,
                    messages: ['ServiceWorker activated', registration],
                })
                isServiceWorkerActive.value = true
                registerPeriodicSync(serviceWorkerUrl, registration)
            } else if (registration?.installing) {
                registration.installing.addEventListener('statechange', (e) => {
                    const sw = e.target as ServiceWorker
                    log.debug({
                        title: 'OfflineReadinessStatus',
                        titleColor: LogPreDefinedColor.Sky,
                        messages: ['ServiceWorker state change', sw.state],
                    })
                    isServiceWorkerActive.value = sw.state === 'activated'
                    if (isServiceWorkerActive.value) {
                        registerPeriodicSync(serviceWorkerUrl, registration)
                    }
                })
            }
        },
    })

    updateServiceWorker = registerSw.updateServiceWorker
    offlineReadySource = registerSw.offlineReady
    needRefreshSource = registerSw.needRefresh
} else {
    swInsecureContext.value = true
    log.warn({
        title: 'OfflineReadinessStatus',
        titleColor: LogPreDefinedColor.Sky,
        messages: [
            'ServiceWorker registration skipped: insecure context (HTTPS with trusted certificate required).',
        ],
    })
}

onMounted(() => {
    // Check SW validation status on component mount
    checkSwValidation().catch((error) => {
        log.error({
            title: 'OfflineReadinessStatus',
            titleColor: LogPreDefinedColor.Sky,
            messages: ['Error during SW validation check', error],
        })
    })
})

const statusIcon = computed<string>(() => {
    if (swInsecureContext.value) {
        return 'triangle-exclamation'
    }
    if (swValidationFailed.value) {
        return 'circle-xmark'
    }
    if (isServiceWorkerActive.value) {
        return 'check'
    }
    if (needRefresh.value) {
        return 'triangle-exclamation'
    }
    return 'circle-notch'
})
const shouldStatusIconSpin = computed<boolean>(
    () =>
        !swInsecureContext.value &&
        !swValidationFailed.value &&
        !isServiceWorkerActive.value &&
        !needRefresh.value
)
const tooltipContent = computed<string>(() => {
    const title = t('offline_modal_title')
    let extraInfoKey = 'wait_data_loading'
    if (swInsecureContext.value) {
        return `${title}: ${t('offline_sw_secure_context_required')}`
    }
    if (swValidationFailed.value) {
        return `${title}: ${t('offline_sw_configuration_error')}`
    }
    if (needRefresh.value) {
        extraInfoKey = 'offline_cache_obsolete'
    }
    if (isServiceWorkerActive.value || offlineReady.value) {
        extraInfoKey = 'offline_dl_succeed'
    }
    return `${title}: ${t(extraInfoKey)}`
})

function refreshCache() {
    updateServiceWorker(true)
        .then(() => {
            log.info({
                title: 'OfflineReadinessStatus component',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['ServiceWorker cache refreshed'],
            })
            window.location.reload()
        })
        .catch((error) => {
            log.error({
                title: 'OfflineReadinessStatus component',
                titleColor: LogPreDefinedColor.Sky,
                messages: ['Failed to refresh the ServiceWorker cache', error],
            })
        })
}

// #v-endif
</script>

<template>
    <GeoadminTooltip>
        <template #content>
            <div class="p-2">
                <small class="bg-secondary text-light fw-bold rounded p-1">Beta</small>
                <div class="mt-1">{{ tooltipContent }}</div>
            </div>
        </template>
        <div class="tw:flex tw:gap-1 tw:justify-around tw:items-center tw:p-1">
            <small
                v-if="withText"
                class="bg-secondary text-light fw-bold rounded p-1"
                >Beta</small
            >
            <FontAwesomeLayers>
                <FontAwesomeIcon
                    icon="slash"
                    mask="plug"
                />
                <FontAwesomeIcon
                    icon="slash"
                    class="tw:text-red-600"
                    transform="up-1"
                />
            </FontAwesomeLayers>
            <span
                v-if="withText"
                class="fw-bold me-1"
                >{{ t('offline_modal_title') }}</span
            >
            <FontAwesomeIcon
                :icon="statusIcon"
                :spin="shouldStatusIconSpin"
                :class="{
                    'tw:text-lime-500': offlineReady && !swValidationFailed,
                    'tw:text-amber-500': needRefresh || swInsecureContext,
                    'tw:text-red-600': swValidationFailed,
                }"
                size="sm"
            />
            <span v-if="withText && swInsecureContext">
                {{ t('offline_sw_secure_context_required') }}
            </span>
            <span v-if="withText && swValidationFailed">
                {{ t('offline_sw_configuration_error') }}
            </span>
            <span v-if="withText && !swValidationFailed && !offlineReady && !needRefresh">
                {{ t('wait_data_loading') }}
            </span>
            <span v-if="withText && !swValidationFailed && offlineReady && !needRefresh">
                {{ t('offline_dl_succeed') }}
            </span>
            <span v-if="withText && !swValidationFailed && needRefresh">
                {{ t('offline_cache_obsolete') }}
            </span>
        </div>
    </GeoadminTooltip>
    <SimpleWindow
        v-if="needRefresh"
        initial-position="bottom-center"
        :title="t('offline_modal_title')"
    >
        <div>
            <p>
                {{ t('offline_cache_obsolete') }}
            </p>
            <button
                class="btn btn-sm btn-light float-end"
                @click="refreshCache"
            >
                {{ t('offline_refresh') }}
            </button>
        </div>
    </SimpleWindow>
</template>
