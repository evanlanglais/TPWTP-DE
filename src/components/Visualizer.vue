<template>
    <section>
        <!--
        <LineChart class="linechart"
                v-bind:chartData="graphData"
                :options="graphOptions">
        </LineChart>
        -->
        <DygraphTimeseries v-bind:historicData="historicData">
        </DygraphTimeseries>
    </section>
</template>

<script lang="ts">
    import Vue from "vue";
    import DygraphTimeseries from "./charts/DygraphTimeseries.vue";

    export enum GraphType {
        DygraphTimeseries
    }

    export default Vue.extend({
        components: {DygraphTimeseries},
        props: ["historicData"],
        data() {
            return {
                graphType: GraphType.DygraphTimeseries
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
