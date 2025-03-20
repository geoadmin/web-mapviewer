<script setup>
/**
 * Confederation logo in accordance (to the best of my abilities) to the CD Bund document found on
 * bk.admin.ch
 *
 * @see https://www.bk.admin.ch/bk/de/home/dokumentation/cd-bund/das-erscheinungsbild-der-schweizerischen-bundesverwaltung-im-int.html
 * @see https://www.bk.admin.ch/bk/fr/home/documentation/identite-visuelle-de-ladministration-federale-suisse/webdesign-bund.html
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const { renderForDpi = null } = defineProps({
    renderForDpi: {
        type: Number,
        default: null,
    },
})

const { t } = useI18n()

const store = useStore()
const hasDevSiteWarning = computed(() => store.getters.hasDevSiteWarning)
</script>

<template>
    <div
        class="confederation-logo d-flex"
        :class="{ 'dev-site': hasDevSiteWarning, 'dpi-responsive': renderForDpi !== null }"
    >
        <img
            class="swiss-flag"
            src="@/assets/svg/swiss-flag.svg"
            alt="swiss-flag"
            data-cy="swiss-flag"
        />
        <div
            class="swiss-confederation-text position-relative flex-column text-nowrap"
            :class="{ 'd-none d-lg-flex': renderForDpi === null, 'd-flex': renderForDpi !== null }"
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

@mixin confederation-logo($lengthUnit, $fontSize, $lineHeight) {
    // using page 21 of the document to decide margins and sizes
    $defaultMargin: calc(2 * $lengthUnit);
    $flagSize: calc(5 * $lengthUnit);
    // document suggest a 55mm width, but using a 55 multiple here was generating too big of a width so I lowered it a bit
    $logoWidth: calc(40 * $lengthUnit);

    gap: $defaultMargin;
    margin: $defaultMargin;
    width: $flagSize;

    .swiss-flag {
        width: $flagSize;
    }

    .swiss-confederation-text {
        font-size: $fontSize;
        line-height: $lineHeight;
        letter-spacing: $letterSpacing;
        .partnership-text {
            margin-top: $lineHeight;
        }
    }

    @include respond-above(lg) {
        width: $logoWidth;
    }
}
// the document uses some Adobe Illustrator specific unit, that looks like is in fact a 1000th of a char size
$letterSpacing: calc((78 / 1000) * 1em);

.confederation-logo {
    font-family: $frutiger;

    @include confederation-logo(
        // the document suggest using [mm], but in the web context that is a bad call, so I've switched
        // to a [rem] value that has about the same visual output as if I'd written [1mm] here.
        0.4rem,
        // font size values found in the guide document
        7.5pt,
        10.35pt
    );

    &.dpi-responsive {
        // Print specific values, using screen width (or height) to adapt the logo/text to the DPI used
        // to print. Similar to what is done in PrintView.vue.
        $minFontSize: 8px;
        $printFontSizeRelToWidth: 0.8vw;
        $printFontSizeRelToHeight: 0.8vh;
        $printFontSize: max(max($printFontSizeRelToWidth, $printFontSizeRelToHeight), $minFontSize);

        @include confederation-logo(
            calc(0.66 * $printFontSize),
            $printFontSize,
            calc(1.2 * $printFontSize)
        );
        // forcing the length of the logo to the 55mm expressed in the CD-Bund PDF guide.
        width: 55mm;
    }

    .swiss-flag {
        // because Safari doesn't understand fit-content, we need to fix the height to some pixel height
        // Without that, Safari spreads the flag way down over the menu, and breaks the menu usability
        height: 36px;
    }

    &.dev-site {
        .swiss-flag {
            filter: hue-rotate(225deg);
        }
    }
}
</style>
