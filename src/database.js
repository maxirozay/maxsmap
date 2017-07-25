import { database } from './main'
import geohash from './util/geohash'

const GEOHASH_PRECISION = 4

export default {
  commentRef: null,
  regionsRef: null,
  regionRefs: [],
  createPost (post, position) {
    const regionId = geohash.encode(
      position.lat(),
      position.lng(),
      GEOHASH_PRECISION
    )
    const timestamp = Date.now()
    const regionRef = database.ref('regions-posts/' + regionId)
    const newPostRef = regionRef.push()
    return new Promise((resolve, reject) => {
      newPostRef
      .set({
        createdAt: timestamp,
        lat: position.lat(),
        lng: position.lng(),
        text: post.text,
        username: post.username
      })
      .then((value) => {
        resolve(value)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },
  getPosts (regionId, newPostCallback, postRemovedCallback) {
    if (regionId.length < GEOHASH_PRECISION) {
      this.regionsRef = database.ref('regions-posts')
      const self = this
      this.regionsRef.on('child_added', function (data) {
        if (data.key.startsWith(regionId)) {
          self.getPosts(data.key, newPostCallback, postRemovedCallback)
        }
      })
    } else {
      const regionRef = database.ref('regions-posts/' + regionId)
      regionRef.on('child_added', function (data) {
        newPostCallback(data.key, data.val())
      })
      regionRef.on('child_removed', function (data) {
        postRemovedCallback(data.key)
      })
      this.regionRefs.push(regionRef)
    }
  },
  removeRegionsListeners () {
    if (this.regionsRef) this.regionsRef.off()
    this.regionRefs.map((ref) => {
      ref.off()
    })
    this.regionRefs = []
  },
  deletePost (post) {
    const regionId = geohash.encode(post.lat, post.lng, GEOHASH_PRECISION)
    return new Promise((resolve, reject) => {
      database
      .ref(`regions-posts/${regionId}/${post.id}`)
      .remove()
      .then((value) => {
        resolve(value)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },
  comment (postId, comment) {
    const postCommentsRef = database.ref('post-comments/' + postId)
    const newCommentRef = postCommentsRef.push()
    return new Promise((resolve, reject) => {
      newCommentRef
      .set({
        createdAt: Date.now(),
        username: comment.username,
        text: comment.text
      })
      .then((value) => {
        resolve(value)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },
  getComments (postId, newCommentCallback) {
    this.commentsRef = database.ref('post-comments/' + postId)
    this.commentsRef.on('child_added', function (data) {
      newCommentCallback(data.val())
    })
  },
  removeCommentsListener () {
    if (this.commentsRef) this.commentsRef.off()
  },
  setUsername (username) {
    /* global localStorage */
    /* eslint no-undef: "error" */
    localStorage.setItem('username', username)
  },
  getUsername () {
    return localStorage.getItem('username')
  },
  setLocation (location) {
    localStorage.setItem('location', JSON.stringify(location))
  },
  getLocation () {
    if (localStorage.getItem('location')) {
      return JSON.parse(localStorage.getItem('location'))
    } else return { lat: 40.7414835, lng: -73.976287 }
  },
  setZoom (zoom) {
    localStorage.setItem('zoom', zoom)
  },
  getZoom () {
    if (localStorage.getItem('zoom')) {
      return parseInt(localStorage.getItem('zoom'))
    } else return 13
  }
}
