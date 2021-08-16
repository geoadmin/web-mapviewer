<template>
    <div class="ga-share">
        <div class="form-group">
            <label>{{ $t('draw_share_user_link') }}:</label>
            <div class="input-group input-group-sm mb-3">
                <input type="text" class="form-control" :value="fileUrl" disabled />
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" @click="copyUrl">
                        {{ fileUrlCopied ? $t('copy_success') : $t('copy_url') }}
                    </button>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label>{{ $t('draw_share_admin_link') }}:</label>
            <div class="input-group input-group-sm mb-3">
                <input type="text" class="form-control" :value="adminUrl" disabled />
                <div class="input-group-append">
                    <button
                        class="btn btn-outline-secondary"
                        type="button"
                        @click="(e) => copyUrl(e, true)"
                    >
                        {{ adminUrlCopied ? $t('copy_success') : $t('copy_url') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { API_PUBLIC_URL } from '@/config'

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
            if (!this.kmlIds) return ''
            return `${location.origin}/#/map?layers=KML|${API_PUBLIC_URL}${this.kmlIds.fileId}|Drawing`
        },
        adminUrl() {
            if (!this.kmlIds) return ''
            return `${location.origin}/#/map?drawingAdminFileId=${this.kmlIds.adminId}`
        },
    },
    methods: {
        copyUrl: async function (event, adminUrl = false) {
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

<style lang="scss">
.ga-share {
    width: 100%;
    text-align: start;
}
</style>
