<template>
  <div :class="style">
    <div class="card-content">
      <div class="content">
        <p class="break-word">
          <strong class="inherit">
            {{ post.username }}
          </strong>
          <small>
            {{ dateAgo(post.createdAt) }}
          </small>
          <br>
          <span v-if="!post.cypherKey || post.isVerified">
            {{ post.text }}
          </span>
          <figure v-show="imageUrl" class="image">
            <img :src="imageUrl" alt="post image">
          </figure>
        </p>
        <password-validator
        v-if="post.cypherKey && !post.isVerified"
        :encryptedPassword="post.cypherKey"
        @close="closePasswordValidator"
        @verified="passwordVerified">
          <p>{{ passwordValidatorLabel }}</p>
        </password-validator>
        <div v-if="!post.cypherKey || post.isVerified" class="pb-1">
          <label class="label inherit">Comment</label>
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
            placeholder="Your comment..."
            @keyup.enter="sendComment"></textarea>
            <p class="help is-danger" v-show="textError">
              {{ textError }}
            </p>
          </div>
        </div>
        <div v-for="comment in comments">
          <p class="break-word">
            <strong class="inherit">
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
    <footer :class="footerBgStyle">
      <a v-if="hasNext" class="card-footer-item" @click="$emit('previous')">
        <i class="material-icons">arrow_back</i>
      </a>
      <a v-if="!isDeleting" class="card-footer-item" @click="deletePost">
        <i class="material-icons">delete</i>
        Delete
      </a>
      <a v-else class="card-footer-item">
        <i class="loading"></i>
      </a>
      <a class="card-footer-item" @click="close">
        <i class="material-icons">close</i>
        Close
      </a>
      <a v-if="hasNext" class="card-footer-item" @click="$emit('next')">
        <i class="material-icons">arrow_forward</i>
      </a>
    </footer>
    <transition name="slide-up">
      <password-validator
      v-if="showPasswordValidator"
      class="sticky-footer w-max-sm card card-content"
      :encryptedPassword="post.adminKey"
      @close="closePasswordValidator"
      @verified="passwordVerified">
        <p>{{ passwordValidatorLabel }}</p>
      </password-validator>
    </transition>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'
import date from '../util/date'
import passwordValidator from './passwordValidator'

export default {
  name: 'post',
  components: { passwordValidator },
  props: [
    'hasNext'
  ],
  data () {
    return {
      style: 'card h-100 w-max-sm scrollable pb-2 light',
      footerBgStyle: 'card-footer sticky-footer w-max-sm inherit shadow-light',
      post: { username: '', text: '' },
      newComment: { username: '', text: '' },
      commentButtonText: 'Send',
      deleteButtonText: 'Delete',
      comments: [],
      usernameError: null,
      textError: null,
      imageUrl: null,
      showPasswordValidator: false,
      passwordValidatorLabel: '',
      isDeleting: false
    }
  },
  created () {
    this.newComment.username = database.getUsername() ? database.getUsername() : ''
  },
  beforeDestroy () {
    database.removeCommentsListener()
  },
  computed: {
  },
  methods: {
    init (post) {
      this.post = post
      database.removeCommentsListener()
      this.comments = []
      this.imageUrl = null
      this.newComment.text = ''
      if (this.post.cypherKey) {
        this.style = 'card h-100 w-max-sm scrollable pb-2 dark'
        this.footerBgStyle = 'card-footer sticky-footer w-max-sm inherit shadow-dark'
      } else {
        this.style = 'card h-100 w-max-sm scrollable pb-2 light'
        this.footerBgStyle = 'card-footer sticky-footer w-max-sm inherit shadow-light'
      }
      if (this.post.cypherKey && !this.post.isVerified) {
        this.passwordValidatorLabel = 'This post is private, enter the password to see the content. '
      } else {
        this.loadImages()
        this.getComments()
      }
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
      .then(value => {
        this.newComment.text = ''
        this.commentButtonText = 'Send'
      })
      .catch(error => {
        if (error) this.commentButtonText = 'Retry'
      })
    },
    dateAgo (timestamp) {
      return date.dateAgo(timestamp)
    },
    deletePost () {
      if (!this.post.isAdmin) {
        this.passwordValidatorLabel = 'Verify the password to be able to delete this post.'
        this.showPasswordValidator = true
        return
      }
      this.isDeleting = true
      database
      .deletePost(this.post)
      .then(value => {
        this.isDeleting = false
        this.close()
      })
      .catch(error => {
        this.isDeleting = false
        if (error) this.deleteButtonText = 'Retry'
      })
    },
    loadImages () {
      if (this.post.imagesCount) {
        storage.getUrl(`posts/${this.post.id}/0.jpg`)
        .then(url => {
          this.imageUrl = url
        })
        .catch(error => {
          if (error) this.imageUrl = null
        })
      }
    },
    closePasswordValidator () {
      if (this.post.cypherKey) this.close()
      else this.showPasswordValidator = false
    },
    passwordVerified (password) {
      this.showPasswordValidator = false
      if (this.post.cypherKey && !this.post.isVerified) {
        this.post.cypherKey = password
        this.post.isVerified = true
        this.post.text = database.decrypt(
          this.post.cypherKey,
          this.post.text
        )
        this.loadImages()
        this.getComments()
      } else this.post.isAdmin = true
    },
    close () {
      /* global history */
      /* eslint no-undef: "error" */
      history.back()
    }
  }
}
</script>
