<template>
    <div class="tile is-ancestor">
        <div class="tile is-parent is-4">
            <ride-selector class="tile"
                           @parkSelected="(park) => { this.selectedPark = park; }"
                           @rideSelected="(ride) => { this.selectedRide = ride; }"></ride-selector>
        </div>
        <div class="tile is-parent is-vertical">
          <div class="tile is-child card">
            <header class="card-header">
              <p class="card-header-title">
                Date Range
              </p>
            </header>
            <div class="card-content">
              <b-field horizontal label="Select Date Range">
                <b-datepicker
                    range
                    v-model="dates">
                </b-datepicker>
              </b-field>
            </div>
          </div>
            <div class="tile is-child card">
                <header class="card-header">
                    <p class="card-header-title">
                        Comparison Method
                    </p>
                </header>
                <div class="card-content">
                    <b-field position="is-left"
                             v-for="period in comparisonPeriods"
                             :key="period.id">
                        <b-radio v-model="comparisonPeriod"
                                 :native-value="period.id">
                            {{ period.name }}
                        </b-radio>
                    </b-field>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ComparisonPeriod, getSupportedParks} from "../../data/API";
    import {Park} from "../../data/Park";
    import {Ride} from "../../data/Ride";
    import RideSelector from "./RideSelector.vue";

    interface Configuration {
        selectedPark: Park,
        selectedRide: Ride,
        startDate: string,
        endDate: string,
        comparisonMethod: ComparisonPeriod
    }

    export default Vue.extend({
        components: {RideSelector},
        data: function() {
            return {
                selectedPark: {} as Park,
                selectedRide: {} as Ride,
                dates: [],
                dateStart: null,
                dateEnd: null,
                comparisonPeriod: null,
                visualizationMethod: null,
                // selectableParks: [] as Array<Park>,
                // selectableRides: [] as Array<Ride>,
                comparisonPeriods: [
                    { id: ComparisonPeriod.DAY, name: "Compare against every day" },
                    { id: ComparisonPeriod.DAYOFWEEK, name: "Compare against the same day of every week selected" },
                    { id: ComparisonPeriod.MONTH, name: "Compare against the same day of every month selected" },
                    { id: ComparisonPeriod.DAYOFYEAR, name: "Compare against the same day of every year selected" }
                ],
                visualizationMethods: [
                    { id: 'timeseries', name: "Layered Timeseries" },
                    { id: 'boxplot', name: "Time Box-and-Wisker" }
                ]
            }
        },
        created(): void {
            // this.populateConfigurations();
        },
        methods: {
            //populateConfigurations() {
            //    getSupportedParks().then(
            //        (parks: Array<Park>) => {
            //            this.selectableParks = parks;
            //        }
            //    );
            //},
            isConfigurationValid(config: Configuration): boolean {
                if (config.startDate == null || typeof config.startDate === "undefined" || config.startDate === "") return false;
                if (config.endDate == null || typeof config.endDate === "undefined" || config.endDate === "") return false;
                if (config.comparisonMethod == null || typeof config.comparisonMethod === "undefined") return false;
                if (typeof config.selectedPark === "undefined" || config.selectedPark.id == null || config.selectedPark.id === "") return false;
                if (typeof config.selectedRide === "undefined" || config.selectedRide.id == null || config.selectedRide.id === "") return false;

                return true;
            },
            //updateSelectableRides() {
            //    this.selectedRide = {} as Ride;
            //    this.selectableRides = this.selectedPark.rides;
            //}
        },
        computed: {
            currentConfiguration(): Configuration {
                return {
                    selectedPark: this.selectedPark,
                    selectedRide: this.selectedRide,
                    startDate: this.dates[0],
                    endDate: this.dates[1],
                    comparisonMethod: this.comparisonPeriod
                };
            }
        },
        watch: {
            'currentConfiguration': {
                handler(value: Configuration) {
                    if (this.isConfigurationValid(value)) {
                        this.$emit('updateConfig', value);
                    }
                }
            }
        }
    });
</script>

<style scoped>

</style>
