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
  getUrl (path) {
    return new Promise((resolve, reject) => {
      storage.ref().child(path).getDownloadURL()
      .then((url) => {
        resolve(url)
      })
      .catch((error) => {
        if (error) reject(error)
      })
    })
  }
}
