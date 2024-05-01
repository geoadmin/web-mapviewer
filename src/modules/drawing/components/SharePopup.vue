<script setup>
import { computed, onUnmounted, ref, toRefs, watch } from 'vue'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { createShortLink } from '@/api/shortlink.api'
import { encodeLayerId } from '@/router/storeSync/layersParamParser'
import log from '@/utils/logging'
import { stringifyQuery } from '@/utils/url-router'

const props = defineProps({
    kmlLayer: {
        type: KMLLayer,
        default: null,
    },
})
const { kmlLayer } = toRefs(props)

const adminUrlCopied = ref(false)
const fileUrlCopied = ref(false)
const shareUrl = ref(' ')
const adminShareUrl = ref(' ')

const kmlAdminId = computed(() => kmlLayer.value?.adminId)
const kmlLayerId = computed(() => kmlLayer.value?.id)
const baseUrl = computed(() => {
    return `${location.origin}${location.pathname}#/map`
})
const fileUrl = computed(() => {
    if (kmlLayer.value?.id) {
        const query = { layers: encodeLayerId(kmlLayer.value) }
        return `${baseUrl.value}?${stringifyQuery(query)}`
    }
    return ''
})
const adminUrl = computed(() => {
    if (kmlLayer.value?.id && kmlLayer.value?.adminId) {
        const query = {
            layers: `${encodeLayerId(kmlLayer.value)}@adminId=${kmlLayer.value.adminId}`,
        }
        return `${baseUrl.value}?${stringifyQuery(query)}`
    }
    // if no adminID is available don't show the edit share link.
    return null
})

watch(kmlAdminId, () => {
    updateAdminShareUrl()
})
watch(kmlLayerId, () => {
    updateShareUrl()
    updateAdminShareUrl()
})

updateShareUrl()
updateAdminShareUrl()

let adminTimeout = null
let fileTimeout = null

onUnmounted(() => {
    clearTimeout(adminTimeout)
    clearTimeout(fileTimeout)
})

async function copyShareUrl() {
    try {
        await navigator.clipboard.writeText(shareUrl.value)
        fileUrlCopied.value = true
        fileTimeout = setTimeout(() => {
            fileUrlCopied.value = false
        }, 5000)
    } catch (error) {
        log.error(`Failed to copy: `, error)
    }
}
async function copyAdminShareUrl() {
    try {
        await navigator.clipboard.writeText(adminShareUrl.value)
        adminUrlCopied.value = true
        adminTimeout = setTimeout(() => {
            adminUrlCopied.value = false
        }, 5000)
    } catch (error) {
        log.error(`Failed to copy: `, error)
    }
}
async function updateShareUrl() {
    if (fileUrl.value) {
        try {
            shareUrl.value = await createShortLink(fileUrl.value)
        } catch (error) {
            // Fallback to normal url
            shareUrl.value = fileUrl.value
        }
    }
}
async function updateAdminShareUrl() {
    if (adminUrl.value) {
        try {
            adminShareUrl.value = await createShortLink(adminUrl.value)
        } catch (error) {
            // Fallback to normal url
            adminShareUrl.value = adminUrl.value
        }
    }
}
</script>

<template>
    <div class="ga-share">
        <div class="form-group">
            <label>{{ $t('draw_share_user_link') }}:</label>
            <div class="input-group input-group mb-3 share-link-input">
                <input
                    type="text"
                    class="form-control"
                    :value="shareUrl"
                    readonly
                    @focus="$event.target.select()"
                    @click="copyShareUrl(false)"
                />
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    data-cy="drawing-share-normal-link"
                    @click="copyShareUrl(false)"
                >
                    {{ fileUrlCopied ? $t('copy_success') : $t('copy_url') }}
                </button>
            </div>
        </div>
        <div v-if="adminUrl" class="form-group">
            <label>{{ $t('draw_share_admin_link') }}:</label>
            <div class="input-group input-group mb-3 share-link-input">
                <input
                    type="text"
                    class="form-control"
                    :value="adminShareUrl"
                    readonly
                    @focus="$event.target.select()"
                    @click="copyAdminShareUrl()"
                />
                <button
                    class="btn btn-outline-secondary"
                    type="button"
                    data-cy="drawing-share-admin-link"
                    @click="copyAdminShareUrl()"
                >
                    {{ adminUrlCopied ? $t('copy_success') : $t('copy_url') }}
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
