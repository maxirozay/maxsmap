<template>
  <div class="card h-33v w-100 scrollable pb-footer">
    <div class="card-content">
      <p class="is-size-5">
        Preview
      </p>
      <div class="content">
        <p class="break-word">
          <strong>
            {{ post.username }}
          </strong>
          <small>
            {{ dateAgo(post.createdAt) }}
          </small>
          <br>
          <span v-if="!post.cypherKey || post.isVerified">
            {{ post.text }}
          </span>
          <span v-else>
            This post is private
          </span>
        </p>
      </div>
    </div>
    <footer class="sticky-footer w-100 fade-top-light">
      <div class="card-footer light">
        <a class="card-footer-item" @click="previous">
          <i class="material-icons">arrow_back</i>
        </a>
        <a class="card-footer-item" @click="open">
          <i class="material-icons">launch</i>
          Open
        </a>
        <a class="card-footer-item" @click="close">
          <i class="material-icons">close</i>
          Close
        </a>
        <a class="card-footer-item" @click="next">
          <i class="material-icons">arrow_forward</i>
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
/* global ga */
/* eslint no-undef: "error" */
import date from '../util/date'

export default {
  name: 'post-preview',
  props: 'post',
  methods: {
    dateAgo (timestamp) {
      return date.dateAgo(timestamp)
    },
    close () {
      ga('send', 'event', 'post preview', 'close post')
      this.$emit('close')
    },
    open () {
      ga('send', 'event', 'post preview', 'open post')
      this.$emit('openPost')
    },
    previous () {
      ga('send', 'event', 'post preview', 'previous post')
      this.$emit('previous')
    },
    next () {
      ga('send', 'event', 'post preview', 'next post')
      this.$emit('next')
    }
  }
}
</script>
