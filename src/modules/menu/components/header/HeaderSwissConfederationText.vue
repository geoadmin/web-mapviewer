<template>
    <div class="swiss-confederation-text">
        <div class="multi-lang-title"></div>
        <div
            class="i18n-partnership-text mt-1"
            :class="`i18n-partnership-text-${currentLang}`"
        ></div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            currentLang: (state) => state.i18n.lang,
        }),
    },
}
</script>

<style lang="scss">
.multi-lang-title,
.i18n-partnership-text {
    background: url('../../assets/text.png') no-repeat top left;
    background-size: 187px 135px;
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
