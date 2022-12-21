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

<script>
import { getKmlUrl } from '@/api/files.api'
import { createShortLink } from '@/api/shortlink.api'
import log from '@/utils/logging'

export default {
    props: {
        kmlMetadata: {
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
            if (this.kmlMetadata && this.kmlMetadata.id) {
                return `${location.origin}/#/map?layers=KML|${getKmlUrl(
                    this.kmlMetadata.id
                )}|${this.$t('draw_layer_label')}`
            }
            return ''
        },
        adminUrl() {
            if (this.kmlMetadata && this.kmlMetadata.id && this.kmlMetadata.adminId) {
                return `${location.origin}/#/map?layers=KML|${getKmlUrl(
                    this.kmlMetadata.id
                )}|${this.$t('draw_layer_label')}@adminId=${this.kmlMetadata.adminId}`
            }
            // if no adminID is available don't show the edit share link.
            return null
        },
    },
    watch: {
        kmlMetadata() {
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
                log.error(`Failed to copy: `, error)
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
                log.error(`Failed to copy: `, error)
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
@import 'src/scss/media-query.mixin';
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
