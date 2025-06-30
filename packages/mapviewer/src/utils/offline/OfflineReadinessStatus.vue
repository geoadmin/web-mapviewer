<script setup lang="ts">
// conditional declaration of the component, as service-worker is not setup when we test with Cypress
// #v-ifdef MODE!='test'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import log, { LogPreDefinedColor } from '@geoadmin/log'
import GeoadminTooltip from '@geoadmin/tooltip'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import SimpleWindow from '@/utils/components/SimpleWindow.vue'

// check for updates every hour
const period = 60 * 60 * 1000

const { withText = false } = defineProps<{
    withText?: boolean
}>()

const isServiceWorkerActive = ref(false)

const { t } = useI18n()

/**
 * This function will register a periodic sync check every hour and check if there are newer
 * versions of cached files online
 */
function registerPeriodicSync(serviceWorkerUrl: string, registration: ServiceWorkerRegistration) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    setInterval(async () => {
        if ('onLine' in navigator && !navigator.onLine) {
            return
        }

        const resp = await fetch(serviceWorkerUrl, {
            cache: 'no-store',
            headers: {
                cache: 'no-store',
                'cache-control': 'no-cache',
            },
        })

        if (resp?.status === 200) {
            await registration.update()
        }
    }, period)
}

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(serviceWorkerUrl, registration) {
        if (registration?.active?.state === 'activated') {
            isServiceWorkerActive.value = true
            registerPeriodicSync(serviceWorkerUrl, registration)
        } else if (registration?.installing) {
            registration.installing.addEventListener('statechange', (e) => {
                const sw = e.target as ServiceWorker
                isServiceWorkerActive.value = sw.state === 'activated'
                if (isServiceWorkerActive.value) {
                    registerPeriodicSync(serviceWorkerUrl, registration)
                }
            })
        }
    },
})

const statusIcon = computed<string>(() => {
    if (offlineReady.value) {
        return 'check'
    }
    if (needRefresh.value) {
        return 'triangle-exclamation'
    }
    return 'circle-notch'
})
const shouldStatusIconSpin = computed<boolean>(() => !offlineReady.value && !needRefresh.value)
const tooltipContent = computed<string>(() => {
    const title = t('offline_modal_title')
    let extraInfoKey = 'wait_data_loading'
    if (needRefresh.value) {
        extraInfoKey = 'offline_cache_obsolete'
    }
    if (offlineReady.value) {
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
    <GeoadminTooltip :tooltip-content="tooltipContent">
        <div class="tw:flex tw:gap-1 tw:justify-around tw:items-center tw:p-1">
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
                :class="{ 'tw:text-lime-500': offlineReady, 'tw:text-amber-500': needRefresh }"
                size="sm"
            />
            <span v-if="withText && !offlineReady && !needRefresh">
                {{ t('wait_data_loading') }}
            </span>
            <span v-if="withText && offlineReady && !needRefresh">
                {{ t('offline_dl_succeed') }}
            </span>
            <span v-if="withText && needRefresh">
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
