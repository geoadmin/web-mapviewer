<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'App',
  mounted() {
    // reading size
    this.setScreenSizeFromWindowSize()
    window.onresize = () => {
      this.setScreenSizeFromWindowSize()
    }
  },
  methods: {
    ...mapActions(['setSize']),
    setScreenSizeFromWindowSize: function () {
      this.setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    },
  },
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
