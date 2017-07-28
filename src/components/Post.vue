<template>
  <div class="card h-100 mw-sm scrollable pb-2">
    <div v-if="imageUrl" class="card-image">
      <figure class="image">
        <img @load="imageLoaded" :class="imageClass" :src="imageUrl" alt="post image">
      </figure>
    </div>
    <div class="card-content">
      <div class="content">
        <p class="break-word">
          <strong>
            {{ post.username }}
          </strong>
          <small>
            {{ dateAgo(post.createdAt) }}
          </small>
          <br>
          {{ post.text }}
        </p>
        <div class="field">
          <input
          class="input"
          type="text"
          maxlength="40"
          v-model="newComment.username"
          placeholder="Username">
          <p class="help is-danger" v-show="usernameError">
            {{ usernameError }}
          </p>
        </div>
        <div class="field">
          <textarea
          class="textarea"
          type="text"
          rows= "3"
          maxlength="200"
          v-model="newComment.text"
          placeholder="Your comment..."></textarea>
          <p class="help is-danger" v-show="textError">
            {{ textError }}
          </p>
        </div>
        <div v-for="comment in comments">
          <p class="break-word">
            <strong>
              {{ comment.username }}
            </strong>
            <small>
              {{ dateAgo(comment.createdAt) }}
            </small>
            <br>
            {{ comment.text }}
          </p>
        </div>
      </div>
    </div>
    <footer class="card-footer sticky-footer bg-white mw-sm">
      <a class="card-footer-item" @click="sendComment">
        {{commentButtonText}}
      </a>
      <a class="card-footer-item" @click="$emit('close')">
        Close
      </a>
      <a class="card-footer-item" @click="deletePost">
        {{ deleteButtonText }}
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'

export default {
  name: 'post',
  props: ['post'],
  data () {
    return {
      newComment: { username: '', text: '' },
      commentButtonText: 'Send',
      deleteButtonText: 'Delete',
      comments: [],
      usernameError: null,
      textError: null,
      imageUrl: null,
      imageClass: ''
    }
  },
  mounted () {
    this.loadImages()
    this.getComments()
    this.newComment.username = database.getUsername() ? database.getUsername() : ''
  },
  beforeDestroy () {
    database.removeCommentsListener()
  },
  methods: {
    getComments () {
      database
      .getComments(this.post,
        (comment) => {
          this.comments.unshift(comment)
        })
    },
    sendComment () {
      if (this.newComment.username.length < 3) {
        this.usernameError = 'Please write at least 3 characters.'
        return
      } else this.usernameError = null
      if (this.newComment.text.length < 3) {
        this.textError = 'Please write at least 3 characters.'
        return
      } else this.textError = ''
      database.setUsername(this.newComment.username)

      database
      .comment(this.post, this.newComment)
      .then((value) => {
        this.newComment.text = ''
        this.commentButtonText = 'Send'
      })
      .catch((error) => {
        if (error) this.commentButtonText = 'Retry'
      })
    },
    dateAgo (timestamp) {
      const minutesAgo = Math.floor((Date.now() - timestamp) / 60000)
      if (minutesAgo < 60) return minutesAgo + ' min'
      const hoursAgo = Math.floor(minutesAgo / 60)
      if (hoursAgo < 60) {
        return hoursAgo === 1 ? hoursAgo + ' hour' : hoursAgo + ' hours'
      }
      const daysAgo = Math.floor(hoursAgo / 24)
      return daysAgo === 1 ? daysAgo + ' day' : daysAgo + ' days'
    },
    deletePost () {
      database
      .deletePost(this.post)
      .then((value) => {
        this.$emit('close')
      })
      .catch((error) => {
        if (error) this.deleteButtonText = 'Retry'
      })
    },
    loadImages () {
      if (this.post.imagesCount) {
        storage.getUrl(`posts/${this.post.id}/0.jpg`)
        .then((url) => {
          this.imageUrl = url
        })
        .catch((error) => {
          if (error) this.imageUrl = null
        })
      }
    },
    imageLoaded () {
      this.imageClass = 'grow-y-leave-to'
      setTimeout(() => {
        this.imageClass = 'grow-y-leave-active'
      }, 100)
    }
  }
}
</script>
