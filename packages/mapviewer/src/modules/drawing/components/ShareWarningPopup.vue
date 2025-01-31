<script setup>
import log from 'geoadmin/log'
import { computed, onUnmounted, ref, toRefs, watch } from 'vue'
import { useStore } from 'vuex'

import KMLLayer from '@/api/layers/KMLLayer.class'
import { createShortLink } from '@/api/shortlink.api'
import router from '@/router'
import { encodeLayerId } from '@/router/storeSync/layersParamParser'

const dispatcher = { dispatcher: 'SharePopup.vue' }

const store = useStore()

const props = defineProps({
    kmlLayer: {
        type: KMLLayer,
        default: null,
    },
})
const { kmlLayer } = toRefs(props)
const emits = defineEmits(['accept'])

const adminUrlCopied = ref(false)
const shareUrl = ref(' ')
const adminShareUrl = ref(' ')

const baseUrl = computed(() => {
    return `${location.origin}/#`
})
const fileUrl = computed(() => {
    return `${baseUrl.value}${router.currentRoute.value.fullPath}`
})
const adminUrl = computed(() => {
    if (fileUrl.value && kmlLayer.value?.adminId) {
        const encodedLayerID = encodeURI(encodeLayerId(kmlLayer.value))
        return fileUrl.value.replace(
            encodedLayerID,
            `${encodedLayerID}@adminId=${kmlLayer.value.adminId}`
        )
    }
    // if no adminID is available don't show the edit share link.
    return null
})

watch(adminUrl, () => {
    updateAdminShareUrl()
})
watch(fileUrl, () => {
    updateShareUrl()
})

updateShareUrl()
updateAdminShareUrl()

let adminTimeout = null
const fileTimeout = null

onUnmounted(() => {
    clearTimeout(adminTimeout)
    clearTimeout(fileTimeout)
})

function onAccept() {
    emits('accept')
}

async function copyAdminShareUrl() {
    try {
        await navigator.clipboard.writeText(adminShareUrl.value)
        adminUrlCopied.value = true
        store.dispatch('setIsDrawingEditShared', {
            value: true,
            ...dispatcher,
        })
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
            shareUrl.value = await createShortLink(fileUrl.value, shareUrl.value)
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
        <p data-cy="drawing-not-shared-admin-warning">
            {{ $t('drawing_not_shared_admin_warning') }}
        </p>
        <div
            v-if="adminUrl"
            class="form-group"
        >
            <label>{{ $t('draw_share_admin_link') }}:</label>
            <div class="input-group input-group mb-3 share-link-input">
                <input
                    type="text"
                    class="form-control"
                    :value="adminShareUrl"
                    readonly
                    @focus="$event.target.select()"
                    @click="copyAdminShareUrl()"
                >
                <button
                    class="btn btn-outline-group"
                    type="button"
                    data-cy="drawing-share-admin-link"
                    @click="copyAdminShareUrl()"
                >
                    {{ adminUrlCopied ? $t('copy_success') : $t('copy_url') }}
                </button>
            </div>
        </div>
        <button
            data-cy="drawing-share-admin-close"
            class="btn btn-dark"
            @click="onAccept()"
        >
            {{ $t('close') }}
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
