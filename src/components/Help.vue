<template>
  <div class="modal is-active">
    <div @click="$emit('close')" class="modal-background"></div>
    <div class="box modal-content">
      <p class="title is-5">
        Help
      </p>
      <p class="title is-6">
        Map
      </p>
      <div class="media">
        <div class="media-left">
          <img src="../assets/post-icon.png" alt="Post Icon" width="32px">
        </div>
        <div class="media-content">
          <p>
            "X" icons are posts. You can click on it to open a post. If you want
            to see more posts for a specific location, you have to zoom on this
            location. The more you zoom the more you will see posts per area.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <img src="../assets/new-post-icon.png" alt="New Post Icon" width="64px">
        </div>
        <div class="media-content">
          <p>
            Click on the "NEW" icon to create a new post. Drag this icon on
            the map to change the location of the post.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">my_location</i>
        </div>
        <div class="media-content">
          <p>
            This button center the map on your location. Make sure your device
            location service is enable and you gave the permission to use your
            location.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">access_time</i>
          <i class="material-icons has-text-primary">chat_bubble_outline</i>
        </div>
        <div class="media-content">
          <p>
            Those buttons change the order of the posts that you will see.
            You can sort the posts by date or by their number of comments.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">add_circle_outline</i>
        </div>
        <div class="media-content">
          <p>
            This button create the "NEW" icon and center it on the map so you
            can create a new post.
          </p>
        </div>
      </div>
      <br>
      <p class="title is-6">
        Post
      </p>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">arrow_back</i>
        </div>
        <div class="media-content">
          <p>
            Go to the previous post.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">delete</i>
        </div>
        <div class="media-content">
          <p>
            Delete the post permanently. You need a password to delete a post.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">close</i>
        </div>
        <div class="media-content">
          <p>
            Close the post
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">my_location</i>
        </div>
        <div class="media-content">
          <p>
            Center the map on the post's location.
          </p>
        </div>
      </div>
      <div class="media">
        <div class="media-left">
          <i class="material-icons has-text-primary">arrow_forward</i>
        </div>
        <div class="media-content">
          <p>
            Go to the next post.
          </p>
        </div>
      </div>
    </div>
    <button @click="$emit('close')" class="modal-close is-large"></button>
  </div>
</template>
