import mongoose from 'mongoose';
import { Implementation } from '@keystone-alpha/fields';
import { MongooseFieldAdapter } from '@keystone-alpha/adapter-mongoose';
import { KnexFieldAdapter } from '@keystone-alpha/adapter-knex';

// Ref: https://mongoosejs.com/docs/geojson.html
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});
export class GeoLocation extends Implementation {
  private defaultCenter: object;
  private defaultZoom: number;
  private googleApiKey: string;
  private showMap: boolean;
  protected path: string;
  protected graphQLOutputType: string;
  protected defaultValue: object;
  protected config: object;
  protected isPrimaryKey: boolean;
  protected schemaDoc: any;
  protected isRequired: boolean;
  protected hooks: any;
  protected getListByKey: any
  protected listKey: string
  protected label: string
  protected adapter: any
  protected isRelationship: false
  protected access: any

  constructor(
    path,
    {
 defaultZoom, defaultCenter, googleApiKey, defaultValue, showMap 
},
  ) {
    super(...(arguments as unknown as [any, any, any]));
    this.graphQLOutputType = 'GeoLocation';
    this.defaultCenter = defaultCenter || {
      lat: 22.28552,
      lng: 114.15769,
    };
    this.defaultValue = defaultValue || defaultCenter;
    this.defaultZoom = defaultZoom || 11;
    this.googleApiKey = googleApiKey || process.env.GOOGLE_API_KEY;
    if (typeof showMap === 'undefined') {
      this.showMap = true;
    } else {
      this.showMap = showMap || false;
    }
  }

  getGqlAuxTypes() {
    return [
      `
      type ${this.graphQLOutputType} {
        type: String!,
        coordinates: [Float!]!
      }
      input ${this.graphQLOutputType}Format{
        type: String!,
        coordinates: [Float!]!
      }
    `,
    ];
  }

  gqlOutputFields() {
    return [`${this.path}: ${this.graphQLOutputType}`];
  }

  gqlOutputFieldResolvers() {
    return {
      [this.path]: (item) => item[this.path],
    };
  }

  get gqlUpdateInputFields() {
    return [`${this.path}: ${this.graphQLOutputType}Format`];
  }

  get gqlCreateInputFields() {
    return [`${this.path}: ${this.graphQLOutputType}Format`];
  }

  extendAdminMeta(meta) {
    return {
      ...meta,
      defaultCenter: this.defaultCenter,
      defaultZoom: this.defaultZoom,
      googleApiKey: this.googleApiKey,
      showMap: this.showMap,
    };
  }
}

export class MongoGeoLocationInterface extends MongooseFieldAdapter {
  protected path: string;
  protected config: object;
  rangeCheck(target, min, max) {
    return target !== NaN && min <= target && target <= max;
  }

  addToMongooseSchema(schema) {
    const validator = (locationObject) => {
      if (typeof locationObject !== 'object') return false;
      if (locationObject.type !== 'Point') return false;
      if (!locationObject.coordinates) return false;

      return (
        this.rangeCheck(locationObject.coordinates[0], -180, 180)
        && this.rangeCheck(locationObject.coordinates[1], -90, 90)
      );
    };
    const schemaOptions = {
      type: pointSchema,
      validate: {
        validator: this.buildValidator(validator),
        message: '{VALUE} is not a valid geo coordinate',
      },
    };
    schema.add({
      [this.path]: this.mergeSchemaOptions(schemaOptions, this.config),
    });
  }
  buildValidator(validator: (locationObject: any) => boolean) {
    return super.buildValidator(validator);
  }
  mergeSchemaOptions(schemaOptions: { type: any; validate: { validator: any; message: string; }; }, config: object) {
    return super.mergeSchemaOptions(schemaOptions, config);
  }

  getQueryConditions() {
    return {};
  }
}

export class KnexGeoLocationInterface extends KnexFieldAdapter {
  protected path: string;
  addToTableSchema(table) {
    table.jsonb(this.path);
  }

  getQueryConditions() {
    return {};
  }
}
