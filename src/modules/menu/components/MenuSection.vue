<template>
    <div class="card menu-section">
        <div class="card-header menu-section-head d-block" @click="toggleShowBody">
            <span class="float-left">
                <font-awesome-icon :icon="['fas', titleCaretIcon]" />
                <span class="menu-section-head-title">{{ title }}</span>
            </span>
            <span class="extra-button float-right text-right" @click.prevent="toggleShowBody">
                <slot name="extra-button" />
            </span>
        </div>
        <div v-show="showBody" class="card-body p-0 menu-section-body">
            <slot />
        </div>
    </div>
</template>

<style lang="scss">
.menu-section-head {
    display: flex;
    cursor: pointer;
    .menu-section-head-title {
        width: 100%;
        text-align: left;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
    .extra-button:hover {
        text-decoration: underline;
    }
}
</style>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true,
        },
        showContent: {
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
    },
    watch: {
        showContent: function (showContent) {
            this.showBody = showContent
        },
    },
    methods: {
        toggleShowBody: function () {
            this.showBody = !this.showBody
            if (this.showBody) {
                this.$emit('showBody')
            }
        },
    },
}
</script>
