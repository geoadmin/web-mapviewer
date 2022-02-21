<template>
    <div
        class="swiss-confederation-text"
        :class="{ 'dev-site': devSiteWarning }"
        @click="$emit('click', $event)"
    >
        <div class="multi-lang-title"></div>
        <div
            class="i18n-partnership-text mt-1"
            :class="`i18n-partnership-text-${currentLang}`"
        ></div>
    </div>
</template>

<script>
import { ENVIRONMENT } from '@/config'
export default {
    props: {
        currentLang: {
            type: String,
            default: 'en',
        },
    },
    emits: ['click'],
    data() {
        return {
            devSiteWarning: ENVIRONMENT !== 'production',
        }
    },
}
</script>

<style lang="scss" scoped>
.multi-lang-title,
.i18n-partnership-text {
    background: url('../../assets/text.png') no-repeat top left;
    background-size: 187px 135px;

    .dev-site & {
        background-image: url('../../assets/text-dev.png');
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
