<template>
  <section class="h-100">
    <div id="map" class="h-100"></div>
    <div class="fab-position">
      <button @click="locate"
        class="button is-primary round fab">
        <i class="material-icons icon-centered">gps_fixed</i>
      </button>
      <button @click="togglePostEditor"
        class="button is-primary round fab">
        <i class="material-icons icon-centered">add</i>
      </button>
    </div>
    <transition name="slide-right">
      <post-editor class="post"
        v-if="showPostEditor"
        @cancel="showPostEditor = false"
        :marker="newPostMarker">
      </post-editor>
    </transition>
    <transition name="slide-right">
      <post class="post"
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
import postIcon from '../assets/post-icon.png'
import newPostIcon from '../assets/new-post-icon.png'

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
        center: new google.maps.LatLng(database.getLocation().lat, database.getLocation().lng),
        zoom: database.getZoom(),
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
        rotateControl: true,
        fullscreenControl: false
      })
      this.map.addListener('drag', function (e) {})
      this.map.addListener('dragend', function (e) {})
      const self = this
      this.map.addListener('bounds_changed', function (e) {
        database.setLocation({
          lat: self.map.getCenter().lat(),
          lng: self.map.getCenter().lng()
        })
        database.setZoom(self.map.getZoom())
        self.getPosts()
      })
    },
    togglePostEditor () {
      this.showPost = false
      this.showPostEditor = true
      if (this.newPostMarker === null) {
        const icon = {
          url: newPostIcon,
          size: new google.maps.Size(128, 64),
          scaledSize: new google.maps.Size(64, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(32, 32)
        }
        this.newPostMarker = new google.maps.Marker({
          position: this.map.getCenter(),
          draggable: true,
          animation: google.maps.Animation.DROP,
          map: this.map,
          icon: icon
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
          const icon = {
            url: postIcon,
            size: new google.maps.Size(96, 96),
            scaledSize: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 16)
          }
          const latlng = new google.maps.LatLng(post.lat, post.lng)
          const marker = new google.maps.Marker({
            position: latlng,
            map: this.map,
            icon: icon
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
  bottom: 0
  right: 0

.fab
  height: 56px
  width: 56px
  display: block
  vertical-align: bottom
  margin: 16px
  @media only screen and (min-width: $small)
    margin: 24px

.icon-centered
    display: inline-flex
    align-items: center
    justify-content: center
    vertical-align: middle

.post
  position: absolute
  bottom: 0
  left: 0
  right: 0
  margin-right: auto
</style>
