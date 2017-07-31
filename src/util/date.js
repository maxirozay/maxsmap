export default {
  dateAgo (timestamp) {
    const minutesAgo = Math.floor((Date.now() - timestamp) / 60000)
    if (minutesAgo < 60) return minutesAgo + ' min'
    const hoursAgo = Math.floor(minutesAgo / 60)
    if (hoursAgo < 60) {
      return hoursAgo === 1 ? hoursAgo + ' hour' : hoursAgo + ' hours'
    }
    const daysAgo = Math.floor(hoursAgo / 24)
    return daysAgo === 1 ? daysAgo + ' day' : daysAgo + ' days'
  }
}
