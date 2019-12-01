<template>
    <div>
        test graph
        <div class="tile is-child">
            <p>Selected park is {{ config }}</p>
        </div>
        <div>
            {{ visualizedData }}
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {getSequentialDatapoints} from "../data/API";
    import moment, {Moment} from "moment";
    import {DayOfData} from "@/data/DayOfData";

    export default Vue.extend({
        // name: "Visualizer",
        props: ["config"],
        data() {
            return {
                visualizedData: new Array<DayOfData>()
            }
        },
        methods: {
            drawGraph(config: any) {
                if (config == null) config = this.$props.config;
                const startDate: Moment = moment(config.startDate);
                const endDate: Moment = moment(config.endDate);
                getSequentialDatapoints(config.selectedPark, config.selectedRide, startDate, endDate)
                .then((result: Array<DayOfData>) => { this.visualizedData = result; });
            }
        }
    });
</script>

<style scoped>

</style>
