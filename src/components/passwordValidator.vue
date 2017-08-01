<template>
  <div class="card">
    <div class="card-content">
      <div class="content">
        <div class="field">
          <label class="label">
            <slot></slot>
          </label>
          <input
          class="input"
          type="password"
          v-model="password"
          placeholder="Password">
          <p class="help is-danger" v-show="wrongPassword">
            Your passwords doesn't match, try something else.
          </p>
        </div>
      </div>
    </div>
    <footer class="card-footer">
      <a class="card-footer-item" @click="verify">
        {{ buttonText }}
      </a>
      <a class="card-footer-item" @click="$emit('close')">
        Close
      </a>
    </footer>
  </div>
</template>

<script>
import database from '../database'

export default {
  name: 'password-validator',
  props: ['encryptedPassword'],
  data () {
    return {
      buttonText: 'Verify',
      password: '',
      wrongPassword: false
    }
  },
  methods: {
    verify () {
      if (database.verifyPassword(this.encryptedPassword, this.password)) {
        this.$emit('verified', this.password)
      } else {
        this.wrongPassword = true
      }
    }
  }
}
</script>
