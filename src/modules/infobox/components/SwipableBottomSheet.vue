<template>
    <div class="wrapper">
        <div
            ref="card"
            class="card swipe-element"
            :class="{
                moving: isMoving,
                state,
            }"
            :style="swipeStyle"
        >
            <div ref="pan" class="pan-area py-3">
                <div ref="bar" class="bar" />
            </div>
            <div class="contents p-1" :style="contentStyle">
                <slot />
            </div>
        </div>
    </div>
</template>

<script>
import Hammer from 'hammerjs'

const SwipeState = {
    Close: 'close',
    OnlyHead: 'only-head',
    Half: 'half',
    Open: 'open',
}
const PAN_AREA_HEIGHT = 40
const BIG_SWIPE_THRESHOLD = 120
const SMALL_SWIPE_THRESHOLD = 50

const PERCENT_OF_SCREEN_COVERED_WHEN_OPEN = 80
const PERCENT_OF_SCREEN_COVERED_WHEN_HALF_OPEN = 20

export default {
    props: {
        startsOpen: {
            type: Boolean,
            default: false,
        },
        screenHeight: {
            type: Number,
            required: true,
        },
        footerHeight: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            mc: null,
            y: 0,
            startY: 0,
            isMoving: false,
            state: this.startsOpen ? SwipeState.Open : SwipeState.OnlyHead,
            contentHeight: 0,
        }
    },
    computed: {
        minTopValue() {
            return this.screenHeight * (1 - PERCENT_OF_SCREEN_COVERED_WHEN_OPEN / 100.0)
        },
        minTopValueToFitContent() {
            // we don't want the container to be bigger (on screen) than its content
            // so if the top value for the current state would mean blank space at the bottom, we lower it to a value
            // where it perfectly fits the content
            const perfectContentFit = this.maxTopValue - this.contentHeight
            if (this.minTopValue < perfectContentFit) {
                return perfectContentFit
            }
            return this.minTopValue
        },
        maxTopValue() {
            // here we want to keep the pan area above the bottom line of the screen
            // so the max top value is the size of the screen (everything hidden at the bottom) minus the size of the pan area (and margin)
            return this.screenHeight - PAN_AREA_HEIGHT - this.footerHeight
        },
        swipeStyle() {
            return { top: `${this.topValue}px` }
        },
        contentStyle() {
            return {
                height: `${this.maxTopValue - this.topValue}px`,
            }
        },
        topValue() {
            if (this.isMoving) {
                return this.y
            }
            if (this.state === SwipeState.Close) {
                return this.screenHeight
            }
            if (this.state === SwipeState.OnlyHead) {
                return this.maxTopValue
            }
            if (this.state === SwipeState.Half) {
                const halfTopValue =
                    this.screenHeight * (1.0 - PERCENT_OF_SCREEN_COVERED_WHEN_HALF_OPEN / 100.0)
                if (halfTopValue < this.minTopValueToFitContent) {
                    return this.minTopValueToFitContent
                }
                return halfTopValue
            }
            if (this.state === SwipeState.Open) {
                return this.minTopValueToFitContent
            }
            return 0
        },
    },
    mounted() {
        window.onresize = () => {
            this.calculateContentHeight()
        }
        this.calculateContentHeight()
        // we need to listen to changes in the slot in order to recalculate the content height
        this.slotObserver = new MutationObserver(this.calculateContentHeight)
        this.slotObserver.observe(this.$slots.default()[0].elm, {
            childList: true,
            subtree: true,
        })

        this.mc = new Hammer(this.$refs.pan)
        this.mc.get('pan').set({ direction: Hammer.DIRECTION_ALL })

        this.mc.on('panup pandown', (evt) => {
            const newY = evt.center.y - PAN_AREA_HEIGHT
            if (newY > this.minTopValue) {
                this.y = newY
            } else {
                this.y = this.minTopValue
            }
        })

        this.mc.on('panstart', (evt) => {
            this.startY = evt.center.y
            this.isMoving = true
        })

        this.mc.on('panend', (evt) => {
            this.isMoving = false
            const deltaY = this.startY - evt.center.y
            switch (this.state) {
                case SwipeState.OnlyHead:
                    if (deltaY > BIG_SWIPE_THRESHOLD) {
                        this.state = SwipeState.Open
                    } else if (deltaY > SMALL_SWIPE_THRESHOLD) {
                        this.state = SwipeState.Half
                    }
                    break
                case SwipeState.Half:
                    if (deltaY > BIG_SWIPE_THRESHOLD) {
                        this.state = SwipeState.Open
                    } else if (deltaY < -SMALL_SWIPE_THRESHOLD) {
                        this.state = SwipeState.OnlyHead
                    }
                    break
                case SwipeState.Open:
                    if (deltaY < 2 * -BIG_SWIPE_THRESHOLD) {
                        this.state = SwipeState.OnlyHead
                    } else if (deltaY < -SMALL_SWIPE_THRESHOLD) {
                        this.state = SwipeState.Half
                    }
                    break
            }
        })
    },
    beforeUnmount() {
        this.slotObserver.disconnect()
        this.mc.destroy()
        window.onresize = null
    },
    methods: {
        open() {
            this.state = SwipeState.Open
        },
        calculateContentHeight() {
            this.contentHeight = this.$slots.default()[0].elm.clientHeight
        },
    },
}
</script>

<style lang="scss" scoped>
@import 'src/scss/webmapviewer-bootstrap-theme';
.swipe-element {
    width: 100%;
    height: 100%;
    position: fixed;
    background: $white;
    z-index: $zindex-swipable-element;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -3px 4px rgba(0, 0, 0, 0.1);
    left: 0;
    transition: top 0.2s ease-out;
    &.close {
        box-shadow: none;
    }
    .bar {
        width: 45px;
        height: 8px;
        border-radius: 14px;
        background: $red;
        margin: 0 auto;
        cursor: pointer;
    }
    .pan-area,
    .contents {
        touch-action: none;
    }
    .contents {
        overflow-y: auto;
        box-sizing: border-box;
        iframe {
            pointer-events: none;
        }
    }
}
</style>
