import {Ride} from "./Ride";

export interface Park {
    id: string;
    name: string;
    rides: Array<Ride>;
    timezone: string;
}
