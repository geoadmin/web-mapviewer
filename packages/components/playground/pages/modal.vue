<script setup lang="ts">
import { ref } from 'vue'

const wasClosed = ref<boolean>(false)
const withConfirmation = ref<boolean>(false)

function onCloseModal(closedWithConfirmation: boolean): void {
    wasClosed.value = true
    withConfirmation.value = closedWithConfirmation
}
</script>

<template>
    <div class="p-2">
        <UAlert
            v-if="wasClosed"
            color="info"
            :title="`A modal was closed ${withConfirmation ? 'with confirmation' : 'without confirmation'}`"
        />
        <UAlert
            v-else
            color="info"
            title="No modal has been closed yet"
        />
        <div class="mt-2 grid grid-cols-4 gap-2">
            <SwissGeoModal @close="onCloseModal">
                <SwissGeoButton>Show simple modal</SwissGeoButton>
                <template #content> Some content for the simple modal </template>
            </SwissGeoModal>
            <SwissGeoModal
                title="I have a title"
                @close="onCloseModal"
            >
                <SwissGeoButton>Show modal with title</SwissGeoButton>
                <template #content> Some content for the modal with title </template>
            </SwissGeoModal>
            <SwissGeoModal
                show-confirmation-buttons
                @close="onCloseModal"
            >
                <SwissGeoButton>Show modal with confirmation buttons</SwissGeoButton>
                <template #content>
                    <div>
                        <span class="p-1">
                            Some content for the modal with confirmation buttons
                        </span>
                        <div class="mt-1 rounded border border-red-200 bg-red-100 p-2 text-red-700">
                            Some warning before confirming the action
                        </div>
                    </div>
                </template>
            </SwissGeoModal>
            <SwissGeoModal
                theme="warning"
                title="This is a warning"
                @close="onCloseModal"
            >
                <SwissGeoButton color="warning">Show warning modal</SwissGeoButton>
                <template #content> Warning! Warning! Warning! </template>
            </SwissGeoModal>
            <SwissGeoModal
                theme="warning"
                title="This is a warning"
                :confirm-button="{
                    i18nKey: 'confirm',
                }"
                show-confirmation-buttons
                @close="onCloseModal"
            >
                <SwissGeoButton color="warning">
                    Show warning modal with confirmation buttons
                </SwissGeoButton>
                <template #content> Warning! Warning! Warning! Please confirm... </template>
            </SwissGeoModal>
            <SwissGeoModal
                theme="error"
                title="This is an error"
                @close="onCloseModal"
            >
                <SwissGeoButton color="error"> Show error modal </SwissGeoButton>
                <template #content> Error! Error! Error! </template>
            </SwissGeoModal>
            <SwissGeoModal
                theme="error"
                title="This is an error"
                :confirm-button="{
                    i18nKey: 'confirm',
                }"
                show-confirmation-buttons
                @close="onCloseModal"
            >
                <SwissGeoButton color="error">
                    Show error modal with confirmation buttons
                </SwissGeoButton>
                <template #content> Error! Error! Error! Please confirm... </template>
            </SwissGeoModal>
        </div>
    </div>
</template>
