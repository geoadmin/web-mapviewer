<template>
    <div class="ga-share">
        <div class="form-group">
            <label>{{ $t('draw_share_user_link') }}:</label>
            <div class="input-group input-group-sm mb-3">
                <input
                    type="text"
                    class="form-control"
                    :value="fileUrl"
                    readonly
                    @focus="$event.target.select()"
                    @click="copyUrl(false)"
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        data-cy="drawing-share-normal-link"
                        @click="copyUrl(false)"
                    >
                        {{ fileUrlCopied ? $t('copy_success') : $t('copy_url') }}
                    </button>
                </div>
            </div>
        </div>
        <div v-if="adminUrl" class="form-group">
            <label>{{ $t('draw_share_admin_link') }}:</label>
            <div class="input-group input-group-sm mb-3">
                <input
                    type="text"
                    class="form-control"
                    :value="adminUrl"
                    readonly
                    @focus="$event.target.select()"
                    @click="copyUrl(true)"
                />
                <div class="input-group-append">
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        data-cy="drawing-share-admin-link"
                        @click="copyUrl(true)"
                    >
                        {{ adminUrlCopied ? $t('copy_success') : $t('copy_url') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { getKmlUrl } from '@/api/files.api'

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
            // if no adminID is availble don't show the edit share link.
            return null
        },
    },
    unmounted() {
        clearTimeout(this.adminTimeout)
        clearTimeout(this.fileTimeout)
    },
    methods: {
        async copyUrl(adminUrl = false) {
            if (adminUrl) {
                await navigator.clipboard.writeText(this.adminUrl)
                this.adminUrlCopied = true
                this.adminTimeout = setTimeout(() => {
                    this.adminUrlCopied = false
                }, 5000)
            } else {
                await navigator.clipboard.writeText(this.fileUrl)
                this.fileUrlCopied = true
                this.fileTimeout = setTimeout(() => {
                    this.fileUrlCopied = false
                }, 5000)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.ga-share {
    width: 100%;
    text-align: start;
}
</style>
