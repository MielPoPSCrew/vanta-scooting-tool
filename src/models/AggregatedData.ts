import { Concentration } from './GroupedData';
import { ReferencialType } from './Config';

export default interface AggregatedData {
  projects: string[];
  operators: string[];
  aggregatedgroups: AggregatedMeasureGroup[];
}

export interface AggregatedMeasureGroup {
  id: string;
  date: Date;
  measureCount: number;
  concentrations: AggregatedConcentration[];
}

export interface AggregatedConcentration extends Concentration {
  errorStandardDeviation: number;
  closeToNextReferential: boolean;
  associatedReferential?: ReferencialType;
}
