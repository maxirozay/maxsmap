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
    <post-editor class="post-position"
      v-if="showPostEditor"
      @cancel="showPostEditor = false"
      :marker="newPostMarker">
    </post-editor>
    <post class="post-position"
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

export default {
  name: 'post-map',
  components: {
    PostEditor,
    Post
  },
  data: function () {
    return {
      showPostEditor: false,
      map: null,
      newPostMarker: null,
      postMarkers: [],
      showPost: false,
      post: { title: '', details: '' }
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
      this.postMarkers.map((marker) => {
        marker.setMap(null)
        return marker
      })
      this.postMarkers = []
      const self = this
      database.getPosts(this.map.getCenter(),
          (post) => {
            const latlng = new google.maps.LatLng(post.lat, post.lng)
            const marker = new google.maps.Marker({
              position: latlng,
              map: this.map
            })
            marker.addListener('click', function () {
              self.showPostEditor = false
              self.post.title = post.title
              self.post.details = post.details
              self.showPost = true
            })
            self.postMarkers.push(marker)
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

.post-position
  position: absolute
  bottom: 0
  left: 0
  right: 0
  margin: auto
</style>
