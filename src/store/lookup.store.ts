import { create } from 'zustand';

export interface ILookup {
  id: string;
  name: string;
  abbreviation?: string;
  code?: string;
  slug?: string;
  desc?: string;
}

interface LookupActions {
  setCountries: (countries: ILookup[]) => void;
  setAllLookups: (payload: { countries?: ILookup[] }) => void;
  resetLookups: () => void;
}

interface LookupState {
  countries: ILookup[];
}

// combine state and actions
type LookupStore = LookupState & LookupActions;

export const useLookupStore = create<LookupStore>((set) => ({
  countries: [],

  setCountries: (countries: ILookup[]) => set({ countries }),

  setAllLookups: (payload: { countries?: ILookup[] }) =>
    set((state: LookupState) => ({
      countries: payload.countries ?? state.countries,
    })),
  resetLookups: () =>
    set({
      countries: [],
    }),
}));
