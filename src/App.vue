<template>
    <div id="app">
        <b-navbar fixed-top="true">
            <template slot="brand">
                <b-navbar-item tag="router-link" :to="{ path: '/' }">
                    <img
                            src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
                            alt="Theme Park Wait Time Predictor"
                    >
                </b-navbar-item>
            </template>

            <template slot="start">
                <b-navbar-item href="#">
                    Home
                </b-navbar-item>
            </template>

            <template slot="end">
            </template>
        </b-navbar>
    </div>
</template>

<script>
    // import HelloWorld from './components/HelloWorld.vue'

    export default {
        name: 'app',
        components: {
            // HelloWorld
        }
    }
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
