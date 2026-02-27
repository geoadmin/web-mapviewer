<script setup lang="ts">
import type { ActionDispatcher } from '~/types/drawingStore'

import log from '@swissgeo/log'
import { logConfig, useDrawingStore } from '#imports'
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher: ActionDispatcher = { name: 'SwissGeoDrawingShare.vue' }

const drawingStore = useDrawingStore()
const { t } = useI18n()

const adminUrlCopied = ref<boolean>(false)
const publicUrlCopied = ref<boolean>(false)
const adminLinkInput = useTemplateRef('adminLinkInput')
const publicLinkInput = useTemplateRef('publicLinkInput')

onMounted(() => {
    if (!drawingStore.share.publicLink || !drawingStore.share.adminLink) {
        drawingStore.generateShareLinks(dispatcher).catch((error) =>
            log.error({
                ...logConfig(),
                messages: [`Failed to generate share links: `, error],
            })
        )
    }
})

let adminCopyTimeout: ReturnType<typeof setTimeout> | undefined
let publicCopyTimeout: ReturnType<typeof setTimeout> | undefined

onUnmounted(() => {
    clearTimeout(adminCopyTimeout)
    clearTimeout(publicCopyTimeout)
})

async function copyPublicUrl() {
    try {
        publicLinkInput.value?.inputRef?.select()
        await navigator.clipboard.writeText(drawingStore.share.publicLink ?? '')
        publicUrlCopied.value = true
        publicCopyTimeout = setTimeout(() => {
            publicUrlCopied.value = false
        }, 5000)
    } catch (error) {
        log.error({
            ...logConfig(),
            messages: [`Failed to copy: `, error],
        })
    }
}

async function copyAdminUrl() {
    try {
        adminLinkInput.value?.inputRef?.select()
        await navigator.clipboard.writeText(drawingStore.share.adminLink ?? '')
        adminUrlCopied.value = true
        drawingStore.setHasAdminLinkBeenCopied(true, dispatcher)
        adminCopyTimeout = setTimeout(() => {
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
    <UForm class="space-y-3">
        <UFormField :label="t('@swissgeo/drawing.draw_share_user_link')">
            <UFieldGroup class="w-full">
                <UInput
                    ref="publicLinkInput"
                    class="grow"
                    v-model="drawingStore.share.publicLink"
                    :loading="!drawingStore.share.publicLink"
                    readonly
                    @click="copyPublicUrl()"
                />
                <SwissGeoButton
                    @click="copyPublicUrl()"
                    :disabled="!drawingStore.share.publicLink"
                >
                    {{
                        publicUrlCopied
                            ? t('@swissgeo/drawing.copy_success')
                            : t('@swissgeo/drawing.copy_url')
                    }}
                </SwissGeoButton>
            </UFieldGroup>
        </UFormField>
        <UFormField :label="t('@swissgeo/drawing.draw_share_admin_link')">
            <UFieldGroup class="w-full">
                <UInput
                    ref="adminLinkInput"
                    class="grow"
                    v-model="drawingStore.share.adminLink"
                    :loading="!drawingStore.share.adminLink"
                    readonly
                    @click="copyAdminUrl()"
                />
                <SwissGeoButton
                    @click="copyAdminUrl()"
                    :disabled="!drawingStore.share.adminLink"
                >
                    {{
                        adminUrlCopied
                            ? t('@swissgeo/drawing.copy_success')
                            : t('@swissgeo/drawing.copy_url')
                    }}
                </SwissGeoButton>
            </UFieldGroup>
        </UFormField>
    </UForm>
</template>
