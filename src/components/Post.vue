<template>
  <div class="mdl-card mdl-shadow--2dp">
    <div class="mdl-card__title">
      <h2 class="mdl-card__title-text">{{post.title}}</h2>
    </div>
    <div class="mdl-card__supporting-text">{{post.details}}</div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
        @click="$emit('close')">
        Close
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'post',
  props: ['post']
}
</script>
