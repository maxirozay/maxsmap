<template>
  <section class="h-100">
    <div id="map" class="h-100"></div>
    <div class="fab-position">
      <button @click="locate" class="button is-primary round fab">
        <i class="material-icons icon-centered">gps_fixed</i>
      </button>
      <button @click="createNewPostMarker" class="button is-primary round fab">
        <i class="material-icons icon-centered">add</i>
      </button>
    </div>
    <transition name="slide-up">
      <post-preview
      class="sticky-footer"
      v-if="showPostPreview"
      @openPost="openPost()"
      @close="showPostPreview = false"
      :post="post">
      </post-preview>
    </transition>
    <transition name="slide-right">
      <post-editor
      class="post"
      v-if="showPostEditor"
      :position="newPostPosition">
      </post-editor>
    </transition>
    <transition name="slide-right">
      <post
      ref="post"
      class="post"
      v-show="showPost">
      </post>
    </transition>
    <div
    v-if="!map"
    class="h-100 w-100 center bg-white">
      <loading class="center"></loading>
    </div>
  </section>
</template>

<script>
import PostEditor from './PostEditor'
import Post from './Post'
import PostPreview from './PostPreview'
import database from '../database'
import postIcon from '../assets/post-icon.png'
import newPostIcon from '../assets/new-post-icon.png'
import Loading from './Loading'

export default {
  name: 'post-map',
  components: {
    PostEditor,
    Post,
    PostPreview,
    Loading
  },
  data () {
    return {
      showPostEditor: false,
      map: null,
      newPostMarker: null,
      newPostPosition: null,
      postMarkers: new Map(),
      showPost: false,
      showPostPreview: false,
      post: { id: '', title: '', details: '' }
    }
  },
  created () {
    window.onpopstate = (event) => {
      if (event.state === null) {
        this.showPostEditor = false
        this.showPost = false
      }
    }
  },
  mounted () {
    this.checkState()
    this.initMap()
  },
  beforeDestroy () {
    database.removeRegionsListeners()
  },
  methods: {
    checkState () {
      /* global history */
      /* eslint no-undef: "error" */
      if (history.state) {
        switch (history.state.type) {
          case 'post':
            this.post = history.state.post
            this.openPost()
            break
          case 'post-editor':
            this.newPostPosition = history.state.position
            this.showPostEditor = true
            break
        }
      }
    },
    initMap () {
      if (!window.mapIsLoaded) {
        return setTimeout(() => { this.initMap() }, 500)
      }
      /* global google */
      /* eslint no-undef: "error" */
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(
          database.getLocation().lat,
          database.getLocation().lng
        ),
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
      this.map.addListener('drag', (e) => {})
      this.map.addListener('dragend', (e) => {})
      this.map.addListener('bounds_changed', (e) => {
        database.setLocation({
          lat: this.map.getCenter().lat(),
          lng: this.map.getCenter().lng()
        })
        database.setZoom(this.map.getZoom())
        this.getPosts()
      })
      if (this.newPostPosition) this.createNewPostMarker()
    },
    createNewPostMarker () {
      if (this.newPostMarker === null) {
        const icon = {
          url: newPostIcon,
          size: new google.maps.Size(128, 64),
          scaledSize: new google.maps.Size(64, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(32, 32)
        }
        let position
        if (this.newPostPosition) {
          position = new google.maps.LatLng(
            this.newPostPosition.lat,
            this.newPostPosition.lng
          )
        } else position = this.map.getCenter()
        this.newPostMarker = new google.maps.Marker({
          position: position,
          draggable: true,
          animation: google.maps.Animation.DROP,
          map: this.map,
          icon: icon
        })
        this.newPostMarker.addListener('click', () => {
          this.openPostEditor()
        })
        this.newPostMarker.addListener('drag', () => {
          this.newPostPosition = {
            lat: this.newPostMarker.position.lat(),
            lng: this.newPostMarker.position.lng()
          }
        })
      } else {
        this.newPostMarker.setPosition(this.map.getCenter())
      }
      this.newPostPosition = {
        lat: this.newPostMarker.position.lat(),
        lng: this.newPostMarker.position.lng()
      }
      this.openPostEditor()
    },
    openPostEditor () {
      if (this.showPostEditor) return
      if (this.showPost) {
        this.showPost = false
        history.replaceState({
          type: 'post-editor',
          position: this.newPostPosition
        }, null, 'post-editor')
        setTimeout(() => { this.showPostEditor = true }, 300)
      } else {
        history.pushState({
          type: 'post-editor',
          position: this.newPostPosition
        }, null, 'post-editor')
        this.showPostEditor = true
      }
    },
    openPost () {
      if (history.state) {
        history.replaceState({ type: 'post', post: this.post }, null, 'post')
      } else {
        history.pushState({ type: 'post', post: this.post }, null, 'post')
      }
      if (this.showPostEditor) {
        setTimeout(() => {
          this.showPost = true
          this.$refs.post.init(this.post)
        }, 300)
      } else {
        this.showPost = true
        this.$refs.post.init(this.post)
      }
      this.showPostPreview = false
      this.showPostEditor = false
    },
    locate () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          this.map.setCenter(pos)
        })
      }
    },
    getPosts () {
      database.removeRegionsListeners()
      let precision = 5
      if (this.map.zoom < 6) precision = 1
      else if (this.map.zoom < 12) precision = 2
      else if (this.map.zoom < 14) precision = 3
      else if (this.map.zoom < 16) precision = 4
      const regionId = database.getRegionId(
        {lat: this.map.getCenter().lat(), lng: this.map.getCenter().lng()},
        precision
      )
      database.getPosts(regionId,
        (key, post) => {
          const icon = {
            url: postIcon,
            size: new google.maps.Size(96, 96),
            scaledSize: new google.maps.Size(32, 32),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(16, 16)
          }
          const latlng = new google.maps.LatLng(post.lat, post.lng)
          const marker = new google.maps.Marker({
            position: latlng,
            map: this.map,
            icon: icon
          })
          post.id = key
          marker.addListener('click', () => {
            this.post = post
            if (window.innerWidth < 960) {
              this.showPostPreview = true
              this.showPost = false
            } else this.openPost()
          })
          this.postMarkers.set(key, marker)
        },
        (key) => {
          if (this.postMarkers.has(key)) {
            this.postMarkers.get(key).setMap(null)
            this.postMarkers.delete(key)
          }
        })
      this.postMarkers.forEach((marker, key, map) => {
        marker.setMap(null)
      })
      this.postMarkers.clear()
      setTimeout(database.removeRegionsListeners(), 60000)
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
