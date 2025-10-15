import { registerProvider } from "@tsed/di";
import { DataSource } from "typeorm";
import { Logger } from "@tsed/logger";
// Entities
import { Condition } from "./entities/Condition";
import { Constant } from "./entities/Constant";
import { EquilibriumExpression } from "./entities/EquilibriumExpression";
import { FootNote } from "./entities/Footnote";
import { Ligand } from "./entities/Ligand";
import { Metal } from "./entities/Metal";
import { LigandMapping } from "./entities/LigandMapping";
import { Literature } from "./entities/Literature";
import { LiteratureMapping } from "./entities/LiteratureMapping";
import { MolData } from "./entities/MolData";

export const POSTGRES_DATA_SOURCE = Symbol.for("PostgresDataSource");
export const PostgresDataSource = new DataSource({
  type: "postgres",
  entities: [Condition, Constant, EquilibriumExpression, FootNote, Ligand, Metal, Literature, LigandMapping, LiteratureMapping, MolData],
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.DB_SCHEMA,
  ssl: process.env.DB_SSL === "true" ? { 
    rejectUnauthorized: false
  } : false,
  // Auto-create tables in development to avoid missing table errors
  synchronize: process.env.TYPEORM_SYNC === "true" || process.env.NODE_ENV !== "production",
  // Add connection timeout and retry settings
  extra: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 5, // Reduce max connections to prevent overwhelming the database
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    // Add retry settings
    retryDelayMillis: 2000,
    retryAttempts: 3
  }
});

registerProvider<DataSource | null>({
  provide: POSTGRES_DATA_SOURCE,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    try {
      // Validate required environment variables
      const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USERNAME', 'DB_PASSWORD'];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        logger.error("❌ Missing required environment variables:", missingVars);
        return null;
      }

      logger.info("Attempting to connect to database...");
      logger.info("DB_HOST:", process.env.DB_HOST);
      logger.info("DB_PORT:", process.env.DB_PORT);
      logger.info("DB_NAME:", process.env.DB_NAME);
      logger.info("DB_SSL:", process.env.DB_SSL);
      logger.info("DB_USERNAME:", process.env.DB_USERNAME);
      
      // Add retry logic for database connection
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          logger.info(`Connection attempt ${retryCount + 1}/${maxRetries}`);
          
          // Add a delay between retries
          if (retryCount > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          }
          
          await PostgresDataSource.initialize();
          break; // Success, exit retry loop
        } catch (error) {
          retryCount++;
          logger.warn(`Connection attempt ${retryCount} failed:`, error.message);
          
          if (retryCount >= maxRetries) {
            throw error; // Re-throw the last error
          }
        }
      }
      logger.info("✅ Connected with typeorm to database: Postgres");
      
      // Test the connection with a simple query
      const result = await PostgresDataSource.query("SELECT NOW() as current_time, current_user as db_user");
      logger.info("✅ Database query test successful:", result[0]);
      
      return PostgresDataSource;
    } catch (error) {
      logger.error("❌ Database connection failed:");
      logger.error("Error message:", error.message);
      logger.error("Error code:", error.code);
      if (error.code === 'ENOTFOUND') {
        logger.error("❌ DNS resolution failed - check DB_HOST");
      } else if (error.code === 'ECONNREFUSED') {
        logger.error("❌ Connection refused - check DB_HOST and DB_PORT");
      } else if (error.code === '28P01') {
        logger.error("❌ Authentication failed - check DB_USERNAME and DB_PASSWORD");
      } else if (error.code === '3D000') {
        logger.error("❌ Database does not exist - check DB_NAME");
      }
      logger.warn("⚠️ App will start without database connection");
      // Don't throw error - let app start without database
      return null;
    }
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource && dataSource.isInitialized && dataSource.close();
    }
  }
});
