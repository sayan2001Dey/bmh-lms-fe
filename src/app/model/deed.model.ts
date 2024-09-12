import { MortgageData } from "./mortgage-data.model";

export interface Deed {
  deedId?: string;
  deedNo: string;
  deedDate: string;

  totalQty: number;
  purQty: number;
  mutedQty: number;
  unMutedQty: number;
  landStatus: string;
  landType: string;
  conversionLandStatus: string;

  deedLoc: string;
  photoLoc: string;
  govtRec: string;
  remarks: string;
  khazanaStatus: string;
  tax: number;
  dueDate: string;

  legalMatters: string;
  ledueDate: string;
  lelastDate: string;

  mortgaged: boolean;
  partlySold: boolean;
  mortgagedData: MortgageData[];
}
