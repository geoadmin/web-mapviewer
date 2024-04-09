<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const emits = defineEmits(['click'])

const store = useStore()
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
const currentLang = computed(() => store.state.i18n.lang)
</script>

<template>
    <div
        class="swiss-confederation-text"
        :class="{ 'dev-site': hasDevSiteWarning }"
        @click="(e) => emits('click', e)"
    >
        <div class="multi-lang-title"></div>
        <div
            class="i18n-partnership-text mt-1"
            :class="`i18n-partnership-text-${currentLang}`"
        ></div>
    </div>
</template>

<style lang="scss" scoped>
.multi-lang-title,
.i18n-partnership-text {
    background: url('@/modules/header/assets/text.png') no-repeat top left;
    background-size: 187px 135px;

    .dev-site & {
        background-image: url('@/modules/header/assets/text-dev.png');
    }
}
.multi-lang-title {
    width: 185px;
    height: 57px;
}
.i18n-partnership-text {
    height: 12px;
    // default hidden
    background-position: 0 -150px;
    &.i18n-partnership-text-de {
        background-position: 0 -64px;
    }
    &.i18n-partnership-text-en {
        background-position: 0 -78px;
    }
    &.i18n-partnership-text-fr {
        background-position: 0 -93px;
    }
    &.i18n-partnership-text-it {
        background-position: 0 -107px;
    }
    &.i18n-partnership-text-rm {
        background-position: 0 -120px;
    }
}
</style>
