<template>
    <section>
        <VisualizerConfiguration
                ref="configurator"
                @updateConfig="updateConfig">
        </VisualizerConfiguration>
        <b-loading :is-full-page="true" :active="(isLoading > 0)" :can-cancel="false"></b-loading>
        <Visualizer ref="visualizer"
                    v-bind:selected-visualization-method="visualizationMethod"
                    v-bind:data-package="dataPackage">
        </Visualizer>
    </section>
</template>

<script lang="ts">
import Vue from "vue";
import Visualizer, {VisualizationMethod} from "./Visualizer.vue";
import VisualizerConfiguration, {Config} from "./configuration/VisualizerConfiguration.vue";
import gql from "graphql-tag";

export default Vue.extend({
        data() {
            return {
                dayComparisonData: [],
                rideComparisonData: [],
                visualizationMethod: VisualizationMethod.DayComparisonTimeseries,
                isLoading: 0,
                configuration: null as unknown as Config
            }
        },
        methods: {
            updateConfig(config: Config) {
                this.configuration = config;
            },
        },
        computed: {
            dataPackage() {
                switch (this.visualizationMethod)
                {
                    case VisualizationMethod.DayComparisonTimeseries:
                        return this.dayComparisonData;
                    case VisualizationMethod.RideComparisonTimeseries:
                        return this.rideComparisonData
                    default:
                        return null
                }
            }
        },
        apollo: {
            dayComparisonData: {
                query: gql`query historicRideTimes ($rideId: RideId!, $start: DateTime!, $end: DateTime!, $interval: Interval!) {
                                    ride(id: $rideId) {
                                        name
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
                    this.visualizationMethod = VisualizationMethod.DayComparisonTimeseries;
                    return {
                        name: data.ride.name,
                        data: data.ride.layer1.historicalWaitTime
                    }
                },
                variables(): any {
                    return {
                        rideId: this.configuration.selectedRides[0].id,
                        start: this.configuration.startDate,
                        end: this.configuration.endDate,
                        interval: this.configuration.interval,
                    }
                },
                skip(): boolean {
                    return !this.configuration || this.configuration.selectedRides.length != 1;
                },
                loadingKey: 'isLoading'
            },
            rideComparisonData: {
                query: gql`query multiRide ($rideIds: [RideId]!, $start: DateTime!, $end: DateTime!, $interval: Interval!) {
                                someRides(ids: $rideIds) {
                                        name
                                        layer1 {
                                            historicalWaitTime(start: $start, end: $end, interval: $interval) {
                                                waitTimes {
                                                    wait
                                                    time
                                                }
                                            }
                                        }
                                    }
                            }`,
                update(data: any) {
                    this.visualizationMethod = VisualizationMethod.RideComparisonTimeseries;
                    return {
                        date: this.configuration.startDate,
                        data: data.someRides.map(data => {
                        return {
                            name: data.name,
                            waitTimes: data.layer1.historicalWaitTime[0].waitTimes
                        }})
                    }
                },
                variables(): any {
                    return {
                        rideIds: this.configuration.selectedRides.map(ride => ride.id),
                        start: this.configuration.startDate,
                        end: this.configuration.endDate,
                        interval: this.configuration.interval,
                    }
                },
                skip(): boolean {
                    return !this.configuration || this.configuration.selectedRides.length < 2;
                },
                loadingKey: 'isLoading'
            }
        },
        components: {VisualizerConfiguration, Visualizer}
    });
</script>

<style scoped>

</style>
