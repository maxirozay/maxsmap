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

<style>
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.h-100 {
  height: 100%;
}
</style>
