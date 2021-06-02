<template>
  <div class="card">
    <b-loading :active.sync="$apollo.loading" :can-cancel="false"></b-loading>
    <header class="card-header">
      <p class="card-header-title">
        Current Times
      </p>
    </header>
    <div class="card-content">
    </div>
  </div>
</template>

<script>
export default {
  name: "CurrentTimes",
  apollo: {
    // Vue-Apollo options here
  },
  data() {
    return {
      park: {},
      rides: []
    }
  }
}
</script>

<style scoped>

</style>
