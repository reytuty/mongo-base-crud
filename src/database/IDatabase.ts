export interface IDatabase {
  collection: string;
  getById<T>(id: string): Promise<T | null>;
  find<T>(FilterOffset: Filter): Promise<List<T>>;
  findAll<T>(FilterOffset: Filter): Promise<T[]>;
  insert(data: { [key: string]: any; id?: string }): Promise<DocumentWithId>;
  update(data: { [key: string]: any; id: string }): Promise<DocumentWithId>;
  patch(
    id: string,
    updates: Partial<{ [key: string]: any }>
  ): Promise<DocumentWithId>;
  delete(id: string): Promise<any>;
}

export interface Filter extends FilterNoOffset {
  offset?: Offset;
}
export interface FilterNoOffset {
  filter?: FilterObject;
  select?: FilterObject;
  orderBy?: string;
  direction?: string;
  searchValue?: string;
  searchFields?: string[] | string;
}
export type FilterObject = {
  [key: string]: unknown;
};

export type DocumentWithId = {
  id: string;
};

export type Offset = {
  skip: number;
  limit: number;
};

export type List<T> = {
  total: number;
  skipped: number;
  limited: number;
  list: T[];
};
