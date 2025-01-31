<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const dispatcher = { dispatcher: 'HeaderMenuButton.vue' }

const store = useStore()
const i18n = useI18n()

const menuButtonText = computed(() => (store.state.ui.showMenu ? 'close' : 'menu'))
const isOpen = computed(() => store.state.ui.showMenu)

function toggleMenu() {
    store.dispatch('toggleMenu', dispatcher)
}
</script>

<template>
    <button
        type="button"
        data-cy="menu-button"
        class="btn menu-button"
        :class="{ 'menu-button-active': isOpen }"
        @click="toggleMenu(dispatcher)"
    >
        {{ i18n.t(menuButtonText) }}
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
