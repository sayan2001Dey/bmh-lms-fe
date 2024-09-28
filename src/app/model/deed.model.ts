import { SellerType } from './seller-type.model';
import { MortgageData } from "./mortgage-data.model";
import { MouzaLandSpecifics } from "./mouza-land-specifics.model";
import { PartlySoldData } from "./partly-sold-data.model";

export interface Deed {
  deedId?: string;
  groupId: string;
  recId?: string;
  mouza: DeedMouza[];
  deedNo: string;
  deedDate: string;

  SellerType: string;
  sellers: string[];

  totalQty: number;
  purQty: number;
  mutedQty: number;
  unMutedQty: number;
  landStatus: string;
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

export interface DeedMouza {
  mouzaId: string;
  landSpecifics: DeedLandSpecifics[];
}

export interface DeedLandSpecifics extends MouzaLandSpecifics {
  qty: number;
}
