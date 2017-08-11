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
          <figure v-show="post.imageUrl" class="image">
            <img :src="post.imageUrl" alt="post image">
          </figure>
        </p>
        <password-validator
        v-if="post.cypherKey && !post.isVerified"
        :encryptedPassword="post.cypherKey"
        @close="close"
        @verified="passwordVerified">
          <p>{{ passwordValidatorLabel }}</p>
        </password-validator>
        <div v-if="!post.cypherKey || post.isVerified">
          <div class="is-size-5 inherit">
            Comments
          </div>
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
            placeholder="Write a new comment."></textarea>
            <p class="help is-danger" v-show="textError">
              {{ textError }}
            </p>
          </div>
          <div class="field">
            <a @click="sendComment" class="button is-primary is-outlined is-pulled-right">
            <i v-if="commentSending" class="loading"></i>
              <span v-else class="icon">
                <i class="material-icons">chat_bubble_outline</i>
              </span>
              <span>
                Comment
              </span>
            </a>
          </div>
          <br><br>
          <p v-if="comments.length === 0" class="has-text-centered">
            There's no comment yet be the first one to comment!
          </p>
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
    </div>
    <footer :class="footerStyle">
      <div :class="footerBgStyle">
        <a class="card-footer-item" @click="$emit('previous')">
          <i class="material-icons">arrow_back</i>
        </a>
        <a
        v-if="!isDeleting"
        class="card-footer-item"
        @click="deletePost"
        title="Delete This Post">
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
        <a @click="$emit('locate')" class="card-footer-item" title="Locate Post">
          <i class="material-icons p-icon">my_location</i>
          Locate
        </a>
        <a class="card-footer-item" @click="$emit('next')">
          <i class="material-icons">arrow_forward</i>
        </a>
      </div>
    </footer>
    <transition name="slide-up">
      <password-validator
      v-if="showPasswordValidator"
      class="sticky-footer w-sm card card-content"
      :encryptedPassword="post.adminKey"
      @close="closePasswordValidator"
      @verified="passwordVerified">
        <p>{{ passwordValidatorLabel }}</p>
      </password-validator>
    </transition>
  </div>
</template>

<script>
/* global ga, history */
/* eslint no-undef: "error" */
import database from '../database'
import storage from '../storage'
import date from '../util/date'
import passwordValidator from './passwordValidator'

export default {
  name: 'post',
  components: { passwordValidator },
  data () {
    return {
      style: 'card h-100 w-sm scrollable pb-footer light',
      footerStyle: 'sticky-footer w-sm fade-top-light',
      footerBgStyle: 'card-footer light',
      post: { username: '', text: '' },
      newComment: { username: '', text: '' },
      commentButtonText: 'Send',
      deleteButtonText: 'Delete',
      comments: [],
      usernameError: null,
      textError: null,
      showPasswordValidator: false,
      passwordValidatorLabel: '',
      isDeleting: false,
      commentSending: false
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
      ga('send', 'event', 'post', 'open post', post.id)
      this.post = post
      database.removeCommentsListener()
      this.comments = []
      this.imageUrl = null
      this.newComment.text = ''
      if (this.post.cypherKey) {
        this.style = 'card h-100 w-sm scrollable pb-footer dark'
        this.footerStyle = 'sticky-footer w-sm fade-top-dark'
        this.footerBgStyle = 'card-footer dark'
      } else {
        this.style = 'card h-100 w-sm scrollable pb-footer light'
        this.footerStyle = 'sticky-footer w-sm fade-top-light'
        this.footerBgStyle = 'card-footer light'
      }
      if (this.post.cypherKey && !this.post.isVerified) {
        this.passwordValidatorLabel = 'This post is private, enter the password to see the content. '
      } else {
        this.getImageUrl()
        if (this.post.commentsCount) this.getComments()
      }
    },
    getComments () {
      database
      .getComments(this.post,
        (comment) => {
          if (this.comments.length === 0 || comment.id > this.comments[0].id) {
            this.comments.unshift(comment)
            if (this.comments.length === database.commentsLimit) {
              database.removeCommentsListener()
            }
          } else database.removeCommentsListener()
        })
    },
    sendComment () {
      ga('send', 'event', 'post', 'comment post', this.post.id)
      if (this.commentSending) return
      if (this.newComment.username.length < 3) {
        this.usernameError = 'Please write at least 3 characters.'
        return
      } else this.usernameError = null
      if (this.newComment.text.length < 3) {
        this.textError = 'Please write at least 3 characters.'
        return
      } else this.textError = ''
      database.setUsername(this.newComment.username)
      this.commentSending = true
      database
      .comment(this.post, this.newComment)
      .then(value => {
        this.commentSending = false
        this.newComment.text = ''
        this.commentButtonText = 'Send'
        this.getComments()
      })
      .catch(error => {
        this.commentSending = false
        if (error) this.commentButtonText = 'Retry'
      })
    },
    dateAgo (timestamp) {
      return date.dateAgo(timestamp)
    },
    deletePost () {
      if (!this.post.isAdmin) {
        ga('send', 'event', 'post', 'try to delete post', this.post.id)
        this.passwordValidatorLabel = 'Verify the password to be able to delete this post.'
        this.showPasswordValidator = true
        return
      }
      ga('send', 'event', 'post', 'delete post', this.post.id)
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
    getImageUrl () {
      if (this.post.imagesCount) {
        this.post.imageUrl = storage.getUrl(this.post.id)
      }
    },
    closePasswordValidator () {
      ga('send', 'event', 'post', 'close admin verification', this.post.id)
      this.showPasswordValidator = false
    },
    passwordVerified (password) {
      this.showPasswordValidator = false
      if (this.post.cypherKey && !this.post.isVerified) {
        ga('send', 'event', 'post', 'post verified', this.post.id)
        this.post.cypherKey = password
        this.post.isVerified = true
        this.post.text = database.decrypt(
          this.post.cypherKey,
          this.post.text
        )
        this.getImageUrl()
        this.getComments()
      } else {
        ga('send', 'event', 'post', 'admin verified', this.post.id)
        this.post.isAdmin = true
      }
    },
    close () {
      ga('send', 'event', 'post', 'close post', this.post.id)
      history.back()
    },
    previous () {
      ga('send', 'event', 'post', 'previous post', this.post.id)
      this.$emit('previous')
    },
    next () {
      ga('send', 'event', 'post', 'next post', this.post.id)
      this.$emit('next')
    }
  }
}
</script>
