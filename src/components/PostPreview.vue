<template>
  <div class="card h-50v w-100 scrollable pb-footer">
    <div class="card-content">
      <div class="content">
        <div class="break-word">
          <strong>
            {{ post.username }}
          </strong>
          <small>
            {{ dateAgo(post.createdAt) }}
          </small>
          <br>
          <p v-if="!post.cypherKey || post.isVerified">
            {{ post.text }}
          </p>
          <span v-else>
            <i class="material-icons">lock_outline</i>
          </span>
          <img
            v-if="(!post.cypherKey || post.isVerified) && getImageUrl"
            :src="getImageUrl"
            alt="post image"
          >
        </div>
      </div>
    </div>
    <footer class="sticky-footer w-100 fade-top-light">
      <div class="card-footer light">
        <a class="card-footer-item" @click="previous">
          <i class="material-icons">arrow_back</i>
        </a>
        <a class="card-footer-item" @click="open">
          <i class="material-icons p-icon">chat_bubble_outline</i>
          Comments
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
import storage from '../storage'

export default {
  name: 'post-preview',
  props: ['post'],
  data () {
    return {
      imageUrl: null
    }
  },
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
  },
  computed: {
    getImageUrl () {
      if (this.post.imagesCount) {
        return storage.getUrl(this.post.id)
      }
      return null
    }
  }
}
</script>
