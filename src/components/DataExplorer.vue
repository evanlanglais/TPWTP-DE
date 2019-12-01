<template>
    <div>
        <VisualizerConfiguration
                ref="configurator"
                @drawGraph="drawGraph">
        </VisualizerConfiguration>
        <Visualizer
                ref="visualizer"
                v-bind:config="visualizerConfig">
        </Visualizer>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Visualizer from "./Visualizer.vue";
    import VisualizerConfiguration from "./VisualizerConfiguration.vue";

    export default Vue.extend({
        // name: "DataExplorer",
        data() {
            return {
                visualizerConfig: {}
            }
        },
        methods: {
            drawGraph(config) {
                this.visualizerConfig = config;
                this.$refs.visualizer.drawGraph(config);
            }
        },
        components: {VisualizerConfiguration, Visualizer}
    });
</script>

<style scoped>

</style>
