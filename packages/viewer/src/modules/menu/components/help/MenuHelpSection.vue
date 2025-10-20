<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { IS_TESTING_WITH_CYPRESS } from '@/config/staging.config'
import { languages, type SupportedLang } from '@/modules/i18n/index.js'
import FeedbackButton from '@/modules/menu/components/help/feedback/FeedbackButton.vue'
import HelpLink from '@/modules/menu/components/help/HelpLink.vue'
import MoreInfo from '@/modules/menu/components/help/MoreInfo.vue'
import ReportProblemButton from '@/modules/menu/components/help/ReportProblemButton.vue'
import UpdateInfo from '@/modules/menu/components/help/UpdateInfo.vue'
import MenuSection from '@/modules/menu/components/menu/MenuSection.vue'
import AppVersion from '@/utils/components/AppVersion.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'
import OfflineReadinessStatus from '@/utils/offline/OfflineReadinessStatus.vue'
import useI18nStore from '@/store/modules/i18n.store'
import useUIStore from '@/store/modules/ui.store'

const dispatcher = { name: 'MenuHelpSection.vue' }

const emits = defineEmits(['openMenuSection'])

const sectionId = 'helpSection'
const showContent = ref(false)
const showAboutUs = ref(false)

const { t } = useI18n()
const uiStore = useUIStore()
const i18nStore = useI18nStore()

const hasGiveFeedbackButton = computed(() => uiStore.hasGiveFeedbackButton)
const hasReportProblemButton = computed(() => uiStore.hasReportProblemButton)

const currentLang = computed(() => i18nStore.lang)

// this is needed to pass the selected value to the changelang function
const selectedLang = ref(currentLang.value)

watch(currentLang, () => {
    selectedLang.value = currentLang.value
})

function changeLang(lang: SupportedLang) {
    i18nStore.setLang(lang, dispatcher)
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

function onOpenMenuSection(sectionId: string) {
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
        <div
            class="help-links d-flex flex-column gap-1 p-2"
            data-cy="menu-help-content"
        >
            <div class="d-flex justify-content-stretch w-100 gap-1">
                <FeedbackButton v-if="hasGiveFeedbackButton" />
                <ReportProblemButton v-if="hasReportProblemButton" />
            </div>
            <HelpLink show-as-button />
            <button
                class="btn btn-light border-light-subtle"
                @click="showAboutUs = true"
            >
                {{ t('about_us') }}
            </button>
            <div>
                <OfflineReadinessStatus
                    v-if="!IS_TESTING_WITH_CYPRESS"
                    with-text
                />
            </div>
            <ModalWithBackdrop
                v-if="showAboutUs"
                :title="t('about_us')"
                @close="showAboutUs = false"
            >
                <div class="d-flex flex-column justify-content-stretch w-100 gap-1">
                    <MoreInfo show-as-button />
                    <UpdateInfo show-as-button />
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
                    <AppVersion class="mobile-app-version mt-1 text-center" />
                </div>
            </ModalWithBackdrop>
        </div>
        <template #extra-button>
            <div class="position-relative d-flex end-0 top-0">
                <select
                    v-model="selectedLang"
                    class="position-absolute form-control form-control-sm menu-lang-switch bg-light text-dark translate-middle-y end-0 top-50"
                    data-cy="mobile-lang-selector"
                    @change="changeLang(selectedLang)"
                    @click.stop
                >
                    <option
                        v-for="lang in Object.keys(languages)"
                        :key="lang"
                        :value="lang"
                    >
                        {{ lang.toUpperCase() }}
                    </option>
                </select>
            </div>
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
