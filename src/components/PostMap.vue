<template>
  <section class="h-100">
    <div id="map"></div>
    <div class="fab">
      <button @click="locate"
        class=" mdl-button mdl-js-button mdl-button--fab mdl-button--colored">
        <i class="material-icons">gps_fixed</i>
      </button>
      <br><br>
      <button @click="togglePostEditor"
        class=" mdl-button mdl-js-button mdl-button--fab mdl-button--colored">
        <i class="material-icons">add</i>
      </button>
    </div>
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
      showPostEditor: false,
      map: null
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      /* global google */
      /* eslint no-undef: "error" */
      this.map = new google.maps.Map(document.getElementById('map'), {
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
      this.map.addListener('drag', function (e) {})
      this.map.addListener('dragend', function (e) {})

      this.locate()
    },
    togglePostEditor () {
      this.showPostEditor = !this.showPostEditor
    },
    locate () {
      if (navigator.geolocation) {
        const self = this
        navigator.geolocation.getCurrentPosition(function (position) {
          const pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude)
          self.map.setCenter(pos)
        })
      }
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
  bottom: 16px;
  right: 16px;
}
@media only screen and (min-width: 600px) {
  .fab {
    position: absolute;
    bottom: 24px;
    right: 24px;
  }
}

.post-editor {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  margin: auto
}
</style>
