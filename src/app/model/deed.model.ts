import { MortgageData } from "./mortgage-data.model";
import { PartlySoldData } from "./partly-sold-data.model";

export interface Deed {
  deedId?: string;
  groupId: string;
  mouzaId: string;
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
  taxDueDate: string;
  lastUpDate: string;

  legalMatters: string;
  ledueDate: string;
  lelastDate: string;

  mortgaged: boolean;
  partlySold: boolean;
  mortgagedData?: MortgageData[];
  partlySoldData?: PartlySoldData[];

  scanCopyFile?: string[];
  mutationFile?: string[];
  conversionFile?: string[];
  documentFile?: string[];
  vestedFile?: string[];
  areaMapFile?: string[];
  parchaFile?: string[];
}
