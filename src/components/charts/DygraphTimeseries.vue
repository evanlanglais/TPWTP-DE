<template>
    <div class="tile is-ancestor">
        <div class="tile is-vertical">
            <div class="tile">
                <div class="tile is-parent">
                    <div class="tile is-child box">
                        <b-field label="Smoothing">
                            <b-slider v-model="smoothing" :min="1" :max="25" ticks>
                            </b-slider>
                        </b-field>
                    </div>
                </div>
                <div class="tile is-parent">
                    <div class="tile is-child box">
                        <b-button >Reset Zoom</b-button>
                    </div>
                </div>
            </div>
            <div class="tile">
                <div class="tile is-parent is-10">
                    <div class="tile is-child box">
                        <Dygraphs
                                v-bind:graphData="graphData"
                                v-bind:graphOptions="graphOptions"
                        >
                        </Dygraphs>
                    </div>
                </div>
                <div class="tile is-parent is-2">
                    <div class="tile is-child box">
                        <h3>Legend</h3>
                        <div ref="labelsDiv" id="labelsDiv" class="labelsDiv"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import { Dygraphs } from 'vue-dygraphs'
    import {DayOfData} from "../../data/DayOfData";
    import {DataPackage} from "../../data/DataPackage";
    import moment from "moment";

    export default Vue.extend({
        components: {Dygraphs},
        props: {
            tpwtpData: {
                type: Object as() => DataPackage
            }
        },
        data() {
            return {
                smoothing: 1,
                graphData: [[0]],
                dynamicLabels: ["Index"]
            }
        },
        computed: {
            graphOptions() {
                return {
                    labels: this.$data.dynamicLabels,
                    rollPeriod: this.$data.smoothing,

                    highlightCircleSize: 2,
                    strokeWidth: 2,
                    strokeBorderWidth: 1,
                    animatedZooms: true,

                    labelsDiv: 'labelsDiv',
                    labelsSeparateLines: true,

                    title: 'Ride Wait-times',
                    xlabel: 'Time Of Day',
                    ylabel: 'Wait Time (min)',

                    highlightSeriesOpts: {
                        strokeWidth: 3,
                        strokeBorderWidth: 1,
                        highlightCircleSize: 3
                    },

                    axes: {
                        x: {
                            axisLabelFormatter: function(time_offset: number) {
                                const base_moment = moment().startOf('day');
                                base_moment.add(time_offset * 5, 'm');
                                return base_moment.format("h:m A");
                                // return `${time_offset} t-off`;
                            }
                        },
                        y: {
                            axisLabelFormatter: function(minutes: number) {
                                return `${Math.trunc(minutes)} min`;
                            }
                        }
                    }
                }
            }
        },
        watch: {
            'tpwtpData': {
                handler(val: DataPackage) {
                    // 288 rows tall, each column for the number of days
                    const dataMatrix = Array.from(Array(288), _ => Array(val.data.length).fill(null));
                    let labelBuilder = ["Index"];

                    // Populate each datapoint for each day of data
                    let dayIndex = 0;
                    for (const dayOfData of val.data) {
                        labelBuilder.push(dayOfData.date.format('MMM Do'));
                        for (const datapoint of dayOfData.dps) {
                            dataMatrix[datapoint.t][dayIndex] = datapoint.y;
                        }
                        dayIndex++;
                    }

                    // Insert Index information in the first position of each row in the matrix
                    for (let i = 0; i < 288; i++) {
                        dataMatrix[i].unshift(i);
                    }

                    this.$data.dynamicLabels = labelBuilder;
                    this.$data.graphData = dataMatrix;
                }
            }
        }
    });
</script>

<style scoped>
    .labelsDiv > span.highlight { border: 1px solid grey; }

    .labelsDiv > span { display: none; }

    .labelsDiv > span.highlight { display: inline; }
</style>
