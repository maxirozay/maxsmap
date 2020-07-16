import firebase from 'firebase/app'
import 'firebase/storage'
import 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyDhV0SbEq0mxTxLR6ydAiw2jfjWPqQzPH0',
  authDomain: 'props-dd456.firebaseapp.com',
  databaseURL: 'https://props-dd456.firebaseio.com',
  projectId: 'props-dd456',
  storageBucket: 'gs://props-dd456.appspot.com/',
  messagingSenderId: '757120167992'
}

firebase.initializeApp(firebaseConfig)
