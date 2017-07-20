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
            latitude: position.lat(),
            longitude: position.lng(),
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
  }
}
