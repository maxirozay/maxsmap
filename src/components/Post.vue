<template>
  <div class="card h-100 w-max-sm scrollable pb-2">
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
          <figure v-show="imageUrl" class="image">
            <img :src="imageUrl" alt="post image">
          </figure>
        </p>
        <label class="label">Comment</label>
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
    <footer class="card-footer sticky-footer bg-white w-max-sm">
      <a class="card-footer-item" @click="sendComment">
        {{commentButtonText}}
      </a>
      <a class="card-footer-item" @click="close">
        Close
      </a>
      <a class="card-footer-item" @click="showDeleteUi = true">
        Delete
      </a>
    </footer>
    <div v-if="showDeleteUi" class="modal is-active">
      <div class="modal-background" @click="closeDeleteUI"></div>
      <button class="modal-close is-large" @click="closeDeleteUI"></button>
      <div class="modal-content">
        <div class="card">
          <div class="card-content">
            <div class="content">
              <div class="field">
                <input
                class="input"
                type="password"
                maxlength="40"
                v-model="password"
                placeholder="Enter your password">
                <p class="help is-danger" v-show="wrongPassword">
                  Your passwords doesn't match, try something else.
                </p>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <a class="card-footer-item is-danger" @click="deletePost">
              {{ deleteButtonText }}
            </a>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'
import date from '../util/date'

export default {
  name: 'post',
  data () {
    return {
      post: { username: '', text: '' },
      newComment: { username: '', text: '' },
      commentButtonText: 'Send',
      deleteButtonText: 'Delete',
      comments: [],
      usernameError: null,
      textError: null,
      imageUrl: null,
      showDeleteUi: false,
      password: '',
      wrongPassword: false
    }
  },
  created () {
    this.newComment.username = database.getUsername() ? database.getUsername() : ''
  },
  beforeDestroy () {
    database.removeCommentsListener()
  },
  methods: {
    init (post) {
      this.post = post
      database.removeCommentsListener()
      this.comments = []
      this.imageUrl = null
      this.newComment.text = ''
      this.loadImages()
      this.getComments()
    },
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
      return date.dateAgo(timestamp)
    },
    deletePost () {
      database
      .deletePost(this.post, this.password)
      .then((value) => {
        this.closeDeleteUI()
        this.close()
      })
      .catch((error) => {
        if (
          error === 'wrong password' ||
          error.message === `ccm: tag doesn't match`
        ) {
          this.deleteButtonText = 'Delete'
          this.wrongPassword = true
        } else {
          this.wrongPassword = false
          this.deleteButtonText = 'Retry'
        }
      })
    },
    closeDeleteUI () {
      this.password = ''
      this.wrongPassword = false
      this.deleteButtonText = 'Delete'
      this.showDeleteUi = false
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
    close () {
      /* global history */
      /* eslint no-undef: "error" */
      history.back()
    }
  }
}
</script>
