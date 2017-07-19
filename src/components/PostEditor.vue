<template>
  <div class="demo-card-wide mdl-card mdl-shadow--2dp">
    <div class="mdl-card__supporting-text">
      <h2 class="mdl-card__title-text">New Post</h2>
      <form action="#">
        <div class="mdl-textfield mdl-js-textfield">
          <input class="mdl-textfield__input"
            type="text"
            maxlength="40"
            id="title">
          <label class="mdl-textfield__label"
            for="title">Title</label>
        </div>
      </form>
      <form action="#">
        <div class="mdl-textfield mdl-js-textfield">
          <textarea class="mdl-textfield__input"
            type="text"
            rows= "14"
            maxlength="400"
            id="details"></textarea>
          <label class="mdl-textfield__label" for="details">Details...</label>
        </div>
      </form>
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
        Post
      </a>
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
        @click="cancel">
        Cancel
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'post-editor',
  methods: {
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
