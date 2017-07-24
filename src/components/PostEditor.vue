<template>
  <div class="card mw-md">
    <div class="card-content">
      <p class="title is-4">New Post</p>
      <div class="field">
        <input class="input"
          type="text"
          maxlength="40"
          v-model="title"
          placeholder="Title">
      </div>
      <textarea class="textarea"
        type="text"
        rows= "14"
        maxlength="400"
        v-model="details"
        placeholder="Content"></textarea>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item"
        @click="post">
        {{postButtonText}}
      </a>
      <a class="card-footer-item"
        @click="$emit('cancel')">
        Cancel
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'

export default {
  name: 'post-editor',
  props: ['marker'],
  data: function () {
    return {
      title: '',
      details: '',
      postButtonText: 'Post'
    }
  },
  methods: {
    post () {
      database
      .createPost(this.title, this.details, this.marker.position)
      .then((value) => {
        this.$emit('cancel')
      })
      .catch((error) => {
        if (error) this.postButtonText = 'Retry'
      })
    }
  }
}
</script>
