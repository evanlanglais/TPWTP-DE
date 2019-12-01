// import { Park } from "./Park";
import moment, { Moment } from "moment";
import {DayOfData} from "./DayOfData";
// import moment = require("moment");
import {Datapoint} from "./Datapoint";

const axios = require('axios').default;

export enum ComparisonPeriod {
    MONTH = 'month',
    WEEK = 'week',
    DAY = 'day',
    DAYOFWEEK = 'dayofweek',
    DAYOFYEAR = 'dayofyear'
}

const baseURL: string = 'http://localhost:8080/'; // 'http://api.tpwtp.com/';

function APIURL(endpoint: string): string {
    return `${baseURL}${endpoint}`;
}

function getSupportedParkIds() {
    return axios.get(APIURL('parks'));
}

function getParkRideIds(parkId: string) {
    return axios.get(APIURL(`park/${parkId}/rides`));
}

export function getSequentialDatapoints(parkId: string, rideId: string, startDate: Moment, endDate: Moment) {
    return axios.post(APIURL(`park/${parkId}/ride/${rideId}/dayrange`), {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
    })
        .then(function (response: any) {
            // handle success
            let ride_dps: any = response.data.ride_dps;
            let daysOfData: Array<DayOfData> = Object.keys(ride_dps).map(
                function(dateString: string){
                    const dayOfData: DayOfData = {
                        date: moment(dateString),
                        dps: ride_dps[dateString]
                    };
                    return dayOfData;
                }
            );
            return daysOfData;
        })
        .catch(function (error: any) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}
/*
function getComparisonDatapoints(parkId: string, rideId: string, baseDate: Moment, endDate: Moment, comparisonPeriod: ComparisonPeriod) {
    return axios.post(APIURL(`park/${parkId}/ride/${rideId}/comparable`), {
        base_date: baseDate.toISOString(),
        end_date: endDate.toISOString(),
        compare_index: comparisonPeriod.toString()
    })
        .then(function (response: any) {
            // handle success
            console.log(response);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}
*/
/* USE THIS FOR WHEN I ACTUALLY LOAD DYNAMIC DATA FOR CONFIGURATION
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

axios.all([getUserAccount(), getUserPermissions()])
  .then(axios.spread(function (acct, perms) {
    // Both requests are now complete
  }));
 */
/*
export class API {
    parks: Array<Park>;

    initalize(): void {

    }
}
*/
