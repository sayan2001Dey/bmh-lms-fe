import { MouzaLandSpecifics } from './mouza-land-specifics.model';
export interface Mouza {
  mouzaId: string;
  groupId: string;
  mouza: string;
  block: string;
  jlno: number;
  landSpecifics: MouzaLandSpecifics[];
}
