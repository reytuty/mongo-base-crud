import { Schema, Model, Connection } from "mongoose";

import { Singleton } from "typescript-singleton";
import mongoose from "mongoose";
import {
  DocumentWithId,
  FilterObject,
  Filter,
  IDatabase,
  List,
  FilterNoOffset,
} from "../IDatabase";

import { stringToRegex } from "./prepare";
import md5 from "md5";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import { transformDataToUpdate } from "../../utils/transformData";
dotenv.config();

const mongoConnections = new Map<string, Connection>();
export type MongoConfig = {
  prefixName?: string;
  fullUrl: string;
  database?: string;
};
function getDefaultMongoConfig(): MongoConfig {
  return {
    prefixName: process.env.MONGO_PREFIX_NAME || "dev_",
    fullUrl: process.env.MONGO_URL || "mongodb://localhost:27017",
    database: process.env.MONGO_DB || "db",
  };
}
async function getMongoConnection(
  config: MongoConfig | undefined,
  customDbName?: string
): Promise<Connection> {
  const configOrDefault: MongoConfig = config || getDefaultMongoConfig();
  const prefixName: string = config?.prefixName || "";
  const dbName: string =
    prefixName + (customDbName || prefixName + configOrDefault?.database);
  const connectionString = md5(configOrDefault.fullUrl) + "_" + customDbName;

  if (!mongoConnections.has(connectionString)) {
    const connection = await mongoose.createConnection(
      configOrDefault.fullUrl,
      {
        dbName,
      }
    );
    mongoConnections.set(connectionString, connection);
  }
  return mongoConnections.get(connectionString) as Connection;
}

export interface CollectionInfo {
  name: string;
  schema: Schema;
  collection: Model<Schema>;
}

export class MongoDbAccess implements IDatabase {
  public static collectionsInfo: Map<string, Schema> = new Map();

