import { storage } from './main'
import firebase from 'firebase'

export default {
  uploadImage (file, filePath) {
    const uploadTask = storage.ref().child(filePath).put(file)
    return new Promise((resolve, reject) => {
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
        (snapshot) => {},
        (error) => {
          reject(error)
        },
        () => {
          resolve(uploadTask.snapshot.downloadURL)
        }
      )
    })
  },
  delete (path) {
    storage.ref().child(path).delete()
  },
  getUrl (postId) {
    return `https://firebasestorage.googleapis.com/v0/b/props-dd456.appspot.com/o/posts%2F${postId}%2F0.jpg?alt=media`
  }
}
