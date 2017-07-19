<template>
  <section class="h-100">
    <div id="map"></div>
    <button @click="togglePostEditor"
      class="fab mdl-button mdl-js-button mdl-button--fab mdl-button--colored">
      <i class="material-icons">add</i>
    </button>
    <post-editor class="post-editor"
      v-if="showPostEditor"
      @cancel="togglePostEditor">
    </post-editor>
  </section>
</template>

<script>
import PostEditor from './PostEditor'

export default {
  name: 'post-map',
  components: {
    PostEditor
  },
  data: function () {
    return {
      showPostEditor: false
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      /* global google */
      /* eslint no-undef: "error" */
      const map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 46.2, lng: 6.1667},
        zoom: 11,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP
        },
        rotateControl: true
      })
      map.addListener('drag', function (e) {})
      map.addListener('dragend', function (e) {})
    },
    togglePostEditor () {
      this.showPostEditor = !this.showPostEditor
    }
  }
}
</script>

<style>
#map {
  height: 100%;
}

.fab {
  position: absolute;
  bottom: 24px;
  left: 50%;
  margin-left: -28px;
}

.post-editor {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  margin: auto
}
</style>
