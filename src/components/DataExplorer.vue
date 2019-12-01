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

<script>
    import Visualizer from "./Visualizer";
    import VisualizerConfiguration from "./VisualizerConfiguration";
    export default {
        name: "DataExplorer",
        data: function() {
            return {
                visualizerConfig: {}
            }
        },
        methods: {
            drawGraph(config) {
                this.visualizerConfig = config;
                this.$refs.visualizer.drawGraph();
            }
        },
        components: {VisualizerConfiguration, Visualizer}
    }
</script>

<style scoped>

</style>
