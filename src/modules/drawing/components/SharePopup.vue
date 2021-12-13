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
import i18n from '@/modules/i18n'

export default {
    props: {
        kmlIds: {
            type: Object,
            default: null,
        },
    },
    data: function () {
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
                )}|${i18n.t('draw_layer_label')}`
            }
            return ''
        },
        adminUrl() {
            if (this.kmlIds && this.kmlIds.fileId && this.kmlIds.adminId) {
                return `${location.origin}/#/map?layers=KML|${getKmlUrl(
                    this.kmlIds.fileId
                )}|${i18n.t('draw_layer_label')}@adminId=${this.kmlIds.adminId}`
            }
            // if no adminID is availble don't show the edit share link.
            return null
        },
    },
    methods: {
        copyUrl: async function (adminUrl = false) {
            if (adminUrl) {
                await navigator.clipboard.writeText(this.adminUrl)
                this.adminUrlCopied = true
                setTimeout(() => {
                    this.adminUrlCopied = false
                }, 5000)
            } else {
                await navigator.clipboard.writeText(this.fileUrl)
                this.fileUrlCopied = true
                setTimeout(() => {
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
