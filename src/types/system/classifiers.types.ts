import { IBaseType } from '../api.types';

export interface IClassifier extends IBaseType {
  meta_status: string;
  index: number;
  name: string;
  abbreviation: string;
  desc: string;
  type: string;
}

export interface IClassifierType {
  id: string;
  name: string;
  desc: string;
  abbreviation: string;
  classifiers: IClassifier[];
}

export interface IDraftClassifier {
  localId: string;
  id?: string;
  type: string;
  name: string;
  abbreviation: string;
  desc: string;
  index: number;
}

export interface IClassifierUpsertPayload {
  id?: string;
  name: string;
  abbreviation?: string;
  index: number;
  desc?: string;
}

export interface IBulkUpsertClassifiersParams {
  id: string;
  data: {
    name: string;
    abbreviation: string;
    desc: string;
    classifiers: IClassifierUpsertPayload[];
  };
}
