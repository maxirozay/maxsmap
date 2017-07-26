<template>
  <div class="card mw-sm">
    <div class="card-content">
      <p class="title is-4">New Post</p>
      <div class="field">
        <input class="input"
          type="text"
          maxlength="40"
          v-model="post.username"
          placeholder="Username">
          <p class="help is-danger" v-show="usernameError">
            {{ usernameError }}
          </p>
      </div>
      <textarea class="textarea"
        type="text"
        rows= "10"
        maxlength="400"
        v-model="post.text"
        placeholder="Write something that you want to share."></textarea>
        <p class="help is-danger" v-show="textError">
          {{ textError }}
        </p>
        <input type="file" name="image" @change="uploadImage" accept="image/*"/>
        <p class="help is-danger" v-show="uploadImageError">
          {{ uploadImageError }}
        </p>
        <img v-for="url in post.imagesUrls" :src="url"/>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item"
        @click="sendPost">
        {{sendPostButtonText}}
      </a>
      <a class="card-footer-item"
        @click="$emit('cancel')">
        Cancel
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'

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
      imageToDelete: 0
    }
  },
  mounted () {
    this.post.username = database.getUsername() ? database.getUsername() : ''
    this.post.id = `${Date.now()}-${Math.round(this.marker.position.lat())}-${Math.round(this.marker.position.lng())}-${Math.round(Math.random() * 99)}`
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
      storage.uploadImage(
        event.target.files[0],
        `posts/${this.post.id}/0.jpg`)
      .then((url) => {
        this.post.imagesUrls = [ url ]
        this.uploadImageError = null
        this.imageToDelete = 1
      })
      .catch((error) => {
        if (error) this.uploadImageError = `Your image couldn't be uploaded.`
      })
    }
  }
}
</script>
