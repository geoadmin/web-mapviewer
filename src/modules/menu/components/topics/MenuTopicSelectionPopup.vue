<template>
    <div
        v-show="showPopup"
        class="menu-topic-selector-popup-container"
        :class="{ 'menu-topic-selector-popup-visible': showPopup }"
        @click="onClickOnOverlay"
    >
        <div class="menu-topic-selector-popup card">
            <div class="card-header">
                {{ $t('choose_theme') }}
            </div>
            <div class="card-body menu-topic-selector-popup-topic-list">
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
        </div>
    </div>
</template>
<style lang="scss">
.menu-topic-selector-popup-container {
    z-index: 500;
    display: flex;
    align-content: center;
    background-color: rgba(0, 0, 0, 0.5);
    // Only set the fixed position when visible, otherwise e2e test thinks it's on top of the app overlay and fails
    &.menu-topic-selector-popup-visible {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    .menu-topic-selector-popup {
        width: 40rem;
        max-width: 95vw;
        top: 0;
        max-height: 80%;
        overflow-y: auto;
        margin: auto;
        background: white;
        * {
            text-align: left;
        }
        .menu-topic-selector-popup-topic-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-gap: 1rem 0.5rem;
            .topic {
                text-align: center;
                align-self: end;
            }
            .topic:last-child {
                padding-bottom: 1rem;
            }
        }
    }
}
</style>
<script>
import TopicIcon from '@/modules/menu/components/topics/TopicIcon'
export default {
    components: { TopicIcon },
    props: {
        showPopup: {
            type: Boolean,
            default: false,
        },
        topics: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        selectTopic: function (topic) {
            this.$emit('selectTopic', topic)
        },
        onClickOnOverlay: function () {
            this.$emit('clickWithoutTopic')
        },
    },
}
</script>
