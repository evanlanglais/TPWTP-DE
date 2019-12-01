<template>
    <div>
        test graph
        <div class="tile is-child">
            <p>Selected park is {{ config.selectedPark }}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Visualizer",
        props: ["config"],
        methods: {
            drawGraph() {
                const localConfig = this.$props.config;
                const daysToGraph = getSequentialDatapoints(localConfig.selectedPark, localConfig.selectedRide, localConfig.);
                console.log("REDRAWIING!");
            }
        }
    }
</script>

<style scoped>

</style>
