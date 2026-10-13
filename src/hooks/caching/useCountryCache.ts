'use client';

import { useEffect } from 'react';
import { useLookupStore } from '@/store/lookup.store';
import { useCountries } from '../lookups/countries';
import { ICountry, ILookup } from '@/types/lookup.types';

export const useCountryCache = (): ILookup[] => {
  const countries = useLookupStore((state) => state.countries);
  const setCountries = useLookupStore((state) => state.setCountries);

  const {
    data: countriesData,
    isFetching: countriesIsFetching,
    isSuccess: countriesIsSuccess,
  } = useCountries<ICountry[]>({ enabled: countries.length === 0 });

  useEffect(() => {
    if (countries.length === 0 && countriesIsSuccess && !countriesIsFetching) {
      setCountries(countriesData);
    }
  }, [countries.length, countriesIsSuccess, countriesIsFetching, countriesData, setCountries]);

  return countries;
};
