<template>
    <section>
        <VisualizerConfiguration
                ref="configurator"
                @updateConfig="updateConfig">
        </VisualizerConfiguration>
        <b-loading :is-full-page="true" :active="(isLoading > 0)" :can-cancel="false"></b-loading>
        <Visualizer
                ref="visualizer"
                v-bind:historicData="historicData">
        </Visualizer>
    </section>
</template>

<script lang="ts">
    import Vue from "vue";
    import Visualizer from "./Visualizer.vue";
    import VisualizerConfiguration from "./configuration/VisualizerConfiguration.vue";
    import {Park} from "../data/Park";
    import {Ride} from "../data/Ride";
    import gql from "graphql-tag";

    export default Vue.extend({
        data() {
            return {
                historicData: [],
                isLoading: 0,
                historicConfig: null
            }
        },
        methods: {
            updateConfig(config: {startDate: string, endDate: string, interval: Interval, selectedPark: Park, selectedRides: Array<Ride>}) {
                this.historicConfig = config;
            },
        },
        apollo: {
            historicData: {
                query: gql`query historicRideTimes ($rideId: RideId!, $start: DateTime!, $end: DateTime!, $interval: Interval!) {
                                ride(id: $rideId) {
                                        layer1 {
                                            historicalWaitTime(start: $start, end: $end, interval: $interval) {
                                                date
                                                waitTimes {
                                                    wait
                                                    time
                                                }
                                            }
                                        }
                                    }
                            }`,
                update(data: any) {
                    // The returned value will update
                    // the vue property 'pingMessage'
                    return data.ride.layer1.historicalWaitTime
                },
                variables(): any {
                    // Use vue reactive properties here
                    return {
                        rideId: this.historicConfig.selectedRides[0].id,
                        start: this.historicConfig.startDate,
                        end: this.historicConfig.endDate,
                        interval: this.historicConfig.interval,
                    }
                },
                skip(): boolean {
                    return !this.historicConfig || this.historicConfig.selectedRides.length > 1;
                },
                loadingKey: 'isLoading'
            },
            dayData: {
                query: gql`query historicRideTimes ($rideId: RideId!, $start: DateTime!, $end: DateTime!, $interval: Interval!) {
                                ride(id: $rideId) {
                                        layer1 {
                                            historicalWaitTime(start: $start, end: $end, interval: $interval) {
                                                date
                                                waitTimes {
                                                    wait
                                                    time
                                                }
                                            }
                                        }
                                    }
                            }`,
                update(data: any) {
                    // The returned value will update
                    // the vue property 'pingMessage'
                    return data.ride.layer1.historicalWaitTime
                },
                variables(): any {
                    // Use vue reactive properties here
                    return {
                        rideId: this.historicConfig.selectedRides[0].id,
                        start: this.historicConfig.startDate,
                        end: this.historicConfig.endDate,
                        interval: this.historicConfig.interval,
                    }
                },
                skip(): boolean {
                    return !this.historicConfig || this.historicConfig.selectedRides.length > 1;
                },
                loadingKey: 'isLoading'
            }
        },
        components: {VisualizerConfiguration, Visualizer}
    });
</script>

<style scoped>

</style>
