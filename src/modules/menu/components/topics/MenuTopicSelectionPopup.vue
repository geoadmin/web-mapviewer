<template>
    <ModalWithOverlay :title="$t('choose_theme')" @close="onClose">
        <div class="menu-topic-selector-popup p-4">
            <div
                v-for="topic in topics"
                :key="topic.id"
                class="topic"
                :data-cy="`change-to-topic-${topic.id}`"
                @click="selectTopic(topic)"
            >
                <span class="topic-title">{{ $t(topic.id) }}</span>
                <TopicIcon :topic-id="topic.id" />
            </div>
        </div>
    </ModalWithOverlay>
</template>

<script>
import TopicIcon from '@/modules/menu/components/topics/TopicIcon.vue'
import ModalWithOverlay from '@/modules/overlay/components/ModalWithOverlay.vue'
export default {
    components: { TopicIcon, ModalWithOverlay },
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
@import 'src/scss/variables';
.menu-topic-selector-popup {
    * {
        text-align: left;
    }
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem 0.5rem;
    cursor: pointer;
    .topic {
        text-align: center;
        align-self: end;
    }
    .topic:last-child {
        padding-bottom: 1rem;
    }
}
</style>
