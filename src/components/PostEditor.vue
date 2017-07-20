<template>
  <div class="demo-card-wide mdl-card mdl-shadow--2dp">
    <div class="mdl-card__supporting-text">
      <h2 class="mdl-card__title-text">New Post</h2>
      <form action="#">
        <div class="mdl-textfield mdl-js-textfield">
          <input class="mdl-textfield__input"
            type="text"
            maxlength="40"
            v-model="title">
          <label class="mdl-textfield__label"
            v-if="!title">Title</label>
        </div>
      </form>
      <form action="#">
        <div class="mdl-textfield mdl-js-textfield">
          <textarea class="mdl-textfield__input"
            type="text"
            rows= "14"
            maxlength="400"
            v-model="details"></textarea>
          <label class="mdl-textfield__label" v-if="!details">Details...</label>
        </div>
      </form>
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
        @click="post">
        {{postButtonText}}
      </a>
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
        @click="cancel">
        Cancel
      </a>
    </div>
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
      postButtonText: 'post'
    }
  },
  methods: {
    cancel () {
      this.$emit('cancel')
    },
    post () {
      database
          .createPost(this.title, this.details, this.marker.position)
          .then((value) => {
            this.$emit('cancel')
          })
          .catch((error) => {
            if (error) this.postButtonText = 'retry'
          })
    }
  }
}
</script>
