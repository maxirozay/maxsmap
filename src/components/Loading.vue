<template>
  <svg class="rotation" :width="size" :height="size">
    <circle
    class="cicrle"
    :cx="size / 2"
    :cy="size / 2"
    :r="size / 2 - strokeWidth"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    fill="none" />
  </svg>
</template>

<script>
export default {
  name: 'loading',
  props: {
    size: {
      type: Number,
      default: 100
    },
    strokeWidth: {
      type: Number,
      default: 6
    },
    color: {
      type: String,
      default: '#ff7141'
    }
  }
}
</script>

<style lang="sass">
$dash: 260

@keyframes rotate
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

.rotation
  animation: rotate 2s linear infinite

.cicrle
  stroke-dasharray: $dash
  animation: length 2s ease-in-out infinite

@keyframes length
  0%
    stroke-dashoffset: $dash
  100%
    stroke-dashoffset: -$dash
</style>
