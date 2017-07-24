<template>
  <div class="card">
    <div class="card-content mh-75 scrollable">
      <div class="content">
        <p>
          <strong>{{ post.username }}</strong>
          <small>{{ dateAgo(post.createdAt) }}</small>
          <br>
          {{ post.text }}
        </p>
        <div v-for="comment in comments">
          <p>
            <strong>{{ comment.username }}</strong>
            <small>{{ dateAgo(comment.createdAt) }}</small>
            <br>
            {{ comment.text }}
          </p>
        </div>
      </div>
    </div>
    <div class="mh-25">
      <div class="card-content field pt-0">
        <div class="field">
          <input class="input"
            type="text"
            maxlength="40"
            v-model="newComment.username"
            placeholder="Username">
            <p class="help is-danger" v-show="usernameError">
              {{ usernameError }}
            </p>
        </div>
        <textarea class="textarea"
          type="text"
          rows= "5"
          maxlength="200"
          v-model="newComment.text"
          placeholder="Your comment..."></textarea>
          <p class="help is-danger" v-show="textError">
            {{ textError }}
          </p>
      </div>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item"
        @click="sendComment">
        {{commentButtonText}}
      </a>
      <a class="card-footer-item"
        @click="$emit('close')">
        Close
      </a>
      <a class="card-footer-item"
        @click="deletePost">
        {{ deleteButtonText }}
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'

export default {
  name: 'post',
  props: ['post'],
  data: function () {
    return {
      newComment: {username: '', text: ''},
      commentButtonText: 'Send',
      deleteButtonText: 'Delete',
      comments: [],
      usernameError: null,
      textError: null
    }
  },
  mounted () {
    this.getComments()
  },
  beforeDestroy () {
    database.removeCommentsListener()
  },
  methods: {
    getComments () {
      database
      .getComments(this.post.id,
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

      database
      .comment(this.post.id, this.newComment)
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
    }
  }
}
</script>
