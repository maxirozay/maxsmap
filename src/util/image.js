export default {
  resizeImage (file, width, callback) {
    /* global Image, URL */
    /* eslint no-undef: "error" */
    let img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = width
      canvas.height = width / img.width * img.height
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(blob => {
        callback(blob)
      }, 'image/jpeg', 0.7)
    }
    img.src = URL.createObjectURL(file)
  }
}
