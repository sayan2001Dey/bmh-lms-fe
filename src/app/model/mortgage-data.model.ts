export interface MortgageData {
  mortId?: string;
  party: string;
  mortDate: string;
  mortDateStr?: string;
  mortQty: number;
  docFile?: string;
  docFileRAW?: File;
}
