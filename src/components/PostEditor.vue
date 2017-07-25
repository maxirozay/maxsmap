<template>
  <div class="card  mw-sm">
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

export default {
  name: 'post-editor',
  props: ['marker'],
  data () {
    return {
      post: { username: '', text: '' },
      sendPostButtonText: 'Post',
      usernameError: null,
      textError: null
    }
  },
  mounted () {
    this.post.username = database.getUsername() ? database.getUsername() : ''
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
        this.$emit('cancel')
      })
      .catch((error) => {
        if (error) this.sendPostButtonText = 'Retry'
      })
    }
  }
}
</script>
