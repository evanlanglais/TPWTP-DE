<template>
    <div class="tile is-ancestor">
        <div class="tile is-vertical">
            <div class="tile">
                <div class="tile is-parent is-10">
                    <div class="tile is-child box">
                        <b-field label="Smoothing">
                            <b-slider v-model="smoothing" :min="1" :max="25" ticks>
                            </b-slider>
                        </b-field>
                    </div>
                </div>
                <div class="tile is-parent is-2">
                    <div class="tile is-child box has-text-centered">
                        <b-button @click="resetZoom()">Reset Zoom</b-button>
                    </div>
                </div>
            </div>
            <div class="tile">
                <div class="tile is-parent is-9">
                    <div class="tile is-child card">
                        <header class="card-header">
                            <p class="card-header-title is-centered">
                                Ride Wait-Times
                            </p>
                        </header>
                        <div class="card-content">
                            <Dygraphs ref="dygraph"
                                      v-bind:graphData="graphData"
                                      v-bind:graphOptions="graphOptions">
                            </Dygraphs>
                        </div>
                    </div>
                </div>
                <div class="tile is-parent is-3">
                    <div class="tile is-child card">
                        <header class="card-header">
                            <p class="card-header-title is-centered">
                                Legend
                            </p>
                        </header>
                        <div class="card-content">
                            <div ref="labelsDiv" id="labelsDiv" class="labelsDiv has-text-centered"></div>
                        </div>
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
        methods: {
            resetZoom() {
                this.$refs.dygraph.$data._graph.updateOptions({
                    dateWindow: null,
                    valueRange: null
                });
            }
        },
        computed: {
            graphOptions: function () {
                const timeOffsetFormatter = function(time_offset: number) {
                    const base_moment = moment().startOf('day');
                    base_moment.add(time_offset * 5, 'm');
                    return base_moment.format("h:mm A");
                };

                const minuteFormatter = function(minutes: number) {
                    return `${Math.trunc(minutes)} min`;
                };

                return {
                    labels: this.$data.dynamicLabels,
                    rollPeriod: this.$data.smoothing,

                    highlightCircleSize: 2,
                    strokeWidth: 2,
                    strokeBorderWidth: 1,
                    animatedZooms: true,

                    hideOverlayOnMouseOut: false,

                    labelsDiv: 'labelsDiv',
                    labelsSeparateLines: true,
                    legend: 'always',

                    xlabel: 'Time Of Day',
                    ylabel: 'Wait Time',

                    highlightSeriesOpts: {
                        strokeWidth: 3,
                        strokeBorderWidth: 1,
                        highlightCircleSize: 3
                    },

                    axes: {
                        x: {
                            axisLabelFormatter: timeOffsetFormatter,
                            valueFormatter: timeOffsetFormatter
                        },
                        y: {
                            axisLabelFormatter: minuteFormatter,
                            valueFormatter: minuteFormatter
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

<style>
    .labelsDiv > span.highlight {
        padding: .2em .4em;
        border-radius: .25em;
        border: #2c3e50 1px solid;
        background-color: lavender;
    }
</style>
