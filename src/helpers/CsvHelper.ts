import { MeasureGroup, Measure, Concentration } from "./../models/GroupedData";

/*
  Expected headers:
  Reading #,Method Name,Elevation,Latitude,Longitude,Date,Time, Units,[XX Concentration, XX Error1s]?,Divers,Opérateur,Projet,
*/

interface CsvStructure {
  headersPerColumnIndex: Map<string, number>;
  elements: Map<string, ElementStructure>;
  contentStartRowIndex: number;
}

interface ElementStructure {
  concentrationColumnIndex: number;
  errorColumnIndex: number;
}

const KEY_ID = "Reading #";
const KEY_METHOD = "Method Name";
const KEY_ELEVATION = "Elevation";
const KEY_LATITUDE = "Latitude";
const KEY_LONGITUDE = "Longitude";
const KEY_DATE = "Date";
const KEY_TIME = "Time";
const KEY_UNITES = "Units";
const KEY_GROUP = "Divers";
const KEY_OPERATOR = "Opérateur";
const KEY_RPOJECT = "Projet";

const MANDATORY_HEADERS = [
  KEY_ID,
  KEY_METHOD,
  KEY_ELEVATION,
  KEY_LATITUDE,
  KEY_LONGITUDE,
  KEY_DATE,
  KEY_UNITES,
  KEY_GROUP,
  KEY_OPERATOR,
  KEY_RPOJECT,
];

export interface CsvValidity {
  isValid: boolean;
  errors: string[];
}

function isSeparatorInstruction(line: string): boolean {
  return line.startsWith("sep=");
}

function getMissingHeader(line: string): string[] {
  const headers = line.split(",").map(header => header.trim()).filter(header => header);
  const requiredHeaders = [...MANDATORY_HEADERS];

  return requiredHeaders.filter(header => !headers.includes(header));
}

// Only check headers
export function isValidCsv(csvContent: string): CsvValidity {
  if (!csvContent) {
    throw new Error("No CSV content provided.");
  }

  const csvLines = csvContent.split("\n");
  const headerLine = csvLines.find(line => !isSeparatorInstruction(line));
  const errors = [];
  let missingHeader: string[] = [];

  if (!headerLine) {
    errors.push ("Le fichier ne contient pas le nom des colonnes")
  } else {
    missingHeader = getMissingHeader(headerLine)

    if (missingHeader.length) {
      errors.push ("Le fichier ne contient pas les colonnes suivantes: " + missingHeader.join(', '))
    }
  }

  return { isValid: errors.length === 0, errors: errors };
}

function computeCsvStructure(csvLines: string[]): CsvStructure {
  const headerLine = csvLines.find(line => !isSeparatorInstruction(line));

  if (!headerLine) {
    throw new Error("Invalid CSV (headers not found)");
  }

  const availableHeaders = headerLine.split(",").map(header => header.trim()).filter(header => header);

  const csvStructure: CsvStructure = {
    headersPerColumnIndex: new Map(),
    elements: new Map(),
    contentStartRowIndex: csvLines.indexOf(headerLine) + 1
  };

  const getOrElseElemnt = (key: string): ElementStructure => {
    let element = csvStructure.elements.get(key);

    if (!element) {
      element = { concentrationColumnIndex: -1, errorColumnIndex: -1 };
    }

    return element;
  };

  for (const [index, header] of availableHeaders.entries()) {
    const elementConcentration = header.match(/(.*) Concentration/);
    const elementError = header.match(/(.*) Error1s/);

    if (elementConcentration) {
      const element = elementConcentration[1];
      const elementStructure = getOrElseElemnt(element);
      elementStructure.concentrationColumnIndex = index;

      csvStructure.elements.set(element, elementStructure);
    } else if (elementError) {
      const element = elementError[1];
      const elementStructure = getOrElseElemnt(element);
      elementStructure.errorColumnIndex = index;

      csvStructure.elements.set(element, elementStructure);
    } else {
      csvStructure.headersPerColumnIndex.set(header, index);
    }
  }

  return csvStructure;
}

function parseLine(line: string, csvStructure: CsvStructure): Measure {
  const values = line.split(',');
  const getColumnIndex = (key: string): number => csvStructure.headersPerColumnIndex.get(key) as number;

  const date = new Date(values[getColumnIndex(KEY_DATE)] + ' ' + values[getColumnIndex(KEY_TIME)])

  const concentrations: Concentration[] = [];
  for (const [element, structure] of csvStructure.elements.entries()) {
    concentrations.push({
      element: element,
      error: +values[structure.errorColumnIndex],
      value: values[structure.concentrationColumnIndex] === "<LOD" ? Number.NEGATIVE_INFINITY : +values[structure.concentrationColumnIndex]
    });
  }
  return {
    id: +values[getColumnIndex(KEY_ID)],
    date: date,
    units: values[getColumnIndex(KEY_UNITES)],
    methodName: values[getColumnIndex(KEY_METHOD)],
    elevation: +values[getColumnIndex(KEY_ELEVATION)],
    position: {
      lat: +values[getColumnIndex(KEY_LATITUDE)],
      lon: +values[getColumnIndex(KEY_LONGITUDE)],
    },
    concentrations: concentrations,
    operator: values[getColumnIndex(KEY_OPERATOR)],
    project: values[getColumnIndex(KEY_RPOJECT)],
    group: values[getColumnIndex(KEY_GROUP)],
  };
}

export function measuresFromCsv(csvContent: string): MeasureGroup[] | null {
  if (!csvContent) {
    throw new Error("No CSV content provided.");
  }

  const csvLines = csvContent.split("\n").filter(line => line);
  const csvStructure = computeCsvStructure(csvLines);

  const groupPerMeasures = new Map<string, Measure[]>();
  const getGroupOrDefault = (groupName: string) => {
    let group = groupPerMeasures.get(groupName);

    if (!group) {
      group = [];
      groupPerMeasures.set(groupName, group);
    }

    return group;
  }

  for (let i = csvStructure.contentStartRowIndex; i < csvLines.length; i++) {
    const measure = parseLine(csvLines[i], csvStructure);
    getGroupOrDefault(measure.group).push(measure);
  }

  const measureGroup: MeasureGroup[] = [];
  groupPerMeasures.forEach((measures, name) => measureGroup.push({measures, name}));

  return measureGroup;
}
