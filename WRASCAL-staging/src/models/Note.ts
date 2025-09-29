export enum NoteType {
  Solid = "Solid",
  TemperatureRange = "TemperatureRange",
  BackgroundElectrolyte = "BackgroundElectrolyte",
  CorrectedForBackgroundElectrolyte = "CorrectedForBackgroundElectrolyte",
  AdjustedForCompatibility = "AdjustedForCompatibility",
  AdjustedToProtonationConstant = "AdjustedToProtonationConstant",
  AdjustedReasonUnknown = "AdjustedReasonUnknown",
  Molal = "Molal",
  CisIsomer = "CisIsomer",
  TransIsomer = "TransIsomer",
  DIsomer = "DIsomer",
  UnstatedIsomer = "UnstatedIsomer",
  UnstatedOpticalIsomer = "UnstatedOpticalIsomer",
  Other = "Other"
}

export class Note {
  type: NoteType;
  content: string;

  constructor(type: NoteType, content: string) {
    this.type = type;
    this.content = content;
  }
}
