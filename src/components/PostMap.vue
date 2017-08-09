<template>
  <section :class="mapSize + ' h-100'">
    <div id="map" class="h-100"></div>
    <div class="absolute-footer w-100 content has-text-centered">
      <div :class="mapSize">
        <a @click="locate" class="text-shadow" title="Locate Me">
          <i class="material-icons is-size-2">my_location</i>
        </a>
        <a @click="showOrder = !showOrder" class="text-shadow p-2" title="Post Order">
          <i v-if="postsOrder === 0" class="material-icons is-size-2 text-shadow">
            access_time
          </i>
          <i v-else class="material-icons is-size-2">chat_bubble_outline</i>
        </a>
        <a @click="createNewPostMarker" class="text-shadow" title="Create Post">
          <i class="material-icons is-size-2">add_circle_outline</i>
        </a>
      </div>
    </div>
    <transition name="slide-up-margin">
      <div v-show="showOrder" class="absolute-footer w-100 mb-footer has-text-centered">
        <div :class="mapSize">
          <a @click="changeOrder(0)" class="shadow button is-primary">
            <span class="icon">
              <i class="material-icons">access_time</i>
            </span>
            <span>
              Order by date
            </span>
          </a>
          <br><br>
          <a @click="changeOrder(1)" class="shadow button is-primary">
            <span class="icon">
              <i class="material-icons">chat_bubble_outline</i>
            </span>
            <span>
              Order by comments
            </span>
          </a>
        </div>
      </div>
    </transition>
    <transition name="slide-up">
      <div v-if="showNotification" class="w-100 absolute-footer">
        <div class="shadow w-sm m-auto notification is-primary">
          Your location is not found. Make sure the "location" permission
          and your device's location are enable.
          <p class="help">
            Click on the icon
            (<i class="material-icons">info_outline</i>
            or <i class="material-icons">lock</i>)
            on the left of the website's address in your browser to find your
            permission settings.
          </p>
        </div>
      </div>
    </transition>
    <transition name="slide-up">
      <post-preview
      class="absolute-footer"
      v-if="showPostPreview"
      @openPost="openPost"
      @close="showPostPreview = false; resizeMapNormal()"
      :post="post"
      :hasNext="postMarkers.length > 1"
      @previous="displayPost(--currentPostPosition)"
      @next="displayPost(++currentPostPosition)">
      </post-preview>
    </transition>
    <transition name="slide-left">
      <post-editor
      class="post"
      v-if="showPostEditor"
      :position="newPostPosition"
      @created="addMarker">
      </post-editor>
    </transition>
    <transition name="slide-left">
      <post
      ref="post"
      class="post"
      v-show="showPost"
      :hasNext="postMarkers.length > 1"
      @previous="displayPost(--currentPostPosition)"
      @next="displayPost(++currentPostPosition)">
      </post>
    </transition>
  </section>
</template>

<script>
/* global google, ga, history */
/* eslint no-undef: "error" */
import PostEditor from './PostEditor'
import Post from './Post'
import PostPreview from './PostPreview'
import database from '../database'
import postIcon from '../assets/post-icon.png'
import newPostIcon from '../assets/new-post-icon.png'

