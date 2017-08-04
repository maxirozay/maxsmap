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
      @openPost="openPost"
      @close="showPostPreview = false"
      :post="post"
      :hasNext="postMarkers.length > 1"
      @previous="displayPost(--currentPostPosition)"
      @next="displayPost(++currentPostPosition)">
      </post-preview>
    </transition>
    <transition name="slide-right">
      <post-editor
      class="post"
      v-if="showPostEditor"
      :position="newPostPosition"
      @created="addMarker">
      </post-editor>
    </transition>
    <transition name="slide-right">
      <post
      ref="post"
      class="post"
      v-show="showPost"
      :hasNext="postMarkers.length > 1"
      @previous="displayPost(--currentPostPosition)"
      @next="displayPost(++currentPostPosition)">
      </post>
    </transition>
    <div
    v-if="!map"
    class="h-100 w-100 center light">
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
      postMarkers: [],
      currentPostPosition: 0,
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
      this.map.addListener('idle', (e) => {
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
        this.newPostMarker.addListener('dragend', () => {
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
        navigator.geolocation.getCurrentPosition(position => {
          const pos = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          this.map.setCenter(pos)
        })
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
          this.currentPostPosition = markerPosition
          this.post = post
          if (window.innerWidth < 960) {
            this.showPostPreview = true
            this.showPost = false
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
