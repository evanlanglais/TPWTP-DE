<template>
    <section>
        <!--
        <LineChart class="linechart"
                v-bind:chartData="graphData"
                :options="graphOptions">
        </LineChart>
        -->
        <DygraphTimeseries v-bind:tpwtp-data="tpwtpData">
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
        props: ["tpwtpData"],
        data() {
            return {
                graphType: GraphType.DygraphTimeseries
            }
        },
        methods: {

        },
        computed: {
            /*
            graphData(): object {
                let datasets: Array<object> = [];
                for (const day of this.visualizedData) {
                    const test = day.dps.filter((datapoint: Datapoint) => datapoint.t > 84).map(this.datapointMoment);
                    //console.log(test);
                    let dataset = {
                        label: day.date.format('LL'),
                        fill: false,
                        backgroundColor: "#007BA7",
                        borderColor: "#007BA7",
                        borderWidth: 1,
                        lineTension: 0,
                        showLine: false,
                        data: test
                    };
                    datasets.push(dataset);
                }
                return {
                    datasets: datasets
                }
            },

            graphOptions(): object {
                return {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Data Line Chart'
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            type: 'time',
                            time: {
                                minUnit: 'minute'
                            },
                            distribution: 'linear',
                            ticks: {
                                source: 'auto'
                            }
                        }],
                        yAxes: [{
                            display: true
                        }]
                    }
                }
            }
            */
        }
    });
</script>

<style scoped>
.linechart {
    width: 800px;
}
</style>
