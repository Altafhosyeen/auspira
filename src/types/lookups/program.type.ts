export type TProgramLookupQueryParams = {
  search?: string;
  type_classifier_id?: string;
};

export type TUseProgramsLookupOptions = {
  enabled?: boolean;
  params?: TProgramLookupQueryParams;
};
