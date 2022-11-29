<template>
    <div class="ga-share">
        <div class="form-group">
            <label>{{ $t('draw_share_user_link') }}:</label>
            <div class="input-group input-group mb-3">
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
            <div class="input-group input-group mb-3">
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

<script>
import { getKmlUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import log from '@/utils/logging'

export default {
    props: {
        kmlIds: {
            type: Object,
            default: null,
        },
    },
    data() {
        return {
            adminUrlCopied: false,
            fileUrlCopied: false,
            shareUrl: ' ',
            adminShareUrl: ' ',
        }
    },
    computed: {
        fileUrl() {
            if (this.kmlIds && this.kmlIds.fileId) {
                return `${location.origin}/#/map?layers=KML|${getKmlUrl(
                    this.kmlIds.fileId
                )}|${this.$t('draw_layer_label')}`
            }
            return ''
        },
        adminUrl() {
            if (this.kmlIds && this.kmlIds.fileId && this.kmlIds.adminId) {
                return `${location.origin}/#/map?layers=KML|${getKmlUrl(
                    this.kmlIds.fileId
                )}|${this.$t('draw_layer_label')}@adminId=${this.kmlIds.adminId}`
            }
            // if no adminID is available don't show the edit share link.
            return null
        },
    },
    watch: {
        kmlIds() {
            this.updateShareUrl()
            this.updateAdminShareUrl()
        },
    },
    created() {
        this.updateShareUrl()
        this.updateAdminShareUrl()
    },
    unmounted() {
        clearTimeout(this.adminTimeout)
        clearTimeout(this.fileTimeout)
    },
    methods: {
        async copyShareUrl() {
            try {
                await navigator.clipboard.writeText(this.shareUrl)
                this.fileUrlCopied = true
                this.fileTimeout = setTimeout(() => {
                    this.fileUrlCopied = false
                }, 5000)
            } catch (error) {
                log.error(`Failed to copy: ${error}`)
            }
        },
        async copyAdminShareUrl() {
            try {
                await navigator.clipboard.writeText(this.adminShareUrl)
                this.adminUrlCopied = true
                this.adminTimeout = setTimeout(() => {
                    this.adminUrlCopied = false
                }, 5000)
            } catch (error) {
                log.error(`Failed to copy: ${error}`)
            }
        },
        async updateShareUrl() {
            try {
                this.shareUrl = await createShortLink(this.fileUrl)
            } catch (error) {
                // Fallback to normal url
                this.shareUrl = this.fileUrl
            }
        },
        async updateAdminShareUrl() {
            if (this.adminUrl) {
                try {
                    this.adminShareUrl = await createShortLink(this.adminUrl)
                } catch (error) {
                    // Fallback to normal url
                    this.adminShareUrl = this.adminUrl
                }
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.ga-share {
    width: 100%;
    text-align: start;

    .input-group {
        width: 30rem;
    }
}
</style>
