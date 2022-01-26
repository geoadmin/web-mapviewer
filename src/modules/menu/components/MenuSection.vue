<template>
    <div
        class="card menu-section rounded-0 border-0 border-light border-bottom"
        :class="{
            'bg-secondary text-white': secondary && !showBody,
        }"
    >
        <div
            class="card-header menu-section-head d-block"
            :class="{ 'bg-white': showBody }"
            data-cy="menu-section-header"
            data-toggle="collapse"
            @click="toggleShowBody"
        >
            <span class="float-start" :class="{ 'fw-bold': showBody }">
                <font-awesome-icon :icon="['fas', titleCaretIcon]" />
                <span class="menu-section-head-title px-2">{{ title }}</span>
            </span>
            <span class="extra-button float-end text-end" @click.prevent="toggleShowBody">
                <slot name="extra-button" />
            </span>
        </div>
        <CollapseTransition :duration="200">
            <div
                v-show="showBody"
                ref="sectionBody"
                class="card-body p-0 bg-white menu-section-body"
            >
                <slot />
            </div>
        </CollapseTransition>
    </div>
</template>

<script>
// importing directly the vue component, see https://github.com/ivanvermeyen/vue-collapse-transition/issues/5
import CollapseTransition from '@ivanv/vue-collapse-transition/src/CollapseTransition.vue'

export default {
    components: {
        CollapseTransition,
    },
    props: {
        title: {
            type: String,
            required: true,
        },
        showContent: {
            type: Boolean,
            default: false,
        },
        alwaysKeepClosed: {
            type: Boolean,
            default: false,
        },
        secondary: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            showBody: this.showContent,
        }
    },
    computed: {
        titleCaretIcon: function () {
            if (this.showBody) {
                return 'caret-down'
            }
            return 'caret-right'
        },
        computedBodyHeight: function () {
            return this.$refs.sectionBody && this.$refs.sectionBody.clientHeight
        },
    },
    watch: {
        showContent: function (showContent) {
            this.showBody = showContent
        },
    },
    methods: {
        toggleShowBody: function () {
            if (!this.alwaysKeepClosed) {
                this.showBody = !this.showBody
            }
            if (this.showBody) {
                this.$emit('showBody')
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.menu-section-head {
    display: flex;
    cursor: pointer;
    .menu-section-head-title {
        width: 100%;
        text-align: left;
    }
    .extra-button:hover {
        text-decoration: underline;
    }
}
</style>
