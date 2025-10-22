<script setup lang="ts">
import useUIStore from '@/store/modules/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const dispatcher = { name: 'HeaderMenuButton.vue' }

const uiStore = useUIStore()

const { t } = useI18n()

const menuButtonText = computed(() => (uiStore.showMenu ? 'close' : 'menu'))
const isOpen = computed(() => uiStore.showMenu)

function toggleMenu() {
    uiStore.toggleMenu(dispatcher)
}
</script>

<template>
    <button
        type="button"
        data-cy="menu-button"
        class="btn menu-button"
        :class="{ 'menu-button-active': isOpen }"
        @click="toggleMenu"
    >
        {{ t(menuButtonText) }}
    </button>
</template>

<style lang="scss" scoped>
.menu-button {
    font-weight: bold;

    &-active {
        background-color: #474949;
        color: #fff;
    }
}
</style>
