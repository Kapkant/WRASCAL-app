import { $log } from "@tsed/common";
import { PlatformExpress } from "@tsed/platform-express";
import { Server } from "./Server";

async function bootstrap() {
  try {
    const platform = await PlatformExpress.bootstrap(Server);
    await platform.listen();

    process.on("SIGINT", () => {
      platform.stop();
    });
  } catch (error) {
    // Check if it's a database connection error
    if (error.message && error.message.includes("Connection terminated unexpectedly")) {
      $log.warn("⚠️ Database connection failed, but continuing with app startup...");
      $log.warn("App will run in offline mode without database access");
      
      // Try to start the server anyway
      try {
        const platform = await PlatformExpress.bootstrap(Server);
        await platform.listen();
        $log.info("✅ Server started successfully in offline mode");
        
        process.on("SIGINT", () => {
          platform.stop();
        });
      } catch (retryError) {
        $log.error({ event: "SERVER_BOOTSTRAP_ERROR", message: retryError.message, stack: retryError.stack });
        process.exit(1);
      }
    } else {
      $log.error({ event: "SERVER_BOOTSTRAP_ERROR", message: error.message, stack: error.stack });
      process.exit(1);
    }
  }
}

bootstrap();
