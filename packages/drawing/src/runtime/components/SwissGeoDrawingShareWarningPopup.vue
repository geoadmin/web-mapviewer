<script setup lang="ts">
import type { ActionDispatcher } from '~/types/drawingStore'
import type { Ref } from 'vue'

import log from '@swissgeo/log'
import { useRoute } from '#app'
import { logConfig, useDrawingStore } from '#imports'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = { name: 'SwissGeoShareWarningPopup.vue' }

const drawingStore = useDrawingStore()
const { t } = useI18n()
const route = useRoute()

const emits = defineEmits<{
    accept: [void]
}>()

const adminUrlCopied = ref(false)
const adminShareUrl: Ref<string | undefined> = ref(' ')

const adminLinkInput = useTemplateRef('adminLinkInput')

onMounted(() => {
    if (!drawingStore.share.publicLink || !drawingStore.share.adminLink) {
        drawingStore.generateShareLinks(route, dispatcher).catch((error) =>
            log.error({
                ...logConfig(),
                messages: [`Failed to generate share links: `, error],
            })
        )
    }
})

let adminTimeout: ReturnType<typeof setTimeout> | undefined
let fileTimeout: ReturnType<typeof setTimeout> | undefined

onUnmounted(() => {
    clearTimeout(adminTimeout)
    clearTimeout(fileTimeout)
})

function onAccept() {
    emits('accept')
}

async function copyAdminShareUrl() {
    try {
        adminLinkInput.value?.inputRef?.select()
        await navigator.clipboard.writeText(drawingStore.share.adminLink ?? '')
        adminUrlCopied.value = true
        drawingStore.setIsDrawingEditShared(true, dispatcher)
        adminTimeout = setTimeout(() => {
            adminUrlCopied.value = false
        }, 5000)
    } catch (error) {
        log.error({
            ...logConfig(),
            messages: [`Failed to copy: `, error],
        })
    }
}
</script>

<template>
    <div class="ga-share">
        <p data-cy="drawing-not-shared-admin-warning">
            {{ t('@swissgeo/drawing.drawing_not_shared_admin_warning') }}
        </p>
        <UFieldGroup>
            <UInput
                ref="adminLinkInput"
                v-model="drawingStore.share.adminLink"
                readonly
                @click="copyAdminShareUrl()"
            />
            <SwissGeoButton @click="copyAdminShareUrl()">
                {{
                    adminUrlCopied
                        ? t('@swissgeo/drawing.copy_success')
                        : t('@swissgeo/drawing.copy_url')
                }}
            </SwissGeoButton>
        </UFieldGroup>
        <div class="form-group">
            <label>{{ t('@swissgeo/drawing.draw_share_admin_link') }}:</label>
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
                    {{
                        adminUrlCopied
                            ? t('@swissgeo/drawing.copy_success')
                            : t('@swissgeo/drawing.copy_url')
                    }}
                </button>
            </div>
        </div>
        <button
            data-cy="drawing-share-admin-close"
            class="btn btn-dark"
            @click="onAccept()"
        >
            {{ t('@swissgeo/drawing.close') }}
        </button>
    </div>
</template>
