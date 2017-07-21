<template>
  <div class="card mw-md">
    <div class="card-content mh-75 scrollable">
      <h2 class="title is-4">{{post.title}}</h2>
      <div class="content">
        <p>{{post.details}}</p>
        <p class="title is-6">Comments</p>
        <p v-for="comment in comments">- {{ comment.msg }}</p>
      </div>
    </div>
    <div class="mh-25">
      <div class="card-content field pt-0">
        <textarea class="textarea"
          type="text"
          rows= "5"
          maxlength="200"
          v-model="newComment"
          placeholder="Your comment..."></textarea>
      </div>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item"
        @click="sendComment">
        {{commentButtonText}}
      </a>
      <a class="card-footer-item"
        @click="$emit('close')">
        Close
      </a>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'post',
  props: ['post'],
  data: function () {
    return {
      newComment: '',
      commentButtonText: 'Send',
      comments: [{msg: 'aaa'}, {msg: 'lll'}]
    }
  },
  methods: {
    sendComment () {}
  }
}
</script>
