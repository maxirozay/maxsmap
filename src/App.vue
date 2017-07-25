<template>
  <div id="app" class="h-100">
    <main class="h-100">
      <post-map></post-map>
    </main>
  </div>
</template>

<script>
import PostMap from './components/PostMap'

export default {
  name: 'app',
  components: {
    PostMap
  }
}
</script>

<style lang="sass">
@import ./style/app

html,
body
  height: 100%
  margin: 0
  padding: 0
  overflow: hidden
  -webkit-tap-highlight-color: transparent

#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
</style>
