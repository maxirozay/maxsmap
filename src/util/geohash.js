const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'

export default {
  encode (lat, lng, precision) {
    let minLat = -90
    let maxLat = 90
    let minLng = -180
    let maxLng = 180
    let result = 0
    let geohash = ''
    let bitValue = 16
    for (let i = 0; i < precision * 5; i++) {
      if (i % 2 === 0) {
        const midpoint = (minLng + maxLng) / 2
        if (lng < midpoint) {
          maxLng = midpoint
        } else {
          result += bitValue
          minLng = midpoint
        }
      } else {
        const midpoint = (minLat + maxLat) / 2
        if (lat < midpoint) {
          maxLat = midpoint
        } else {
          result += bitValue
          minLat = midpoint
        }
      }
      if (bitValue === 1) {
        geohash += base32.charAt(result)
        result = 0
        bitValue = 16
      } else {
        bitValue /= 2
      }
    }
    return geohash
  }
}
