<template>
    <div id="app">
        <b-navbar fixed-top>
            <template slot="brand">
                <b-navbar-item>
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
        <section>
            <DataExplorer></DataExplorer>
        </section>
    </div>
</template>

<script>
    import DataExplorer from "./components/DataExplorer";

    export default {
        name: 'app',
        components: {
            DataExplorer
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
