export interface MortgageData {
  mortId?: string;
  party: string;
  mortDate: string;
  mortDateStr?: string;
  mortQty: number;
  mortDocFile?: string;
  fileRAW?: File;
  newFile? : boolean;
}
