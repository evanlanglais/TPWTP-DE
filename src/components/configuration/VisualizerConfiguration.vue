<template>
    <div class="tile is-ancestor">
        <div class="tile is-parent is-4">
            <ride-selector class="tile"
                           @parkSelected="(park) => { this.selectedPark = park; }"
                           @rideSelected="(ride) => { this.selectedRides = ride; }"></ride-selector>
        </div>
        <div class="tile is-parent is-vertical">
            <div class="tile is-child card">
                <header class="card-header">
                    <p class="card-header-title">
                        Historic Wait Times
                    </p>
                </header>
                <div class="card-content has-text-centered" v-if="!multipleRidesSelected">
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
                <div class="card-content has-text-centered" v-else>
                    <div class="columns">
                        <div class="column">
                            <b-field label="Operating Date" position="is-centered">
                                <b-datepicker class="is-center" v-model="dateStart" @change="(value) => { this.dateEnd = value; }" inline v-bind:max-date="dateToday">
                                </b-datepicker>
                            </b-field>
                        </div>
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

export type Config = {
    startDate: Date,
    endDate: Date,
    interval: string,
    selectedPark: Park,
    selectedRides: Array<Ride>
}

export default Vue.extend({
    components: {RideSelector},
    data: function() {
        return {
            selectedPark: {} as Park,
            selectedRides: [] as Array<Ride>,
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
        isConfigurationValid(config: Config): boolean {
            if (typeof config.startDate === "undefined") return false;
            if (typeof config.endDate === "undefined") return false;
            //if (config.comparisonMethod == null || typeof config.comparisonMethod === "undefined") return false;
            if (typeof config.selectedPark === "undefined" || config.selectedPark.id == null || config.selectedPark.id === "") return false;
            if (typeof config.selectedRides === "undefined" || config.selectedRides.length == 0) return false;

            return true;
        },

    },
    computed: {
        currentConfiguration(): Config {
            return {
                selectedPark: this.selectedPark,
                selectedRides: this.selectedRides,
                startDate: this.dateStart,
                endDate: this.dateEnd,
                interval: this.selectedInterval
            };
        },
        multipleRidesSelected() {
            return this.selectedRides.length > 1;
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
