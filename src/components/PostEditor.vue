<template>
  <div class="card h-100 mw-sm scrollable">
    <div class="card-content">
      <p class="title is-4">
        New Post
      </p>
      <div class="field">
        <input
        class="input"
        type="text"
        maxlength="40"
        v-model="post.username"
        placeholder="Username">
        <p class="help is-danger" v-show="usernameError">
          {{ usernameError }}
        </p>
      </div>
      <div class="field">
        <textarea
        class="textarea"
        type="text"
        rows= "10"
        maxlength="400"
        v-model="post.text"
        placeholder="Write something that you want to share."></textarea>
        <p class="help is-danger" v-show="textError">
          {{ textError }}
        </p>
      </div>
      <div class="field">
        <label :class="uploadImageLabelClass" for="uploadImage">
          <i class="material-icons is-primary">image</i>
          Upload an image (optional)
        </label>
        <input
        id="uploadImage"
        type="file"
        name="image"
        @change="uploadImage"
        accept="image/*"
        class="absolute opacity-0"/>
        <p class="help is-danger" v-show="uploadImageError">
          {{ uploadImageError }}ssssssssss
        </p>
      </div>
      <img v-for="url in post.imagesUrls" :src="url"/>
      <p class="help">
        By uploading or posting content on this service you agree to make your
        content public and give the rights to use it by anybody. Any of your
        content can be deleted at any time, for any reason, by anybody.
      </p>
    </div>
    <footer class="card-footer sticky-footer bg-white mw-sm">
      <a class="card-footer-item" @click="sendPost">
      {{sendPostButtonText}}
      </a>
      <a class="card-footer-item" @click="$emit('cancel')">
        Cancel
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'
import image from '../util/image'

export default {
  name: 'post-editor',
  props: ['marker'],
  data () {
    return {
      post: { id: null, username: '', text: '', imagesUrls: [] },
      sendPostButtonText: 'Post',
      usernameError: null,
      textError: null,
      uploadImageError: null,
      imageToDelete: 0,
      uploadImageLabelClass: 'is-fullwidth button'
    }
  },
  mounted () {
    this.post.username = database.getUsername() ? database.getUsername() : ''
    this.post.id = `${Number.MAX_SAFE_INTEGER - Date.now()}-${Math.round(this.marker.position.lat())}-${Math.round(this.marker.position.lng())}-${Math.round(Math.random() * 99)}`
  },
  beforeDestroy () {
    for (let i = 0; i < this.imageToDelete; i++) {
      storage.delete(`posts/${this.post.id}/${i}.jpg`)
    }
  },
  methods: {
    sendPost () {
      if (this.post.username.length < 3) {
        this.usernameError = 'Please write at least 3 characters.'
        return
      } else this.usernameError = null
      if (this.post.text.length < 20) {
        this.textError = 'Please write at least 20 characters.'
        return
      } else this.textError = ''
      database.setUsername(this.post.username)

      database
      .createPost(this.post, this.marker.position)
      .then((value) => {
        this.imageToDelete = 0
        this.$emit('cancel')
      })
      .catch((error) => {
        if (error) this.sendPostButtonText = 'Retry'
      })
    },
    uploadImage (event) {
      const self = this
      image.resizeImage(event.target.files[0], 480, (blob) => {
        self.uploadImageLabelClass = 'is-fullwidth button is-loading'
        storage.uploadImage(blob, `posts/${self.post.id}/0.jpg`)
        .then((url) => {
          self.uploadImageLabelClass = 'is-fullwidth button'
          self.post.imagesUrls = [ url ]
          self.uploadImageError = null
          self.imageToDelete = 1
        })
        .catch((error) => {
          self.uploadImageLabelClass = 'is-fullwidth button'
          if (error) self.uploadImageError = `Your image couldn't be uploaded.`
        })
      })
    }
  }
}
</script>
