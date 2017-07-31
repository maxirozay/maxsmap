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
          {{ post.text }}
        </p>
      </div>
    </div>
    <footer class="card-footer sticky-footer bg-white">
      <a class="card-footer-item" @click="$emit('openPost')">
        Open
      </a>
      <a class="card-footer-item" @click="$emit('close')">
        Close
      </a>
    </footer>
  </div>
</template>

<script>
import date from '../util/date'

export default {
  name: 'post-preview',
  props: ['post'],
  methods: {
    dateAgo (timestamp) {
      return date.dateAgo(timestamp)
    }
  }
}
</script>
