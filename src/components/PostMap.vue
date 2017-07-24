<template>
  <section class="h-100">
    <div id="map" class="h-100"></div>
    <div class="fab-position">
      <button @click="locate"
        class="button is-primary round fab">
        <i class="material-icons">gps_fixed</i>
      </button>
      <br><br>
      <button @click="togglePostEditor"
        class="button is-primary round fab">
        <i class="material-icons">add</i>
      </button>
    </div>
    <transition name="slide-up">
      <post-editor class="post mw-md"
        v-if="showPostEditor"
        @cancel="showPostEditor = false"
        :marker="newPostMarker">
      </post-editor>
    </transition>
    <transition name="slide-up">
      <post class="post mw-md"
        v-if="showPost"
        @close="showPost = false"
        :post="post">
      </post>
    </transition>
  </section>
</template>

<script>
import PostEditor from './PostEditor'
import Post from './Post'
import database from '../database'
import geohash from '../util/geohash'

export default {
  name: 'post-map',
  components: {
    PostEditor,
    Post
  },
  data () {
    return {
      showPostEditor: false,
      map: null,
      newPostMarker: null,
      postMarkers: new Map(),
      showPost: false,
      post: { id: '', title: '', details: '' }
    }
  },
  mounted () {
    this.initMap()
  },
  beforeDestroy () {
    database.removeRegionsListeners()
  },
  methods: {
    initMap () {
      if (!window.mapIsLoaded) {
        return setTimeout(() => { this.initMap() }, 500)
      }
      /* global google */
      /* eslint no-undef: "error" */
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 46.2, lng: 6.1667},
        zoom: 11,
        minZoom: 3,
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
      const self = this
      this.map.addListener('bounds_changed', function (e) { self.getPosts() })

      this.locate()
    },
    togglePostEditor () {
      this.showPost = false
      this.showPostEditor = true
      if (this.newPostMarker === null) {
        this.newPostMarker = new google.maps.Marker({
          position: this.map.getCenter(),
          draggable: true,
          animation: google.maps.Animation.DROP,
          map: this.map
        })
        const self = this
        this.newPostMarker.addListener('click', function () {
          self.showPostEditor = true
          self.showPost = false
        })
      } else {
        this.newPostMarker.setPosition(this.map.getCenter())
      }
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
    },
    getPosts () {
      this.postMarkers.forEach((marker, key, map) => {
        marker.setMap(null)
      })
      this.postMarkers.clear()
      const self = this
      database.removeRegionsListeners()
      let precision = 4
      if (this.map.zoom < 6) precision = 1
      else if (this.map.zoom < 9) precision = 2
      else if (this.map.zoom < 12) precision = 3
      const regionId = geohash.encode(
        this.map.getCenter().lat(),
        this.map.getCenter().lng(),
        precision)
      database.getPosts(regionId,
        (key, post) => {
          const latlng = new google.maps.LatLng(post.lat, post.lng)
          const marker = new google.maps.Marker({
            position: latlng,
            map: this.map
          })
          marker.addListener('click', function () {
            self.showPostEditor = false
            self.post = post
            self.post.id = key
            self.showPost = true
          })
          self.postMarkers.set(key, marker)
        },
        (key) => {
          if (self.postMarkers.has(key)) {
            self.postMarkers.get(key).setMap(null)
            self.postMarkers.delete(key)
          }
        })
    }
  }
}
</script>

<style lang="sass">
@import ../style/variables

.fab-position
  position: absolute
  bottom: 16px
  right: 16px
  @media only screen and (min-width: $md)
    bottom: 24px
    right: 24px

.fab
  height: 56px
  width: 56px

.post
  position: absolute
  bottom: 0
  left: 0
  right: 0
  margin-right: auto
</style>
