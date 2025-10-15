import { join } from "path";
import { Configuration, Inject } from "@tsed/di";
import { PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import "@tsed/ajv";
import "@tsed/swagger";
import { config } from "./config/index";
import * as rest from "./controllers/rest/index";
import * as pages from "./controllers/pages/index";

@Configuration({
  ...config,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8081,
  httpsPort: false, // CHANGE
  componentsScan: false,
  mount: {
    "/rest": [...Object.values(rest)],
    "/": [...Object.values(pages)]
  },
  swagger: [
    {
      path: "/doc",
      specVersion: "3.0.1"
    }
  ],
  middlewares: [
    "cors",
    cookieParser(),
    compress({}),
    methodOverride(),
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    }),
    // Serve static files from public directory
    express.static(join(process.cwd(), "public"))
  ],
  views: {
    root: join(process.cwd(), "views"),
    extensions: {
      ejs: "ejs"
    }
  },
  exclude: ["**/*.spec.ts"]
})
export class Server {
  @Inject()
  protected app: PlatformApplication;

  @Configuration()
  protected settings: Configuration;

  $onReady() {
    // Serve the frontend for all non-API routes
    this.app.get("/", (req: Request, res: Response) => {
      res.sendFile(join(process.cwd(), "public", "index.html"));
    });

    // Handle client-side routing - serve index.html for all routes that don't start with /rest or /doc
    this.app.get("*", (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith("/rest") || req.path.startsWith("/doc")) {
        return next();
      }
      res.sendFile(join(process.cwd(), "public", "index.html"));
    });
  }
}
