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
                                Ride Wait Times for {{ dayString }}
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
    import moment from "moment";
    import {DateTime} from "luxon";

    export default Vue.extend({
        components: {Dygraphs},
        props: {
            historicData: {}
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
            dayString(): string {
                return DateTime.fromJSDate(this.historicData.date).setZone(this.historicData.timezone).toLocaleString({ weekday: 'short', month: 'long', day: '2-digit' });
            },
            graphOptions: function () {
                const timeOffsetFormatter = function(time_offset: number) {
                    const base_moment = DateTime.fromJSDate(this.historicData.date).setZone(this.historicData.timezone).startOf('day');
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
                            valueFormatter: minuteFormatter,
                            includeZero: true
                        }
                    }
                }
            }
        },
        watch: {
            'historicData': {
                immediate: true,
                handler(dataPackage: {date: Date, data: Array<any>}) {
                    const data = dataPackage.data;
                    const dataMatrix = Array.from(Array(288), _ => Array(data.length).fill(null));
                    let labelBuilder = ["Index"];

                    // Populate each datapoint for each day of data
                    let rideIndex = 0;
                    for (let rideData of data) {
                        labelBuilder.push(rideData.name);
                        let timeIndex = 0;
                        for (let datapoint of rideData.waitTimes) {
                            dataMatrix[timeIndex][rideIndex] = datapoint.wait;
                            timeIndex++;
                        }
                        rideIndex++;
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
