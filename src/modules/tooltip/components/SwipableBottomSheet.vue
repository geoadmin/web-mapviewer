<template>
  <div class="wrapper" :data-open="state === 'OPEN' ? 1 : 0">
    <div ref="card"
         class="card"
         :data-state="isMoving ? 'MOVING' : state"
         :style="{ top: `${isMoving ? y : calcY()}px` }">
      <div class="pan-area" ref="pan">
        <div class="bar" ref="bar"></div>
      </div>
      <div class="contents p-1">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Hammer from "hammerjs"
import { mapActions } from "vuex";

const SWIPE_STATE = {
  CLOSE: 'CLOSE',
  ONLY_HEAD: 'ONLY_HEAD',
  HALF: 'HALF',
  OPEN: 'OPEN'
};
const BIG_SWIPE_THRESHOLD = 120;
const SMALL_SWIPE_THRESHOLD = 50;

export default {
  props: {
    openY: {
      type: Number,
      default: 0.2
    },
    halfY: {
      type: Number,
      default: 0.8
    },
    headY: {
      type: Number,
      default: 0.95
    },
    defaultState: {
      type: String,
      default: SWIPE_STATE.ONLY_HEAD
    }
  },
  data() {
    return {
      mc: null,
      y: 0,
      startY: 0,
      isMoving: false,
      state: this.defaultState,
      rect: {}
    }
  },
  computed: {
    maxY: function () {
      return this.rect.height * this.openY
    }
  },
  mounted () {
    window.onresize = () => {
      this.rect = this.$refs.card.getBoundingClientRect()
    }
    this.rect = this.$refs.card.getBoundingClientRect()
    this.mc = new Hammer(this.$refs.pan)
    this.mc.get('pan').set({ direction: Hammer.DIRECTION_ALL })

    this.mc.on("panup pandown", (evt) => {
      const newY = evt.center.y - 16;
      if (newY > this.rect.height * this.openY) {
        this.y = newY;
      } else {
        this.y = this.maxY;
      }
    })

    this.mc.on("panstart", (evt) => {
      this.startY = evt.center.y
      this.isMoving = true
    })

    this.mc.on("panend", (evt) => {
      this.isMoving = false
      const deltaY = this.startY - evt.center.y
      switch (this.state) {
        case SWIPE_STATE.ONLY_HEAD:
          if (deltaY > BIG_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.OPEN
          } else if (deltaY > SMALL_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.HALF
          }
          break;
        case SWIPE_STATE.HALF:
          if (deltaY > BIG_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.OPEN
          } else if (deltaY < -SMALL_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.ONLY_HEAD
          }
          break;
        case SWIPE_STATE.OPEN:
          if (deltaY < 2 * -BIG_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.ONLY_HEAD
          } else if (deltaY < -SMALL_SWIPE_THRESHOLD) {
            this.state = SWIPE_STATE.HALF
          }
          break;
      }
    })
  },
  beforeDestroy () {
    this.mc.destroy()
    window.onresize = null
  },
  methods: {
    calcY () {
      switch (this.state) {
        case SWIPE_STATE.CLOSE:
          return this.rect.height
        case SWIPE_STATE.ONLY_HEAD:
          return this.rect.height * this.headY
        case SWIPE_STATE.OPEN:
          return this.rect.height * this.openY
        case SWIPE_STATE.HALF:
          return this.rect.height * this.halfY
        default:
          return this.y;
      }
    },
    setState (state) {
      this.state = state
    },
    ...mapActions([''])
  }
}
</script>

<style lang="scss" scoped>
  @import "node_modules/bootstrap/scss/bootstrap";
  .card {
    width: 100%;
    height: 100vh;
    position: fixed;
    background: $white;
    border-radius: 10px 10px 0 0;
    box-shadow: 0 -3px 4px rgba(0, 0, 0, .1);
    left: 0;
  }
  .card[data-state="HALF"], .card[data-state="OPEN"], .card[data-state="CLOSE"], .card[data-state="ONLY_HEAD"] {
    transition: top .3s ease-out;
  }
  .card[data-state="CLOSE"] {
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
  .pan-area, .contents {
    touch-action: none;
  }
  .pan-area {
    padding: 12px 0;
  }
  .contents {
    overflow-y: scroll;
    max-height: 100%;
    padding-bottom: calc(100vh * 0.2);
    box-sizing: border-box;
  }
</style>
