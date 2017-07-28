import { database } from './main'
import geohash from './util/geohash'

const GEOHASH_PRECISION = 4

export default {
  commentRef: null,
  regionsRef: null,
  regionRefs: [],
  createPost (post, position) {
    const regionId = geohash.encode(
      position.lat,
      position.lng,
      GEOHASH_PRECISION
    )
    const timestamp = Date.now()
    const newPostRef = database.ref(`regions-posts/${regionId}/${post.id}`)
    return new Promise((resolve, reject) => {
      let newPost = {
        createdAt: timestamp,
        lat: position.lat,
        lng: position.lng,
        text: post.text,
        username: post.username
      }
      if (post.imagesUrls.length > 0) {
        newPost.imagesCount = post.imagesUrls.length
      }
      newPostRef
      .set(newPost)
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
      this.regionsRef.on('child_added', (data) => {
        if (data.key.startsWith(regionId)) {
          this.getPosts(data.key, newPostCallback, postRemovedCallback)
        }
      })
    } else {
      const regionRef = database.ref('regions-posts/' + regionId)
      regionRef.on('child_added', (data) => {
        newPostCallback(data.key, data.val())
      })
      regionRef.on('child_removed', (data) => {
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
  comment (post, comment) {
    if (!this.commentRegionId) {
      return new Promise((resolve, reject) => { reject('no region') })
    }
    const newCommentRef = database
    .ref(`regions-comments/${this.commentRegionId}/${post.id}`).push()
    return new Promise((resolve, reject) => {
      newCommentRef
      .set({
        createdAt: Date.now(),
        username: comment.username,
        text: comment.text
      })
      .then((value) => {
        database
        .ref(`regions-posts/${this.commentRegionId}/${post.id}`)
        .transaction((post) => {
          if (post.commentsCount === undefined) post.commentsCount = 1
          else post.commentsCount++
          return post
        })
        resolve(value)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },
  getComments (post, newCommentCallback) {
    this.commentRegionId = geohash.encode(
      post.lat,
      post.lng,
      GEOHASH_PRECISION
    )
    this.commentsRef = database
    .ref(`regions-comments/${this.commentRegionId}/${post.id}`)
    this.commentsRef.on('child_added', (data) => {
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
