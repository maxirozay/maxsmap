<template>
  <div>
    <div class="field">
      <label class="label inherit">
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
    <div class="field is-grouped is-pulled-right">
      <p class="control">
        <a class="button is-primary is-outlined" @click="$emit('close')">
          <i class="material-icons">close</i>
          Close
        </a>
      </p>
      <p class="control">
        <a class="button is-primary is-outlined" @click="verify">
          <i class="material-icons">lock_open</i>
          {{ buttonText }}
        </a>
      </p>
    </div>
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
