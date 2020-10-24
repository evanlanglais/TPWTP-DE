<template>
    <div class="tile is-ancestor">
        <div class="tile is-parent is-vertical">
            <div class="tile is-child card">
                <header class="card-header">
                    <p class="card-header-title">
                        Ride Selection
                    </p>
                </header>
                <div class="card-content">
                    <b-loading :active="(selectorLoading > 0)" :is-full-page="false"></b-loading>
                    <b-field label="Select Park">
                        <b-dropdown
                            v-model="selectedPark"
                            aria-role="list"
                        >
                            <button class="button is-primary" type="button" slot="trigger">
                                <template>
                                    <b-icon pack="fas" icon="map-marker-alt"></b-icon>
                                    <span>{{ selectedPark.name }}</span>
                                </template>
                                <b-icon icon="menu-down"></b-icon>
                            </button>

                            <b-dropdown-item
                                v-for="park in parks"
                                :key="park.id"
                                :value="park" aria-role="listitem">
                                <div class="media">
                                    <b-icon class="media-left" pack="fas" icon="map-marker-alt"></b-icon>
                                    <div class="media-content">
                                        <h3>{{ park.name }}</h3>
                                    </div>
                                </div>
                            </b-dropdown-item>
                        </b-dropdown>
                    </b-field>
                    <b-field label="Select Ride">
                        <b-dropdown
                            v-model="selectedRide"
                            aria-role="list"
                            :disabled="!('id' in selectedPark)"
                        >
                            <button class="button is-primary" type="button" slot="trigger">
                                <template>
                                    <b-icon pack="fas" icon="map-marker-alt"></b-icon>
                                    <span>{{ selectedRide.name }}</span>
                                </template>
                                <b-icon icon="menu-down"></b-icon>
                            </button>

                            <b-dropdown-item
                                v-for="ride in rides"
                                :key="ride.id"
                                :value="ride" aria-role="listitem">
                                <div class="container media">
                                    <div class="media-left">
                                        <template v-if="!!ride.layer1.currentWaitTime">
                                            <b-icon pack="fas" icon="stopwatch" type="is-success"></b-icon>
                                            {{ ride.layer1.currentWaitTime.wait }} Min
                                        </template>
                                        <template v-else>
                                            <b-icon pack="fas" icon="stopwatch" type="is-danger"></b-icon>
                                            (N/A)
                                        </template>
                                    </div>
                                    <div class="media-content">
                                        <h3>{{ ride.name }}</h3>
                                    </div>
                                </div>
                            </b-dropdown-item>
                        </b-dropdown>
                    </b-field>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import gql from 'graphql-tag'
import Vue from "vue";

export default Vue.extend({
    name: "RideSelector",
    data() {
        return {
            parks: [],
            rides: [],
            selectedPark: {},
            selectedRide: {},
            selectorLoading: 0
        }
    },
    apollo: {
        parks: {
            query: gql`{
                    parks {
                            id
                            name
                        }
                    }`,
            loadingKey: 'selectorLoading',
        },
        rides: {
            query: gql`query parkRides ($parkId: ParkId!) {
                park(id: $parkId) {
                    rides {
                        id
                        name
                        layer1 {
                            currentWaitTime {
                                wait
                            }
                        }
                    }
                }
            }`,
            update(data: any) {
                // The returned value will update
                // the vue property 'pingMessage'
                this.selectedRide = {};
                return data.park.rides
            },
            variables(): any {
                // Use vue reactive properties here
                return {
                    parkId: this.selectedPark.id
                }
            },
            skip(): boolean {
                return !('id' in this.selectedPark)
            },
            loadingKey: 'selectorLoading'
        }
    },
    watch: {
        selectedRide: {
            handler(value: any) {
                this.$emit('rideSelected', value);
            }
        },
        selectedPark: {
            handler(value: any) {
                this.$emit('parkSelected', value);
            }
        }
    }
});
</script>

<style scoped>

</style>
