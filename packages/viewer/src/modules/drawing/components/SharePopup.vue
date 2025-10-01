<script setup lang="ts">
import log from '@swissgeo/log'
import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { KMLLayer } from '@swissgeo/layers'
import { createShortLink } from '@/api/shortlink.api'
import router from '@/router'
import { encodeLayerId } from '@/router/storeSync/layersParamParser'
import useDrawingStore from '@/store/modules/drawing.store'
import type { ActionDispatcher } from '@/store/types'

const dispatcher: ActionDispatcher = { name: 'SharePopup.vue' }

const drawingStore = useDrawingStore()
const { t } = useI18n()

const { kmlLayer } = defineProps({
    kmlLayer: Object as () => KMLLayer | undefined,
})

const adminUrlCopied = ref(false)
const fileUrlCopied = ref(false)
const shareUrl: Ref<string | undefined> = ref(' ')
const adminShareUrl: Ref<string | undefined> = ref(' ')

const baseUrl = computed(() => {
    return `${location.origin}/#`
})
const fileUrl = computed(() => {
    return `${baseUrl.value}${router.currentRoute.value.fullPath}`
})
const adminUrl = computed(() => {
    if (fileUrl.value && kmlLayer?.adminId) {
        const encodedLayerID = encodeURI(encodeLayerId(kmlLayer))
        return fileUrl.value.replace(
            encodedLayerID,
            `${encodedLayerID}@adminId=${kmlLayer.adminId}`
        )
    }
    // if no adminID is available don't show the edit share link.
    return
})

watch(adminUrl, () => {
    updateAdminShareUrl()
})
watch(fileUrl, () => {
    updateShareUrl()
})

updateShareUrl()
updateAdminShareUrl()

let adminTimeout: NodeJS.Timeout | undefined = undefined
let fileTimeout: NodeJS.Timeout | undefined = undefined

onUnmounted(() => {
    clearTimeout(adminTimeout)
    clearTimeout(fileTimeout)
})

async function copyShareUrl() {
    try {
        await navigator.clipboard.writeText(shareUrl.value ?? '')
        fileUrlCopied.value = true
        fileTimeout = setTimeout(() => {
            fileUrlCopied.value = false
        }, 5000)
    } catch (error: unknown) {
        log.error(`Failed to copy: `, error as string)
    }
}
async function copyAdminShareUrl() {
    try {
        await navigator.clipboard.writeText(adminShareUrl.value ?? '')
        adminUrlCopied.value = true
        drawingStore.setIsDrawingEditShared(true, dispatcher)
        adminTimeout = setTimeout(() => {
            adminUrlCopied.value = false
        }, 5000)
    } catch (error: unknown) {
        log.error(`Failed to copy: `, error as string)
    }
}
async function updateShareUrl() {
    if (fileUrl.value) {
        try {
            shareUrl.value = await createShortLink(fileUrl.value)
        } catch (_) {
            // Fallback to normal url
            shareUrl.value = fileUrl.value
        }
    }
}
async function updateAdminShareUrl() {
    if (adminUrl.value) {
        try {
            adminShareUrl.value = await createShortLink(adminUrl.value)
        } catch (_) {
            // Fallback to normal url
            adminShareUrl.value = adminUrl.value
        }
    }
}
</script>

<template>
    <div class="ga-share">
        <div class="form-group">
            <label>{{ t('draw_share_user_link') }}:</label>
            <div class="input-group input-group share-link-input mb-3">
                <input
                    type="text"
                    class="form-control"
                    :value="shareUrl"
                    readonly
                    @click="copyShareUrl()"
                    @focus="(event) => (event.target as HTMLInputElement).select()"
                />
                <button
                    class="btn btn-outline-group"
                    type="button"
                    data-cy="drawing-share-normal-link"
                    @click="copyShareUrl()"
                >
                    {{ fileUrlCopied ? t('copy_success') : t('copy_url') }}
                </button>
            </div>
        </div>
        <div
            v-if="adminUrl"
            class="form-group"
        >
            <label>{{ t('draw_share_admin_link') }}:</label>
            <div class="input-group input-group share-link-input mb-3">
                <input
                    type="text"
                    class="form-control"
                    :value="adminShareUrl"
                    readonly
                    @focus="(event) => (event.target as HTMLInputElement).select()"
                    @click="copyAdminShareUrl()"
                />
                <button
                    class="btn btn-outline-group"
                    type="button"
                    data-cy="drawing-share-admin-link"
                    @click="copyAdminShareUrl()"
                >
                    {{ adminUrlCopied ? t('copy_success') : t('copy_url') }}
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';
.ga-share {
    width: 100%;
    text-align: start;

    @include respond-above(phone) {
        // Do not apply this minimal width on phone otherwise we will have
        // a scroll bar on phone. On Desktop it looks a bit better to increase
        // the size of the input.
        .share-link-input {
            min-width: 30rem;
        }
    }
}
</style>
