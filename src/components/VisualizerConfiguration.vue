<template>
    <div class="tile is-ancestor">
        <div class="tile is-parent">
            <div class="tile is-child box">
                <b-field label="Park">
                    <b-select placeholder="Select a park" v-model="selectedPark" expanded>
                        <option
                                v-for="park in parks"
                                :value="park.id"
                                :key="park.id">
                            {{ park.name }}
                        </option>
                    </b-select>
                </b-field>
                <b-field label="Ride">
                    <b-select placeholder="Select a ride" v-model="selectedRide" expanded>
                        <option
                                v-for="ride in rides[selectedPark]"
                                :value="ride"
                                :key="ride">
                            {{ ride }}
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
            </div>
        </div>
        <div class="tile is-parent">
            <div class="tile is-child box">
                <b-button @click="drawCurrentConfiguration()">
                    Redraw Visualizer
                </b-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import moment from 'moment';
    import {Moment} from 'moment';

    export default Vue.extend({
        data: function() {
            return {
                selectedPark: null,
                selectedRide: null,
                dateStart: null,
                dateEnd: null,
                comparisonPeriod: null,
                parks: [
                    { id: "wdwmk", name: "Walt Disney World Magic Kingdom" },
                    { id: "wdwe", name: "Walt Disney World Epcot" },
                    { id: "usf", name: "Universal Studio's Florida" },
                    { id: "uioa", name: "Universal's Islands of Adventure" }
                ],
                rides: {
                    'wdwmk': [
                        'WaltDisneyWorldMagicKingdom_16491297',
                        'WaltDisneyWorldMagicKingdom_16767263',
                        'WaltDisneyWorldMagicKingdom_16767284',
                        'WaltDisneyWorldMagicKingdom_17272158',
                        'WaltDisneyWorldMagicKingdom_80010110',
                        'WaltDisneyWorldMagicKingdom_80010114',
                        'WaltDisneyWorldMagicKingdom_80010153',
                        'WaltDisneyWorldMagicKingdom_80010176',
                        'WaltDisneyWorldMagicKingdom_80010190',
                        'WaltDisneyWorldMagicKingdom_80010192',
                        'WaltDisneyWorldMagicKingdom_80010208',
                        'WaltDisneyWorldMagicKingdom_80010213',
                        'WaltDisneyWorldMagicKingdom_80010222'
                    ],
                    'wdwe': [
                        'WaltDisneyWorldEpcot_20194',
                        'WaltDisneyWorldEpcot_107785',
                        'WaltDisneyWorldEpcot_80010173',
                        'WaltDisneyWorldEpcot_80010191',
                        'WaltDisneyWorldEpcot_80010199'
                    ],
                    'uioa': [
                        'UniversalIslandsOfAdventure_10831',
                        'UniversalIslandsOfAdventure_10833',
                        'UniversalIslandsOfAdventure_10835',
                        'UniversalIslandsOfAdventure_10837',
                        'UniversalIslandsOfAdventure_10839',
                        'UniversalIslandsOfAdventure_10840',
                        'UniversalIslandsOfAdventure_10842',
                        'UniversalIslandsOfAdventure_10857',
                        'UniversalIslandsOfAdventure_10859',
                        'UniversalIslandsOfAdventure_10862',
                        'UniversalIslandsOfAdventure_13225',
                        'UniversalIslandsOfAdventure_13799',
                        'UniversalIslandsOfAdventure_17097'
                    ],
                    'usf': [
                        'UniversalStudiosFlorida_10135',
                        'UniversalStudiosFlorida_10838',
                        'UniversalStudiosFlorida_10841',
                        'UniversalStudiosFlorida_10853',
                        'UniversalStudiosFlorida_10858',
                        'UniversalStudiosFlorida_10860',
                        'UniversalStudiosFlorida_10875',
                        'UniversalStudiosFlorida_10877',
                        'UniversalStudiosFlorida_10879',
                        'UniversalStudiosFlorida_13221',
                        'UniversalStudiosFlorida_14348',
                        'UniversalStudiosFlorida_16061'
                    ]
                },
                comparisonPeriods: [
                    { id: 'day', name: "Compare with every day" },
                    { id: 'dayofweek', name: "Compare with the same day every week" },
                    { id: 'month', name: "Compare with the same day every month" },
                    { id: 'dayofyear', name: "Compare with the Same day every year" }
                ]
            }
        },
        methods: {
            drawCurrentConfiguration() {
                if (this.selectedPark != null && this.selectedRide != null) {
                    this.$emit('drawGraph', {
                        selectedPark: this.selectedPark,
                        selectedRide: this.selectedRide,
                        startDate: this.dateStart,
                        endDate: this.dateEnd,
                        comparisonMethod: this.comparisonPeriod
                    });
                }
            }
        }
    });
</script>

<style scoped>

</style>
