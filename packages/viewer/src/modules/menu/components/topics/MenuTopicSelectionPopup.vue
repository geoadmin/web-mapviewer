<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import TopicIcon from '@/modules/menu/components/topics/TopicIcon.vue'
import ModalWithBackdrop from '@/utils/components/ModalWithBackdrop.vue'

interface Topic {
    id: string
    [key: string]: any
}

const { topics, currentId } = defineProps<{
    topics?: Topic[]
    currentId?: string
}>()

const emits = defineEmits<{
    selectTopic: [topic: Topic]
    close: []
}>()

const { t } = useI18n()

function selectTopic(topic: Topic) {
    emits('selectTopic', topic)
}

function onClose() {
    emits('close')
}

function getTooltipMessage(id: string) {
    const translationKey = `topic_${id}_tooltip`
    const message = t(translationKey)
    return message === translationKey || message === t(id) ? '' : message
}
</script>

<template>
    <ModalWithBackdrop
        :title="t('choose_theme')"
        @close="onClose"
    >
        <div class="menu-topic-popup">
            <div
                v-for="topic in topics"
                :key="topic.id"
                class="menu-topic-popup-topic-wrapper"
            >
                <button
                    type="button"
                    :title="getTooltipMessage(topic.id)"
                    class="menu-topic-popup-topic btn"
                    :class="{
                        'btn-primary': currentId === topic.id,
                        'btn-light': currentId !== topic.id,
                    }"
                    :data-cy="`change-to-topic-${topic.id}`"
                    @click="selectTopic(topic)"
                >
                    <span>{{ t(topic.id) }}</span>
                    <TopicIcon :topic-id="topic.id" />
                </button>
            </div>
        </div>
    </ModalWithBackdrop>
</template>

<style lang="scss" scoped>
@import '@/scss/media-query.mixin';

// The preferred width is chosen so that all titles (even the german ones) can stay one one line
$preferred_button_width: 190px;

.menu-topic-popup {
    display: grid;
    // Automatic number of columns, minimum width of a cell is 147px.
    // This allows us to have 2 rows even on mobile, tradeoff is that some titles are cut in two lines
    grid-template-columns: repeat(auto-fill, minmax(147px, 1fr));
    // Guarantees that all rows have identical heights (height of the rows will be the height of the heighest cell)
    grid-auto-rows: 1fr;
    padding: 0;
    gap: 1rem;
    hyphens: auto;
    overflow-wrap: break-word;

    @include respond-above(lg) {
        // We want the titles to always appear on one line and the button width to be fixed
        // on big screens.
        grid-template-columns: repeat(auto-fill, minmax($preferred_button_width, 1fr));
    }
}

.menu-topic-popup-topic {
    text-align: center;
    align-self: end;
    width: 100%;
    max-width: $preferred_button_width;

    & > p {
        margin: 0;
    }
}

.menu-topic-popup-topic-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
