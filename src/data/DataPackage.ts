import {DayOfData} from "./DayOfData";
import {Ride} from "./Ride";

export interface DataPackage {
    ride: Ride
    data: Array<DayOfData>
}
