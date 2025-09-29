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
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  // Auto-create tables in development to avoid missing table errors
  synchronize: process.env.TYPEORM_SYNC === "true" || process.env.NODE_ENV !== "production",
  // Add connection timeout and retry settings
  extra: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20
  }
});

registerProvider<DataSource>({
  provide: POSTGRES_DATA_SOURCE,
  type: "typeorm:datasource",
  deps: [Logger],
  async useAsyncFactory(logger: Logger) {
    try {
      logger.info("Attempting to connect to database...");
      logger.info("DB_HOST:", process.env.DB_HOST);
      logger.info("DB_PORT:", process.env.DB_PORT);
      logger.info("DB_NAME:", process.env.DB_NAME);
      logger.info("DB_SSL:", process.env.DB_SSL);
      
      await PostgresDataSource.initialize();
      logger.info("✅ Connected with typeorm to database: Postgres");
      return PostgresDataSource;
    } catch (error) {
      logger.error("❌ Database connection failed:", error.message);
      logger.error("Full error:", error);
      throw error;
    }
  },
  hooks: {
    $onDestroy(dataSource) {
      return dataSource.isInitialized && dataSource.close();
    }
  }
});
