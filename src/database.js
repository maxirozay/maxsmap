import { database } from './main'
import geohash from './util/geohash'
import sjcl from '../node_modules/sjcl/sjcl'

const GEOHASH_PRECISION = 6

export default {
  regionsRefs: [],
  regionRefs: [],
  getRegionId (position, precision) {
    let regionId = geohash.encode(
      position.lat,
      position.lng,
      precision
    )
    return regionId.split('').join('/')
  },
  createPost (post, position) {
    const regionId = this.getRegionId(position, GEOHASH_PRECISION)
    const timestamp = Date.now()
    const newPostRef = database.ref(`regions/${regionId}/posts/${post.id}`)
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
      if (post.adminKey.length > 0) {
        newPost.adminKey = sjcl.encrypt(post.adminKey, post.adminKey)
      }
      if (post.cypherKey.length > 0) {
        newPost.cypherKey = sjcl.encrypt(post.cypherKey, post.cypherKey)
        newPost.text = sjcl.encrypt(post.cypherKey, post.text)
      }
      newPostRef
      .set(newPost)
      .then((value) => {
        newPost.id = post.id
        resolve(newPost)
      })
      .catch((error) => {
        reject(error)
      })
    })
  },
  getPosts (
    regionId,
    regionDivider,
    postsLimit,
    newPostCallback,
    postRemovedCallback
  ) {
    if (regionId.length < GEOHASH_PRECISION * 2 - 1) {
      const regionsRef = database.ref('regions/' + regionId)
      .limitToLast(regionDivider)
      regionsRef.on('child_added', (data) => {
        this.getPosts(
          `${regionId}/${data.key}`,
          Math.ceil(regionDivider / 2),
          postsLimit,
          newPostCallback,
          postRemovedCallback
        )
      })
      this.regionsRefs.push(regionsRef)
    } else {
      const regionRef = database.ref(`regions/${regionId}/posts`)
      .limitToLast(postsLimit)
      regionRef.on('child_added', (data) => {
        newPostCallback(data.key, data.val())
      })
      regionRef.on('child_removed', (data) => {
        postRemovedCallback(data.key)
      })
      this.regionRefs.push(regionRef)
    }
  },
  verifyPassword (encryptedPassword, password) {
    try {
      if (!(password || encryptedPassword)) return true
      if (sjcl.decrypt(password, encryptedPassword) === password) return true
      return false
    } catch (e) {
      return false
    }
  },
  decrypt (password, data) {
    return sjcl.decrypt(password, data)
  },
  removeRegionsListeners () {
    this.regionsRefs.map((ref) => {
      ref.off()
    })
    this.regionsRefs = []
    this.regionRefs.map((ref) => {
      ref.off()
    })
    this.regionRefs = []
  },
  deletePost (post) {
    return new Promise((resolve, reject) => {
      const regionId = this.getRegionId(
        {lat: post.lat, lng: post.lng},
        GEOHASH_PRECISION
      )
      database
      .ref(`regions/${regionId}/posts/${post.id}`)
      .remove()
      .then((value) => {
        resolve(value)
      })
      .catch((error) => {
        reject(error)
      })
      database
      .ref(`regions/${regionId}/comments/${post.id}`)
      .remove()
    })
  },
  comment (post, comment) {
    if (!this.commentRegionId) {
      return new Promise((resolve, reject) => { reject('no region') })
    }
    const newComment = {
      createdAt: Date.now(),
      username: comment.username,
      text: comment.text
    }
    if (post.isPrivate) {
      newComment.username = sjcl.encrypt(
        post.cypherKey,
        comment.username
      )
      newComment.text = sjcl.encrypt(
        post.cypherKey,
        comment.text
      )
    }
    const newCommentRef = database
    .ref(`regions/${this.commentRegionId}/comments/${post.id}`).push()
    return new Promise((resolve, reject) => {
      newCommentRef
      .set(newComment)
      .then((value) => {
        database
        .ref(`regions/${this.commentRegionId}/posts/${post.id}`)
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
    this.commentRegionId = this.getRegionId(
      {lat: post.lat, lng: post.lng},
      GEOHASH_PRECISION
    )
    this.commentsRef = database
    .ref(`regions/${this.commentRegionId}/comments/${post.id}`)
    .limitToLast(50)
    this.commentsRef.on('child_added', (data) => {
      let comment = data.val()
      if (post.isPrivate) {
        comment.username = sjcl.decrypt(
          post.cypherKey,
          comment.username
        )
        comment.text = sjcl.decrypt(
          post.cypherKey,
          comment.text
        )
      }
      newCommentCallback(comment)
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
