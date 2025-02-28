<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { t } = useI18n()

const store = useStore()
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
</script>

<template>
    <div
        class="confederation-logo d-flex"
        :class="{ 'dev-site': hasDevSiteWarning }"
    >
        <img
            class="swiss-flag"
            src="@/assets/svg/swiss-flag.svg"
            alt="swiss-flag"
            data-cy="swiss-flag"
        />
        <div
            class="d-none d-lg-flex swiss-confederation-text position-relative flex-column text-nowrap"
            data-cy="swiss-confederation-text"
        >
            <div class="d-flex flex-column">
                <span> Schweizerische Eidgenossenschaft </span>
                <span> Confédération suisse </span>
                <span> Confederazione Svizzera </span>
                <span> Confederaziun svizra </span>
            </div>
            <div class="partnership-text">
                {{ t('in_collaboration_with_the_cantons') }}
            </div>
            <h2
                v-if="hasDevSiteWarning"
                class="dev-site-warning text-danger position-absolute h-100 z-3 text-center d-flex justify-content-center align-items-center opacity-50"
            >
                <strong>
                    TEST SITE<br />
                    TEST SITE
                </strong>
            </h2>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import '@/scss/variables-admin.module';
@import '@/scss/media-query.mixin';

$lengthUnit: 0.4rem;

$fontSize: 7.5pt;
$lineHeight: 10.35pt;
$letterSpacing: calc((78 / 1000) * 1em);

@media print {
    $lengthUnit: 1mm;
}

$defaultMargin: calc(2 * $lengthUnit);
$flagSize: calc(5 * $lengthUnit);
$logoWidth: calc(40 * $lengthUnit);

.confederation-logo {
    font-family: $frutiger;

    .dev-site-warning {
        font-family: $frutiger;
    }

    margin: $defaultMargin;
    width: $flagSize;
    gap: $defaultMargin;
    .swiss-flag {
        width: $flagSize;
        height: fit-content;
    }
    .swiss-confederation-text {
        font-size: $fontSize;
        line-height: $lineHeight;
        letter-spacing: $letterSpacing;
        .partnership-text {
            margin-top: $lineHeight;
        }
    }
    &.dev-site {
        .swiss-flag {
            filter: hue-rotate(225deg);
        }
    }
}
@include respond-above(lg) {
    .confederation-logo {
        width: $logoWidth;
    }
}
</style>
