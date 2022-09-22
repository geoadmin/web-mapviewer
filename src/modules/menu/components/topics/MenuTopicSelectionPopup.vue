<template>
    <ModalWithBackdrop :title="$t('choose_theme')" @close="onClose">
        <div class="menu-topic-popup">
            <div
                v-for="topic in topics"
                :key="topic.id"
                class="menu-topic-popup-topic"
                :data-cy="`change-to-topic-${topic.id}`"
                @click="selectTopic(topic)"
            >
                {{ $t(topic.id) }}
                <TopicIcon :topic-id="topic.id" />
            </div>
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
    },
    emits: ['selectTopic', 'close'],
    methods: {
        selectTopic(topic) {
            this.$emit('selectTopic', topic)
        },
        onClose() {
            this.$emit('close')
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
    cursor: pointer;
}
.menu-topic-popup-topic {
    text-align: center;
    align-self: end;
}
</style>
