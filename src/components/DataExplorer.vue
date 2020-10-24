<template>
    <section>
        <VisualizerConfiguration
                ref="configurator"
                @updateConfig="updateConfig">
        </VisualizerConfiguration>
        <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="false"></b-loading>
        <Visualizer
                ref="visualizer"
                v-bind:tpwtp-data="tpwtpData">
        </Visualizer>
    </section>
</template>

<script lang="ts">
    import Vue from "vue";
    import Visualizer from "./Visualizer.vue";
    import VisualizerConfiguration from "./configuration/VisualizerConfiguration.vue";
    import moment, {Moment} from "moment";
    import {ComparisonPeriod, getComparisonDatapoints, getSequentialDatapoints} from "../data/API";
    import {DataPackage} from "../data/DataPackage";
    import {Park} from "../data/Park";
    import {Ride} from "../data/Ride";

    export default Vue.extend({
        data() {
            return {
                tpwtpData: {} as DataPackage,
                isLoading: false
            }
        },
        methods: {
            updateConfig(config: {startDate: string, endDate: string, comparisonMethod: ComparisonPeriod, selectedPark: Park, selectedRide: Ride}) {
                this.isLoading = true;
                const startDate: Moment = moment(config.startDate);
                const endDate: Moment = moment(config.endDate);
                const comparisonPeriod: ComparisonPeriod = config.comparisonMethod;

                if (comparisonPeriod == ComparisonPeriod.DAY) {
                    getSequentialDatapoints(config.selectedPark, config.selectedRide, startDate, endDate)
                        .then((result: DataPackage) => {
                            this.tpwtpData = result;
                        })
                        .finally(() => {this.isLoading = false});
                } else {
                    getComparisonDatapoints(config.selectedPark, config.selectedRide, endDate, startDate, comparisonPeriod)
                        .then((result: DataPackage) => {
                            this.tpwtpData = result;
                        })
                        .finally(() => {this.isLoading = false});
                }
            },
        },
        components: {VisualizerConfiguration, Visualizer}
    });
</script>

<style scoped>

</style>
