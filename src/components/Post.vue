<template>
  <div class="card mw-md">
    <div class="card-content mh-75 scrollable">
      <h2 class="title is-4">{{post.title}}</h2>
      <div class="content">
        <p>{{post.details}}</p>
        <p class="title is-6" v-show="comments.length > 0">Comments</p>
        <div class="content" v-for="comment in comments">
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
      comments: []
    }
  },
  mounted () {
    this.getComments()
  },
  methods: {
    getComments () {
      database.getComments(this.post.id,
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
    }
  }
}
</script>
