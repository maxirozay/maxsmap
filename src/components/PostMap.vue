<template>
    <div id="map"></div>
</template>

<script>
export default {
  name: 'post-map',
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
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: true,
        fullscreenControl: true
      })
      map.addListener('drag', function (e) {})
      map.addListener('dragend', function (e) {})
    }
  }
}
</script>

<style>
  #map {
    height: 100%;
  }
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
  }
</style>
