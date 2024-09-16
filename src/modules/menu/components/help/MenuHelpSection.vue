<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { languages } from '@/modules/i18n/index.js'
import FeedbackButton from '@/modules/menu/components/help/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/help/HelpLink.vue'
import MoreInfo from '@/modules/menu/components/help/MoreInfo.vue'
import ReportProblemButton from '@/modules/menu/components/help/ReportProblemButton.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import AppVersion from '@/utils/components/AppVersion.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

const dispatcher = { dispatcher: 'MenuHelpSection.vue' }

const emits = defineEmits(['openMenuSection'])

const sectionId = 'helpSection'
const showContent = ref(false)
const showAboutUs = ref(false)

const { t } = useI18n()
const store = useStore()
const hasGiveFeedbackButton = computed(() => store.getters.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => store.getters.hasReportProblemButton)

const currentLang = ref(store.state.i18n.lang)

function changeLang(lang) {
    store.dispatch('setLang', {
        lang,
        ...dispatcher,
    })
}

function toggleShowContent() {
    showContent.value = !showContent.value
}

function open() {
    showContent.value = true
}

function close() {
    showContent.value = false
}

function onOpenMenuSection(sectionId) {
    emits('openMenuSection', sectionId)
}

defineExpose({
    open,
    close,
    sectionId,
})
</script>

<template>
    <MenuSection
        :section-id="sectionId"
        :title="t('search_help')"
        :show-content="showContent"
        data-cy="menu-help-section"
        secondary
        @click:header="toggleShowContent"
        @open-menu-section="onOpenMenuSection"
    >
        <div class="help-links p-2 d-flex flex-column gap-1" data-cy="menu-help-content">
            <div class="d-flex gap-1 w-100 justify-content-stretch">
                <FeedbackButton v-if="hasGiveFeedbackButton" />
                <ReportProblemButton v-if="hasReportProblemButton" />
            </div>
            <HelpLink show-as-button />
            <button class="btn btn-light border-light-subtle" @click="showAboutUs = true">
                {{ t('about_us') }}
            </button>
            <ModalWithBackdrop
                v-if="showAboutUs"
                :title="t('about_us')"
                @close="showAboutUs = false"
            >
                <div class="d-flex flex-column gap-1 w-100 justify-content-stretch">
                    <MoreInfo show-as-button />
                    <a
                        :href="`https://www.geo.admin.ch/${currentLang}/home.html`"
                        target="_blank"
                        class="btn btn-light border-light-subtle"
                    >
                        {{ t('ech_service_link_label') }}
                    </a>
                    <a
                        :href="t('copyright_url')"
                        target="_blank"
                        class="btn btn-light border-light-subtle"
                    >
                        {{ t('copyright_label') }}
                    </a>
                    <AppVersion class="mt-1 mobile-app-version text-center" />
                </div>
            </ModalWithBackdrop>
        </div>
        <template #extra-button>
            <select
                v-model="currentLang"
                class="form-control form-control-sm menu-lang-switch bg-light text-dark"
                data-cy="mobile-lang-selector"
                @change="changeLang(currentLang)"
                @click.stop
            >
                <option v-for="lang in Object.keys(languages)" :key="lang" :value="lang">
                    {{ lang.toUpperCase() }}
                </option>
            </select>
        </template>
    </MenuSection>
</template>

<style lang="scss" scoped>
@import '@/scss/webmapviewer-bootstrap-theme';
.help-links {
    width: 100%;
    a {
        color: $black;
        text-decoration: initial;
    }
    a:hover,
    a:focus {
        text-decoration: underline;
    }
}
.mobile-app-version {
    font-size: 0.75rem;
}

.menu-lang-switch {
    position: absolute;
    right: 2px;
    top: 4px;
    width: 60px;
    text-align: center;
    // for dumb Safari, bugs still there 14 years after
    // https://bugs.webkit.org/show_bug.cgi?id=40216
    text-align-last: center;
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: inherit;
    outline: inherit;
    &:hover,
    &:focus {
        text-decoration: underline;
    }
}
</style>
