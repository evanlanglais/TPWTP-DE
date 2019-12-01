import {Moment} from "moment";
import {Datapoint} from "./Datapoint";

export interface DayOfData {
    date: Moment;
    dps: Array<Datapoint>
}
