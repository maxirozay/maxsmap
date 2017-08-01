<template>
  <div class="card h-100 w-max-sm scrollable pb-2">
    <div class="card-content">
      <div class="title is-4">
        <p>
          New Post
        </p>
        <p class="help">
          By uploading or posting content on this service you agree to make your
          content public and give the rights to use it to anybody. Any of your
          content can be deleted, seen, used at any time, for any reason, by anybody.
          You may also not be able to delete your content.
        </p>
      </div>
      <div class="field">
        <input
        class="input"
        type="text"
        maxlength="40"
        v-model="post.username"
        placeholder="Username">
        <p class="help is-danger" v-show="usernameError">
          {{ usernameError }}
        </p>
      </div>
      <div class="field">
        <textarea
        class="textarea"
        type="text"
        rows= "10"
        maxlength="400"
        v-model="post.text"
        placeholder="Write something that you want to share."></textarea>
        <p class="help is-danger" v-show="textError">
          {{ textError }}
        </p>
      </div>
      <div class="field">
        <label :class="uploadImageLabelClass" for="uploadImage">
          <i class="material-icons is-primary">image</i>
          Upload an image (optional)
        </label>
        <input
        id="uploadImage"
        type="file"
        name="image"
        @change="uploadImage"
        accept="image/*"
        class="absolute opacity-0"/>
        <p class="help is-danger" v-show="uploadImageError">
          {{ uploadImageError }}
        </p>
      </div>
      <img v-for="url in post.imagesUrls" :src="url"/>
      <div class="field">
        <label class="label">
          Enter a password that will allow you to delete your post.
        </label>
        <input
        class="input"
        type="password"
        maxlength="40"
        v-model="post.adminKey"
        placeholder="Password">
      </div>
      <div class="field">
        <input
        class="input"
        type="password"
        maxlength="40"
        v-model="adminKeyCheck"
        placeholder="Password verification">
        <p class="help is-danger" v-show="!adminKeyVerified">
          Your passwords doesn't match.
        </p>
      </div>
      <label class="checkbox">
        <input type="checkbox" v-model="post.isPrivate">
        Private post
      </label>
      <div v-if="post.isPrivate">
        <div class="field">
          <label class="label">
            Enter a password that will allow users to see and comment your post.
          </label>
          <input
          class="input"
          type="password"
          maxlength="40"
          v-model="post.cypherKey"
          placeholder="Password">
          <p class="help is-danger" v-show="!post.cypherKey">
            Please enter a password to make your post private.
          </p>
        </div>
        <div class="field">
          <input
          class="input"
          type="password"
          maxlength="40"
          v-model="cypherKeyCheck"
          placeholder="Password verification">
          <p class="help is-danger" v-show="!cypherKeyVerified">
            Your passwords doesn't match.
          </p>
        </div>
      </div>
      <p class="help">
        Your post will be encrypted with your passwords and only people with
        your password can see this post. Your username will not be encrypted
        to help people to find your post easily.
      </p>
    </div>
    <footer class="card-footer sticky-footer bg-white w-max-sm">
      <a class="card-footer-item" @click="sendPost">
      {{sendPostButtonText}}
      </a>
      <a class="card-footer-item" @click="close">
        Cancel
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'
import storage from '../storage'
import image from '../util/image'

export default {
  name: 'post-editor',
  props: ['position'],
  data () {
    return {
      post: {
        id: null,
        username: '',
        text: '',
        imagesUrls: [],
        adminKey: '',
        cypherKey: '',
        isPrivate: false
      },
      adminKeyCheck: '',
      cypherKeyCheck: '',
      sendPostButtonText: 'Post',
      usernameError: null,
      textError: null,
      uploadImageError: null,
      imageToDelete: 0,
      uploadImageLabelClass: 'is-fullwidth button'
    }
  },
  mounted () {
    this.post.username = database.getUsername() ? database.getUsername() : ''
    this.post.id = `${Number.MAX_SAFE_INTEGER - Date.now()}-${Math.round(this.position.lat)}-${Math.round(this.position.lng)}-${Math.round(Math.random() * 99)}`
  },
  beforeDestroy () {
    for (let i = 0; i < this.imageToDelete; i++) {
      storage.delete(`posts/${this.post.id}/${i}.jpg`)
    }
  },
  methods: {
    sendPost () {
      if (this.post.username.length < 3) {
        this.usernameError = 'Please write at least 3 characters.'
        return
      } else this.usernameError = null
      if (this.post.text.length < 20) {
        this.textError = 'Please write at least 20 characters.'
        return
      } else this.textError = ''
      if (!this.adminKeyVerified ||
        !this.cypherKeyVerified ||
        (this.post.isPrivate && !this.post.cypherKey)
      ) return
      database.setUsername(this.post.username)

      database
      .createPost(this.post, this.position)
      .then((value) => {
        this.imageToDelete = 0
        this.close()
      })
      .catch((error) => {
        if (error) this.sendPostButtonText = 'Retry'
      })
    },
    uploadImage (event) {
      image.resizeImage(event.target.files[0], 480, (blob) => {
        this.uploadImageLabelClass = 'is-fullwidth button is-loading'
        storage.uploadImage(blob, `posts/${this.post.id}/0.jpg`)
        .then((url) => {
          this.uploadImageLabelClass = 'is-fullwidth button'
          this.post.imagesUrls = [ url ]
          this.uploadImageError = null
          this.imageToDelete = 1
        })
        .catch((error) => {
          this.uploadImageLabelClass = 'is-fullwidth button'
          if (error) this.uploadImageError = `Your image couldn't be uploaded.`
        })
      })
    },
    close () {
      /* global history */
      /* eslint no-undef: "error" */
      history.back()
    }
  },
  computed: {
    adminKeyVerified () {
      return this.post.adminKey === this.adminKeyCheck
    },
    cypherKeyVerified () {
      return this.post.cypherKey === this.cypherKeyCheck
    }
  }
}
</script>
