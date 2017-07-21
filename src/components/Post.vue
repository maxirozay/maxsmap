<template>
  <div class="mdl-card mdl-shadow--2dp">
    <div class="mdl-card__supporting-text">
      <h2 class="mdl-card__title-text">{{post.title}}</h2>
      <p>{{post.details}}</p>
      <p>Comments</p>
      <template v-for="comment in comments">
        <p>{{ comment.msg }}</p>
      </template>
      <form action="#">
        <div class="mdl-textfield mdl-js-textfield">
          <textarea class="mdl-textfield__input"
            type="text"
            rows= "5"
            maxlength="200"
            v-model="newComment"></textarea>
          <label class="mdl-textfield__label" v-if="!newComment">Comment...</label>
        </div>
      </form>
    </div>
    <div class="mdl-card__actions mdl-card--border">
      <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect"
        @click="sendComment">
        {{commentButtonText}}
      </a>
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
  props: ['post'],
  data: function () {
    return {
      newComment: '',
      commentButtonText: 'send',
      comments: [{msg: 'aaa'}, {msg: 'lll'}]
    }
  },
  methods: {
    sendComment () {}
  }
}
</script>
