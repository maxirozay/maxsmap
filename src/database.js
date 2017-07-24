import { database } from './main'
import geohash from './util/geohash'

export default {
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
  getPosts (position, newPostCallback) {
    const regionId = geohash.encode(position.lat(), position.lng(), 4)
    const regionRef = database.ref('regions-posts/' + regionId)
    regionRef.on('child_added', function (data) {
      newPostCallback(data.key, data.val())
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
    const postCommentsRef = database.ref('post-comments/' + postId)
    postCommentsRef.on('child_added', function (data) {
      newCommentCallback(data.val())
    })
  }
}
