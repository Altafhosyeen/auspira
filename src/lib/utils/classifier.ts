import type { IClassifier, IDraftClassifier } from '@/types/system/classifiers.types';

export const buildDraftFromType = (
  typeId: string,
  classifiers: IClassifier[]
): IDraftClassifier[] =>
  [...classifiers]
    .sort((a, b) => a.index - b.index)
    .map((classifier, idx) => ({
      localId: classifier.id,
      id: classifier.id,
      type: typeId,
      name: classifier.name,
      abbreviation: classifier.abbreviation,
      desc: classifier.desc,
      index: idx + 1,
    }));

export const createNewDraft = (typeId: string, index: number): IDraftClassifier => ({
  localId: `new-${typeId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: typeId,
  name: '',
  abbreviation: '',
  desc: '',
  index,
});

export const normalizeIndexes = (items: IDraftClassifier[]): IDraftClassifier[] =>
  items.map((item, idx) => ({
    ...item,
    index: idx + 1,
  }));

export const reorderDraftRows = (
  items: IDraftClassifier[],
  sourceIndex: number,
  destinationIndex: number
): IDraftClassifier[] => {
  const clone = [...items];
  const [moved] = clone.splice(sourceIndex, 1);
  if (!moved) {
    return items;
  }

  clone.splice(destinationIndex, 0, moved);
  return normalizeIndexes(clone);
};
