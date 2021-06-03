<template>
    <section>
        <!--
        <LineChart class="linechart"
                v-bind:chartData="graphData"
                :options="graphOptions">
        </LineChart>
        -->
        <DayComparisonTimeseries v-if="selectedVisualizationMethod === VisualizationMethod.DayComparisonTimeseries"
                                 v-bind:historicData="dataPackage">
        </DayComparisonTimeseries>
        <RideComparisonTimeseries v-if="selectedVisualizationMethod === VisualizationMethod.RideComparisonTimeseries"
                                  v-bind:historicData="dataPackage">
        </RideComparisonTimeseries>
    </section>
</template>

<script lang="ts">
    import Vue from "vue";
    import DayComparisonTimeseries from "./charts/DayComparisonTimeseries.vue";
    import RideComparisonTimeseries from "./charts/RideComparisonTimeseries.vue";

    export enum VisualizationMethod {
        DayComparisonTimeseries,
        RideComparisonTimeseries
    }

    export default Vue.extend({
        components: {DayComparisonTimeseries, RideComparisonTimeseries},
        props: {
            "dataPackage": Array,
            "selectedVisualizationMethod": VisualizationMethod
        },
        data() {
            return {
                VisualizationMethod = VisualizationMethod
            }
        },
        methods: {

        },
        computed: {

        }
    });
</script>

<style scoped>
.linechart {
    width: 800px;
}
</style>
