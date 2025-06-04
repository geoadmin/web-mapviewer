<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, ref } from 'vue'

// check for updates every hour
const period = 60 * 60 * 1000

const swActivated = ref(false)

/**
 * This function will register a periodic sync check every hour, you can modify the interval as
 * needed.
 */
function registerPeriodicSync(swUrl: string, r: ServiceWorkerRegistration) {
    if (period <= 0) return

    setInterval(async () => {
        if ('onLine' in navigator && !navigator.onLine) return

        const resp = await fetch(swUrl, {
            cache: 'no-store',
            headers: {
                cache: 'no-store',
                'cache-control': 'no-cache',
            },
        })

        if (resp?.status === 200) await r.update()
    }, period)
}

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(swUrl, r) {
        if (period <= 0) return
        if (r?.active?.state === 'activated') {
            swActivated.value = true
            registerPeriodicSync(swUrl, r)
        } else if (r?.installing) {
            r.installing.addEventListener('statechange', (e) => {
                const sw = e.target as ServiceWorker
                swActivated.value = sw.state === 'activated'
                if (swActivated.value) registerPeriodicSync(swUrl, r)
            })
        }
    },
})

const title = computed(() => {
    if (offlineReady.value) return 'App ready to work offline'
    if (needRefresh.value) return 'New content available, click on reload button to update.'
    return ''
})

function close() {
    offlineReady.value = false
    needRefresh.value = false
}
</script>

<template>
    <div
        v-if="offlineReady || needRefresh"
        class="pwa-toast"
        aria-labelledby="toast-message"
        role="alert"
    >
        <div class="message">
            <span id="toast-message">
                {{ title }}
            </span>
        </div>
        <div class="buttons">
            <button
                v-if="needRefresh"
                type="button"
                class="reload"
                @click="updateServiceWorker()"
            >
                Reload
            </button>
            <button
                type="button"
                @click="close"
            >
                Close
            </button>
        </div>
    </div>
</template>

<style scoped>
.pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    padding: 12px;
    border: 1px solid #8885;
    border-radius: 4px;
    z-index: 1;
    text-align: left;
    box-shadow: 3px 4px 5px 0 #8885;
    display: grid;
    background-color: white;
}
.pwa-toast .message {
    margin-bottom: 8px;
}
.pwa-toast .buttons {
    display: flex;
}
.pwa-toast button {
    border: 1px solid #8885;
    outline: none;
    margin-right: 5px;
    border-radius: 2px;
    padding: 3px 10px;
}
.pwa-toast button.reload {
    display: block;
}
</style>
