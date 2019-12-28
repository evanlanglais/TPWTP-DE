import moment, { Moment } from "moment";
import {DayOfData} from "./DayOfData";
import {DataPackage} from "./DataPackage";
import {Park} from "./Park";
import {AxiosResponse} from "axios";
import {Ride} from "./Ride";

const axios = require('axios').default;

export enum ComparisonPeriod {
    MONTH = 'month',
    WEEK = 'week',
    DAY = 'day',
    DAYOFWEEK = 'dayofweek',
    DAYOFYEAR = 'dayofyear'
}

const baseURL: string = 'http://api.tpwtp.com/';

function APIURL(endpoint: string): string {
    return `${baseURL}${endpoint}`;
}

export function getSupportedParks(): Promise<Array<Park>> {
    return new Promise<Array<Park>>((resolve, reject) => {
        axios.get(APIURL('parks'))
            .then(function(response: AxiosResponse) {
                let parks: Array<Park> = response.data;
                resolve(parks);
            });
    });
}

function getParkRideIds(parkId: string) {
    return axios.get(APIURL(`park/${parkId}/rides`));
}

export function getSequentialDatapoints(park: Park, ride: Ride, startDate: Moment, endDate: Moment) {
    return axios.post(APIURL(`park/${park.id}/ride/${ride.id}/dayrange`), {
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
            let dataPackage: DataPackage = {
                ride: response.data.ride,
                data: daysOfData
            };
            return dataPackage;
        })
        .catch(function (error: any) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}

export function getComparisonDatapoints(park: Park, ride: Ride, baseDate: Moment, endDate: Moment, comparisonPeriod: ComparisonPeriod) {
    return axios.post(APIURL(`park/${park.id}/ride/${ride.id}/comparable`), {
        base_date: baseDate.toISOString(),
        end_date: endDate.toISOString(),
        compare_index: comparisonPeriod.toString()
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
            let dataPackage: DataPackage = {
                ride: response.data.ride,
                data: daysOfData
            };
            return dataPackage;
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            // always executed
        });
}

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
