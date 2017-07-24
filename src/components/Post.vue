<template>
  <div class="card">
    <div class="card-content mh-75 scrollable">
      <div class="media">
        <div class="media-content">
          <p class="title is-4">{{post.title}}</p>
          <p class="subtitle is-6"><small>{{ dateAgo(post.createdAt) }}</small></p>
        </div>
      </div>
      <div class="content">
        <p>{{post.details}}</p>
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
        </div>
        <textarea class="textarea"
          type="text"
          rows= "5"
          maxlength="200"
          v-model="newComment.text"
          placeholder="Your comment..."></textarea>
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
      comments: []
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