export default {
  name: 'post-map',
  components: {
    PostEditor,
    Post,
    PostPreview
  },
  data () {
    return {
      showPostEditor: false,
      map: null,
      newPostMarker: null,
      newPostPosition: null,
      postMarkers: [],
      currentPostPosition: 0,
      showPost: false,
      showPostPreview: false,
      willShowPostPreview: false,
      post: { id: '', title: '', details: '' },
      postsOrder: 0,
      showOrder: false,
      mapSize: '',
      showNotification: false
    }
  },
  created () {
    window.onpopstate = (event) => {
      if (event.state === null) {
        this.showPostEditor = false
        this.showPost = false
        this.resizeMapNormal()
        this.showPostPreview = this.willShowPostPreview
        this.willShowPostPreview = false
        if (this.showPostPreview) this.resizeMapWithPreview()
      }
    }
    this.postsOrder = database.getPostsOrder()
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
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: new google.maps.LatLng(
          database.getLocation().lat,
          database.getLocation().lng
        ),
        zoom: database.getZoom(),
        minZoom: 4,
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
      this.map.addListener('idle', e => {
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
      ga('send', 'event', 'map', 'create new post')
      if (this.newPostMarker === null) {
        const icon = {
          url: newPostIcon,
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
          ga('send', 'event', 'map', 'open new post')
          this.openPostEditor()
        })
        this.newPostMarker.addListener('dragend', () => {
          ga('send', 'event', 'map', 'move new post')
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
      if (window.innerWidth > 960) this.openPostEditor()
    },
    openPostEditor () {
      if (this.showPostEditor) return
      if (this.showPostPreview) {
        this.showPostPreview = false
        this.willShowPostPreview = true
      }
      if (this.showPost) {
        this.showPost = false
        this.resizeMapNormal()
        history.replaceState({
          type: 'post-editor',
          position: this.newPostPosition
        }, null, 'post-editor')
        setTimeout(() => {
          this.showPostEditor = true
          this.resizeMapWithPost()
        }, 300)
      } else {
        history.pushState({
          type: 'post-editor',
          position: this.newPostPosition
        }, null, 'post-editor')
        this.showPostEditor = true
        this.resizeMapWithPost()
      }
    },
    openPost () {
      if (this.showPostPreview) {
        this.showPostPreview = false
        this.willShowPostPreview = true
      }
      if (history.state) {
        history.replaceState({ type: 'post', post: this.post }, null, 'post')
      } else {
        history.pushState({ type: 'post', post: this.post }, null, 'post')
      }
      if (this.showPostEditor) {
        this.showPostEditor = false
        this.resizeMapNormal()
        setTimeout(() => {
          this.showPost = true
          this.resizeMapWithPost()
          this.$refs.post.init(this.post)
        }, 300)
      } else {
        this.showPost = true
        this.resizeMapWithPost()
        this.$refs.post.init(this.post)
      }
    },
    locate () {
      ga('send', 'event', 'map', 'locate')
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const pos = new google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            )
            this.map.setCenter(pos)
            this.map.setZoom(12)
          },
          error => {
            if (error) {
              this.showNotification = true
              setTimeout(() => { this.showNotification = false }, 6000)
            }
          }
        )
      }
    },
    getPosts () {
      const regionId = this.findRegions()
      let postsLimit = 40
      if (this.map.zoom < 13) postsLimit = 1
      else if (this.map.zoom < 15) postsLimit = 4
      database.removeRegionsListeners()
      this.postMarkers.map(marker => {
        marker.setMap(null)
      })
      this.postMarkers = []
      regionId.map(region => {
        database.getPosts(
          region,
          8,
          postsLimit,
          (key, post) => {
            post.id = key
            this.addMarker(post)
          },
          (key) => {
            this.removeMarker(key)
          })
      })
    },
    findRegions () {
      let precision = 1
      if (this.map.zoom > 16) precision = 6
      else if (this.map.zoom > 14) precision = 5
      else if (this.map.zoom > 11) precision = 4
      else if (this.map.zoom > 9) precision = 3
      else if (this.map.zoom > 7) precision = 2
      let corners = []
      corners.push({
        lat: (this.map.getBounds().getNorthEast().lat() +
        this.map.getCenter().lat()) / 2,
        lng: (this.map.getBounds().getSouthWest().lng() +
        this.map.getCenter().lng()) / 2
      })
      corners.push({
        lat: (this.map.getBounds().getNorthEast().lat() +
        this.map.getCenter().lat()) / 2,
        lng: (this.map.getBounds().getNorthEast().lng() +
        this.map.getCenter().lng()) / 2
      })
      corners.push({
        lat: (this.map.getBounds().getSouthWest().lat() +
        this.map.getCenter().lat()) / 2,
        lng: (this.map.getBounds().getSouthWest().lng() +
        this.map.getCenter().lng()) / 2
      })
      corners.push({
        lat: (this.map.getBounds().getSouthWest().lat() +
        this.map.getCenter().lat()) / 2,
        lng: (this.map.getBounds().getNorthEast().lng() +
        this.map.getCenter().lng()) / 2
      })
      let regionId = []
      corners.map(corner => {
        const region = database.getRegionId(corner, precision)
        if (regionId.indexOf(region) === -1) regionId.push(region)
      })
      return regionId
    },
    addMarker (post) {
      let size = 32
      if (post.commentsCount) {
        size += Math.floor(Math.log10(post.commentsCount)) * 8
      }
      if (
        this.postMarkers.filter(marker => {
          return marker.post.id === post.id
        })
        .length === 0
      ) {
        const icon = {
          url: postIcon,
          scaledSize: new google.maps.Size(size, size),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(size / 2, size / 2)
        }
        const latlng = new google.maps.LatLng(post.lat, post.lng)
        const marker = new google.maps.Marker({
          position: latlng,
          map: this.map,
          icon: icon
        })
        const markerPosition = this.postMarkers.length
        marker.addListener('click', () => {
          ga('send', 'event', 'map', 'open post')
          this.currentPostPosition = markerPosition
          this.post = post
          if (window.innerWidth < 960) {
            this.showPostPreview = true
            this.showPost = false
            this.resizeMapWithPreview()
          } else this.openPost()
        })
        marker.post = post
        this.postMarkers.push(marker)
      }
    },
    removeMarker (key) {
      this.postMarkers = this.postMarkers.filter(marker => {
        if (marker.post.id === key) {
          marker.setMap(null)
          return false
        } else return true
      })
    },
    displayPost (i) {
      if (i < 0) i = this.postMarkers.length - 1
      else if (i >= this.postMarkers.length) i = 0
      this.currentPostPosition = i
      this.post = this.postMarkers[i].post
      if (this.showPost) this.$refs.post.init(this.post)
    },
    changeOrder (order) {
      ga('send', 'event', 'map', 'changeOrder', order.toString())
      this.showOrder = false
      if (this.postsOrder !== order) {
        this.postsOrder = order
        database.setPostsOrder(order)
        this.getPosts()
      }
    },
    resizeMapNormal () {
      this.mapSize = 'map-transition map'
    },
    resizeMapWithPost () {
      if (window.innerWidth > 780) this.mapSize = 'map-transition map-post'
      else this.resizeMapNormal()
    },
    resizeMapWithPreview () {
      this.mapSize = 'map-transition map-preview'
    }
  }
}
</script>

<style lang="sass" scoped>
.post
  position: absolute
  bottom: 0
  right: 0

.text-shadow
  text-shadow: -1px -1px black

.shadow
  box-shadow: -1px -1px 1px black

.map-transition
  transition: margin-right .3s ease, padding-bottom .3s ease

.map
  margin-right: 0
  padding-bottom: 0

.map-post
  margin-right: 480px
  padding-bottom: 0

.map-preview
  padding-bottom: 33vh
</style>
