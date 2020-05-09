export default interface GroupedData {
  name: string;
  createdAt: Date;
  measuresGroups: MeasureGroup[];
}

export interface MeasureGroup {
  name: string;
  measures: Measure[];
}

export interface Measure {
  id: number;
  date: Date;
  units: String;
  methodName: string;
  elevation: number;
  position: Position;
  concentrations: Concentration[];
  operator: string;
  project: string;
  group: string;
}

export interface Position {
  lon: number;
  lat: number;
}

export interface Concentration {
  element: string;
  value: number;
  error: number;
}
