<template>
    <ModalWithBackdrop :title="$t('choose_theme')" @close="onClose">
        <div class="menu-topic-popup">
            <button
                v-for="topic in topics"
                :key="topic.id"
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
                {{ $t(topic.id) }}
                <TopicIcon :topic-id="topic.id" />
            </button>
        </div>
    </ModalWithBackdrop>
</template>

<script>
import TopicIcon from '@/modules/menu/components/topics/TopicIcon.vue'
import ModalWithBackdrop from '@/utils/ModalWithBackdrop.vue'

export default {
    components: { TopicIcon, ModalWithBackdrop },
    props: {
        topics: {
            type: Array,
            default: () => [],
        },
        currentId: {
            type: [String, null],
            default: null,
        },
    },
    emits: ['selectTopic', 'close'],
    methods: {
        selectTopic(topic) {
            this.$emit('selectTopic', topic)
        },
        onClose() {
            this.$emit('close')
        },
        getTooltipMessage(id) {
            const translationKey = 'topic_' + id + '_tooltip'
            const message = this.$t(translationKey)
            return message === translationKey || message === this.$t(id) ? '' : message
        },
    },
}
</script>

<style lang="scss" scoped>
.menu-topic-popup {
    display: grid;
    // Automatic number of columns, minimum width of a cell is 161px
    grid-template-columns: repeat(auto-fill, minmax(161px, 1fr));
    // Guarantees that all rows have identical heights (height of the rows will be the height of the heighest cell)
    grid-auto-rows: 1fr;
    padding: 1rem;
    gap: 1rem;
}
.menu-topic-popup-topic {
    text-align: center;
    align-self: end;
}
</style>
