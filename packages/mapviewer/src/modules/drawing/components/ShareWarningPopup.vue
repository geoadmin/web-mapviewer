<script setup lang="ts">
import type { KMLLayer } from '@swissgeo/layers'
import type { Ref } from 'vue'

import { shortLinkAPI } from '@swissgeo/api'
import log from '@swissgeo/log'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { ActionDispatcher } from '@/store/types'

import { ENVIRONMENT } from '@/config'
import router from '@/router'
import useDrawingStore from '@/store/modules/drawing'
import { encodeLayerId } from '@/store/plugins/storeSync/layersParamParser'

const dispatcher: ActionDispatcher = { name: 'ShareWarningPopup.vue' }

const drawingStore = useDrawingStore()
const { t } = useI18n()

const { kmlLayer } = defineProps<{ kmlLayer: KMLLayer | undefined }>()
type EmitType = {
    (_e: 'accept'): void
}
const emits = defineEmits<EmitType>()
const adminUrlCopied = ref(false)
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
    return undefined
})

watch(adminUrl, () => {
    updateAdminShareUrl().catch((error: Error) =>
        log.error(`Error while creating short link for admin share url: ${error}`)
    )
})
watch(fileUrl, () => {
    updateShareUrl().catch((error: Error) =>
        log.error(`Error while creating short link for share url: ${error}`)
    )
})

updateShareUrl().catch((error: Error) =>
    log.error(`Error while creating short link for share url: ${error}`)
)
updateAdminShareUrl().catch((error: Error) =>
    log.error(`Error while creating short link for admin share url: ${error}`)
)

let adminTimeout: ReturnType<typeof setTimeout> | undefined

onUnmounted(() => {
    clearTimeout(adminTimeout)
})

function onAccept() {
    emits('accept')
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
            shareUrl.value = await shortLinkAPI.createShortLink({
                url: fileUrl.value,
                withCrosshair: !!shareUrl.value,
                staging: ENVIRONMENT,
            })
        } catch (_) {
            // Fallback to normal url
            shareUrl.value = fileUrl.value
        }
    }
}
async function updateAdminShareUrl() {
    if (adminUrl.value) {
        try {
            adminShareUrl.value = await shortLinkAPI.createShortLink({
                url: adminUrl.value,
                staging: ENVIRONMENT,
            })
        } catch (_) {
            // Fallback to normal url
            adminShareUrl.value = adminUrl.value
        }
    }
}
</script>

<template>
    <div class="ga-share">
        <p data-cy="drawing-not-shared-admin-warning">
            {{ t('drawing_not_shared_admin_warning') }}
        </p>
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
        <button
            data-cy="drawing-share-admin-close"
            class="btn btn-dark"
            @click="onAccept()"
        >
            {{ t('close') }}
        </button>
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