  protected static getCollectionInfoOrDefault(
    collectionName: string,
    indexes: any = {}
  ): Schema {
    const key: string = `${collectionName}`;

    let collectionInfo = MongoDbAccess.collectionsInfo.get(`${key}`);

    if (collectionInfo) {
      return collectionInfo;
    }

    const flexibleSchema: Schema = new Schema(
      {
        _id: String,
      },
      {
        strict: false,
        collation: { locale: "pt", strength: 1 },
        timestamps: true,
      }
    );
    flexibleSchema.index({ id: 1, ...indexes });

    return flexibleSchema;
  }
  protected static models: Map<string, any> = new Map();
  public static async getInstance(
    collectionName: string,
    databaseName?: string,
    indexes: any = {},
    connectionTryingTimes: number = 1,
    defaultConfig?: MongoConfig
  ): Promise<MongoDbAccess> {
    const configOrDefault: MongoConfig =
      defaultConfig || getDefaultMongoConfig();
    let dbName: string = databaseName || configOrDefault.database || "db";
    if (!configOrDefault.fullUrl) {
      throw new Error(
        "MongoDB host is required or fullUrl is required. Check your env.MONGO_URL"
      );
    }
    const connectionString = md5(JSON.stringify(configOrDefault));
    try {
      const connectedMongoose: Connection | undefined =
        await getMongoConnection(configOrDefault, databaseName);
      const keyCollection: string = `${connectionString}.${dbName}.${collectionName}`;
      if (!MongoDbAccess.models.has(keyCollection)) {
        connectedMongoose.model(
          collectionName,
          this.getCollectionInfoOrDefault(collectionName, indexes)
        );

        MongoDbAccess.models.set(
          keyCollection,
          connectedMongoose.model(collectionName)
        );
      }

      return Singleton.getInstance<MongoDbAccess>(
        `mongo-base-crud_${collectionName}_${connectionString}_${dbName}`,
        MongoDbAccess,
        configOrDefault,
        collectionName,
        connectedMongoose,
        MongoDbAccess.models.get(keyCollection)
      );
    } catch (e: any) {
      if (connectionTryingTimes > 10) {
        throw new Error("Connection error max time exceed");
      }
      console.error(`db error (${connectionTryingTimes}):`, e);
      //trying again
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 200 * connectionTryingTimes);
      });
      return this.getInstance(
        collectionName,
        databaseName,
        indexes,
        connectionTryingTimes + 1,
        defaultConfig
      );
    }
  }

  mongoose: Connection;
  collection: string;
  model: any;

  constructor(
    public config: any,
    collectionName: string,
    mongo: Connection,
    _model: any
  ) {
    this.mongoose = mongo;

    if (!this.mongoose) {
      throw new Error("Mongo Connection Error");
    }

    this.collection = collectionName;
    this.model = _model;
  }

  private formatDoc<T>(doc: any): T | null {
    if (doc) {
      const data = doc.toObject();
      if (data?._id) {
        data.id = data._id;
        delete data._id;
      }
      return data;
    }
    return null;
  }

  async getById<T>(id: string): Promise<T | null> {
    const document = await this.model.findById(id).exec();
    return this.formatDoc<T>(document);
  }

  private handleFilter(
    filter: FilterObject | undefined,
    search?: string,
    searchFields?: string[] | string
  ) {
    if (!filter) {
      return {};
    }

    if (filter?.id) {
      filter._id = filter.id;
      delete filter.id;
    }
    if (searchFields && search) {
      if (!Array.isArray(searchFields)) {
        searchFields = [searchFields];
      }
      if (!filter) {
        filter = {};
      }
      const searchValue = stringToRegex(search);
      const or: any[] = [];
      searchFields.map((val) => {
        or.push({
          [`${val}`]: searchValue,
        });
      });
      filter["$or"] = or;
    }
    return { ...filter };
  }
  async findAll<T>(filterOffset: FilterNoOffset): Promise<T[]> {
    if (filterOffset.filter?.id) {
      filterOffset.filter._id = filterOffset.filter.id;
      delete filterOffset.filter.id;
    }
    const query = this.model
      .find(
        this.handleFilter(
          filterOffset.filter,
          filterOffset.searchValue,
          filterOffset.searchFields
        ),
        filterOffset.select
      )
      .select(" -__v");
    if (filterOffset.orderBy) {
      query.sort({
        [filterOffset.orderBy]: filterOffset.direction
          ? filterOffset.direction
          : "asc",
      });
    }
    const result = await query.exec();

    return result.map(this.formatDoc) as T[];
  }
  async find<T>(filterOffset: Filter): Promise<List<T>> {
    if (filterOffset.filter?.id) {
      filterOffset.filter._id = filterOffset.filter.id;
      delete filterOffset.filter.id;
    }
    const limit: number = filterOffset.offset?.limit || 20;
    const skip: number = filterOffset.offset?.skip || 0;
    const query = this.model.find(
      this.handleFilter(
        filterOffset.filter,
        filterOffset.searchValue,
        filterOffset.searchFields
      ),
      filterOffset.select
    );
    if (filterOffset.orderBy) {
      query.sort({
        [filterOffset.orderBy]: filterOffset.direction
          ? filterOffset.direction
          : "asc",
      });
    }
    if (filterOffset.offset) {
      query.skip(skip).limit(limit);
    }
    let preparedFilter = this.handleFilter(
      filterOffset.filter,
      filterOffset.searchValue,
      filterOffset.searchFields
    );
    const count = await this.model.countDocuments(preparedFilter);
    const result = await query.exec();
    const resultList = {
      total: count,
      skipped: skip,
      limited: limit,
      list: result.map(this.formatDoc),
    };

    return resultList;
  }

  async insert(data: {
    [key: string]: any;
    id?: string | undefined;
  }): Promise<DocumentWithId> {
    if (data.id) {
      return this.update({ ...data, id: data.id });
    }

    const document = await this.model.create({
      ...data,
      _id: randomUUID(),
    });
    return { id: document?._id.toString() };
  }

  async update(data: {
    [key: string]: any;
    id: string;
  }): Promise<DocumentWithId> {
    const { id } = data;
    const updatedDocument = await this.model.findOneAndUpdate(
      { _id: id },
      data,
      {
        upsert: true,
        new: true,
      }
    );
    return { id: updatedDocument?.id.toString() };
  }

  async partialUpdate(
    id: string,
    updates: Partial<{ [key: string]: any }>
  ): Promise<DocumentWithId> {
    return this.update({ id, ...transformDataToUpdate(updates) });
  }

  async delete(id: string): Promise<any> {
    await this.model.findByIdAndDelete(id);
    return { success: true };
  }
}
