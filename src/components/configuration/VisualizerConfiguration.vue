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
                Historic Wait Times
              </p>
            </header>
            <div class="card-content has-text-centered">
                <div class="columns">
                    <div class="column">
                        <b-field label="Start Date" position="is-centered">
                            <b-datepicker class="is-center" v-model="dateStart" inline v-bind:max-date="dateToday">
                            </b-datepicker>
                        </b-field>
                    </div>
                    <div class="column">
                        <b-field label="End Date" position="is-centered">
                            <b-datepicker v-model="dateEnd" inline v-bind:min-date="dateStart" v-bind:max-date="dateToday">
                            </b-datepicker>
                        </b-field>
                    </div>
                </div>
                <div>
                    <p class="label">
                        Interval
                    </p>
                    <b-field position="is-centered">
                        <b-radio-button v-for="interval in intervals"
                                        v-model="selectedInterval"
                                        :key="interval.id"
                                        :native-value="interval.id">
                            <span>{{ interval.name }}</span>
                        </b-radio-button>
                    </b-field>
                </div>
            </div>
          </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Park} from "../../data/Park";
    import {Ride} from "../../data/Ride";
    import RideSelector from "./RideSelector.vue";

    export default Vue.extend({
        components: {RideSelector},
        data: function() {
            return {
                selectedPark: {} as Park,
                selectedRide: {} as Ride,
                dates: [],
                dateStart: new Date(),
                dateEnd: new Date(),
                dateToday: new Date(),
                selectedInterval: 'DAY',
                visualizationMethod: null,
                intervals: [
                    { id: 'DAY', name: "Daily" },
                    { id: 'WEEK', name: "Weekly" },
                    { id: 'MONTH', name: "Monthly" },
                    { id: 'YEAR', name: "Yearly" },
                ],
                visualizationMethods: [
                    { id: 'timeseries', name: "Layered Timeseries" },
                    { id: 'boxplot', name: "Time Box-and-Wisker" }
                ]
            }
        },
        created(): void {

        },
        methods: {
            isConfigurationValid(config): boolean {
                if (config.startDate == null || typeof config.startDate === "undefined" || config.startDate === "") return false;
                if (config.endDate == null || typeof config.endDate === "undefined" || config.endDate === "") return false;
                //if (config.comparisonMethod == null || typeof config.comparisonMethod === "undefined") return false;
                if (typeof config.selectedPark === "undefined" || config.selectedPark.id == null || config.selectedPark.id === "") return false;
                if (typeof config.selectedRide === "undefined" || config.selectedRide.id == null || config.selectedRide.id === "") return false;

                return true;
            },

        },
        computed: {
            currentConfiguration() {
                return {
                    selectedPark: this.selectedPark,
                    selectedRide: this.selectedRide,
                    startDate: this.dateStart,
                    endDate: this.dateEnd,
                    interval: this.selectedInterval
                };
            }
        },
        watch: {
            'currentConfiguration': {
                handler(value) {
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
