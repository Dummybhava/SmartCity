import { MongoClient } from 'mongodb';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '../shared/schema';

const { Pool } = pg;

// PostgreSQL connection (existing Drizzle ORM)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'smartcity';

// MongoDB client
let mongoClient: MongoClient | null = null;
let mongoDb: any = null;

export async function connectToMongo() {
  try {
    // For development environment without MongoDB, return a mock db
    if (!process.env.MONGODB_URI) {
      console.log('MongoDB URI not provided, using mock MongoDB implementation');
      return {
        collection: (name: string) => ({
          find: () => ({
            toArray: async () => [],
            sort: () => ({
              limit: () => ({
                toArray: async () => []
              })
            })
          }),
          findOne: async () => null,
          insertOne: async () => ({ insertedId: 1 })
        })
      };
    }
    
    if (!mongoClient) {
      mongoClient = new MongoClient(MONGODB_URI);
      await mongoClient.connect();
      mongoDb = mongoClient.db(MONGODB_DB_NAME);
      console.log('Connected to MongoDB');
    }
    return mongoDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Return mock implementation on error
    return {
      collection: (name: string) => ({
        find: () => ({
          toArray: async () => [],
          sort: () => ({
            limit: () => ({
              toArray: async () => []
            })
          })
        }),
        findOne: async () => null,
        insertOne: async () => ({ insertedId: 1 })
      })
    };
  }
}

// MySQL connection 
const MYSQL_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'smartcity',
};

let mysqlPool: mysql.Pool | null = null;

export async function connectToMySql() {
  try {
    // For development environment without MySQL, return a mock pool
    if (!process.env.MYSQL_HOST) {
      console.log('MySQL host not provided, using mock MySQL implementation');
      return {
        query: async (sql: string, params?: any[]) => {
          console.log(`Mock MySQL query: ${sql}`);
          return [[], []]; // Return empty results and fields
        }
      };
    }
    
    if (!mysqlPool) {
      mysqlPool = mysql.createPool(MYSQL_CONFIG);
      console.log('Connected to MySQL');
    }
    return mysqlPool;
  } catch (error) {
    console.error('MySQL connection error:', error);
    // Return a mock implementation
    return {
      query: async (sql: string, params?: any[]) => {
        console.log(`Mock MySQL query (fallback): ${sql}`);
        return [[], []]; // Return empty results and fields
      }
    };
  }
}

// Sitecore Content Management Service mock
// In a real-world implementation, this would be replaced with actual Sitecore integration
export class SitecoreContentService {
  private static instance: SitecoreContentService;
  
  private constructor() {}
  
  public static getInstance(): SitecoreContentService {
    if (!SitecoreContentService.instance) {
      SitecoreContentService.instance = new SitecoreContentService();
    }
    return SitecoreContentService.instance;
  }
  
  async getContent(contentPath: string): Promise<any> {
    console.log(`Fetching content from Sitecore path: ${contentPath}`);
    // This would be replaced with actual Sitecore API calls
    return { path: contentPath, lastUpdated: new Date() };
  }
  
  async updateContent(contentPath: string, data: any): Promise<boolean> {
    console.log(`Updating Sitecore content at path: ${contentPath}`);
    // This would be replaced with actual Sitecore API calls
    return true;
  }
}

// Initialize Sitecore service
export const sitecoreService = SitecoreContentService.getInstance();