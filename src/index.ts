import { Singleton } from "typescript-singleton";
import { DocumentWithId, IDatabase, List } from "./database/IDatabase";
import { MongoConfig, MongoDbAccess } from "./database/mongo/index.js";
class BaseCrud<T> {
  protected dbInterface: Promise<IDatabase>;
  public static getInstance<T>(
    collectionName?: string,
    dbName?: string,
    indexes: any = {}
  ): BaseCrud<T> {
    return Singleton.getInstance<BaseCrud<T>>(
      `${dbName}_${collectionName}`,
      BaseCrud,
      collectionName,
      dbName,
      indexes
    );
  }

  constructor(
    protected collectionName: string,
    protected dbName: string,
    indexes: any = {},
    connectionTryingTimes = 1,
    defaultConfig?: MongoConfig
  ) {
    if (!this.collectionName) {
      throw new Error("Collection name is required");
    }
    if (!this.dbName) {
      throw new Error("Database name is required");
    }
    this.dbInterface = MongoDbAccess.getInstance(
      this.collectionName,
      this.dbName,
      indexes,
      connectionTryingTimes,
      defaultConfig
    );
  }

  async save(data: any): Promise<DocumentWithId> {
    if (data.hasOwnProperty("updatedAt")) {
      data.updatedAt = new Date();
    }
    if (data.hasOwnProperty("createdAt") && !data["createdAt"]) {
      data.createdAt = new Date();
    }
    const result = await (await this.dbInterface).insert(data);
    return result;
  }

  async update(data: {
    [key: string]: any;
    id: string;
  }): Promise<DocumentWithId> {
    if (data.hasOwnProperty("updatedAt")) {
      data.updatedAt = new Date();
    }
    const result = await (await this.dbInterface).update(data);
    return result;
  }

  async getById(id: string): Promise<T | null> {
    const result = await (await this.dbInterface).getById<T>(id);
    return result;
  }

  async find(
    filter?: any,
    select?: any,
    skip = 0,
    limit = 10,
    orderBy?: string,
    direction?: string,
    searchValue?: string,
    searchFields?: string[] | string
  ): Promise<List<T>> {
    const result = await (
      await this.dbInterface
    ).find<T>({
      filter,
      select,
      offset: {
        skip,
        limit,
      },
      orderBy,
      direction,
      searchValue,
      searchFields,
    });
    return result;
  }
  async findAll<T = unknown>(
    filter?: any,
    select?: any,
    orderBy?: string,
    direction?: string,
    searchValue?: string,
    searchFields?: string[] | string
  ) {
    return (await this.dbInterface).findAll<T>({
      filter,
      select,
      orderBy,
      direction,
      searchValue,
      searchFields,
    });
  }
  async delete(id: string) {
    return (await this.dbInterface).delete(id);
  }
}

export { BaseCrud, DocumentWithId, IDatabase, List };
