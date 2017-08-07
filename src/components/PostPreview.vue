<template>
  <div class="card h-33 w-100 scrollable pb-2">
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
          <span v-if="!post.cypherKey || post.isVerified">
            {{ post.text }}
          </span>
          <span v-else>
            This post is private
          </span>
        </p>
      </div>
    </div>
    <footer class="card-footer sticky-footer inherit shadow-light">
      <a v-if="hasNext" class="card-footer-item" @click="$emit('previous')">
        <i class="material-icons icon-centered">chevron_left</i>
      </a>
      <a class="card-footer-item" @click="$emit('openPost')">
        <i class="material-icons">launch</i>
        Open
      </a>
      <a class="card-footer-item" @click="$emit('close')">
        <i class="material-icons">close</i>
        Close
      </a>
      <a v-if="hasNext" class="card-footer-item" @click="$emit('next')">
        <i class="material-icons icon-centered">chevron_right</i>
      </a>
    </footer>
  </div>
</template>

<script>
import date from '../util/date'

export default {
  name: 'post-preview',
  props: ['post', 'hasNext'],
  methods: {
    dateAgo (timestamp) {
      return date.dateAgo(timestamp)
    }
  }
}
</script>
