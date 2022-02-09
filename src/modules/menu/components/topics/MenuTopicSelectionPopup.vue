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
        selectTopic: function (topic) {
            this.$emit('selectTopic', topic)
        },
        onClose: function () {
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss" scoped>
.menu-topic-popup {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem 0.5rem;
    padding: 1.5rem;
    cursor: pointer;
}
.menu-topic-popup-topic {
    text-align: center;
    align-self: end;
}
</style>
