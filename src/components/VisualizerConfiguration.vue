<template>
    <div class="tile is-ancestor">
        <div class="tile is-parent">
            <div class="tile is-child box">
                <b-field label="Park">
                    <b-select placeholder="Select a park" v-model="selectedPark" @input="updateSelectableRides()" ref="parkSelector" expanded>
                        <option
                                v-for="park in selectableParks"
                                :value="park"
                                :key="park.id">
                            {{ park.name }}
                        </option>
                    </b-select>
                </b-field>
                <b-field label="Ride">
                    <b-select placeholder="Select a ride" v-model="selectedRide" ref="rideSelector" expanded>
                        <option
                                v-for="ride in selectableRides"
                                :value="ride"
                                :key="ride.id">
                            {{ ride.name }}
                        </option>
                    </b-select>
                </b-field>
            </div>
        </div>
        <div class="tile is-parent">
            <div class="tile is-child box">
                <b-field label="Start Date">
                    <b-datepicker
                            placeholder="Click to select..."
                            icon="calendar-today"
                            v-model="dateStart">
                    </b-datepicker>
                </b-field>
                <b-field label="End Date">
                    <b-datepicker
                            placeholder="Click to select..."
                            icon="calendar-today"
                            v-model="dateEnd">
                    </b-datepicker>
                </b-field>
            </div>
        </div>
        <div class="tile is-parent">
            <div class="tile is-child box">
                <b-field label="Comparison Period">
                    <b-select placeholder="Select a comparison period" v-model="comparisonPeriod" expanded>
                        <option
                                v-for="period in comparisonPeriods"
                                :value="period.id"
                                :key="period.id">
                            {{ period.name }}
                        </option>
                    </b-select>
                </b-field>
                <b-field label="Visualization Method">
                    <b-select placeholder="Select a visualization method" v-model="visualizationMethod" expanded>
                        <option
                                v-for="visualizer in visualizationMethods"
                                :value="visualizer.id"
                                :key="visualizer.id">
                            {{ visualizer.name }}
                        </option>
                    </b-select>
                </b-field>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {ComparisonPeriod, getSupportedParks} from "../data/API";
    import {Park} from "../data/Park";
    import {Ride} from "../data/Ride";

    interface Configuration {
        selectedPark: Park,
        selectedRide: Ride,
        startDate: string,
        endDate: string,
        comparisonMethod: ComparisonPeriod
    }

    export default Vue.extend({
        data: function() {
            return {
                selectedPark: {} as Park,
                selectedRide: {} as Ride,
                dateStart: null,
                dateEnd: null,
                comparisonPeriod: null,
                visualizationMethod: null,
                selectableParks: [] as Array<Park>,
                selectableRides: [] as Array<Ride>,
                comparisonPeriods: [
                    { id: ComparisonPeriod.DAY, name: "Compare sequentially with every day" },
                    { id: ComparisonPeriod.DAYOFWEEK, name: "Compare with the same day every week" },
                    { id: ComparisonPeriod.MONTH, name: "Compare with the same day every month" },
                    { id: ComparisonPeriod.DAYOFYEAR, name: "Compare with the Same day every year" }
                ],
                visualizationMethods: [
                    { id: 'timeseries', name: "Layered Timeseries" },
                    { id: 'boxplot', name: "Time Box-and-Wisker" }
                ]
            }
        },
        created(): void {
            this.populateConfigurations();
        },
        methods: {
            populateConfigurations() {
                getSupportedParks().then(
                    (parks: Array<Park>) => {
                        this.selectableParks = parks;
                    }
                );
            },
            isConfigurationValid(config: Configuration): boolean {
                if (config.startDate == null || typeof config.startDate === "undefined" || config.startDate === "") return false;
                if (config.endDate == null || typeof config.endDate === "undefined" || config.endDate === "") return false;
                if (config.comparisonMethod == null || typeof config.comparisonMethod === "undefined") return false;
                if (typeof config.selectedPark === "undefined" || config.selectedPark.id == null || config.selectedPark.id === "") return false;
                if (typeof config.selectedRide === "undefined" || config.selectedRide.id == null || config.selectedRide.id === "") return false;

                return true;
            },
            updateSelectableRides() {
                this.selectedRide = {} as Ride;
                this.selectableRides = this.selectedPark.rides;
            }
        },
        computed: {
            currentConfiguration(): Configuration {
                return {
                    selectedPark: this.selectedPark,
                    selectedRide: this.selectedRide,
                    startDate: this.dateStart,
                    endDate: this.dateEnd,
                    comparisonMethod: this.comparisonPeriod
                };
            }
        },
        watch: {
            'currentConfiguration': {
                handler(value: Configuration) {
                    if (this.isConfigurationValid(value)) {
                        console.log("EMITTING");
                        this.$emit('updateConfig', value);
                    }
                }
            }
        }
    });
</script>

<style scoped>

</style>
