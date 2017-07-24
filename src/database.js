import { database } from './main'
import geohash from './util/geohash'

export default {
  commentRef: null,
  regionRefs: [],
  createPost (title, details, position) {
    const regionId = geohash.encode(position.lat(), position.lng(), 4)
    const timestamp = Date.now()
    const regionRef = database.ref('regions-posts/' + regionId)
    const newPostRef = regionRef.push()
    return new Promise((resolve, reject) => {
      newPostRef
          .set({
            createdAt: timestamp,
            lat: position.lat(),
            lng: position.lng(),
            title: title,
            details: details
          })
          .then((value) => {
            resolve(value)
          })
          .catch((error) => {
            reject(error)
          })
    })
  },
  getPosts (position, newPostCallback, postRemovedCallback) {
    const regionId = geohash.encode(position.lat(), position.lng(), 4)
    const regionRef = database.ref('regions-posts/' + regionId)
    regionRef.on('child_added', function (data) {
      newPostCallback(data.key, data.val())
    })
    regionRef.on('child_removed', function (data) {
      postRemovedCallback(data.key)
    })
    this.regionRefs.push(regionRef)
  },
  removeRegionsListeners () {
    this.regionRefs.map((ref) => {
      ref.off()
    })
    this.regionRefs = []
  },
  deletePost (post) {
    const regionId = geohash.encode(post.lat, post.lng, 4)
    return new Promise((resolve, reject) => {
      database.ref(`regions-posts/${regionId}/${post.id}`)
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
  }
}
