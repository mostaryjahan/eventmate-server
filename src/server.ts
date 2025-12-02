
import { Server } from "http";
import app from "./app";
import { prisma } from "./app/shared/prisma";
import { envVars } from "./config/env";
import { seedAdmin } from "./seed/seedAdmin";



let server: Server;

const startServer = async () => {
  try {
       await prisma.$connect();

    console.log("Connected to DB.........");

    server = app.listen(5000, () => {
      console.log(`Server is listening to port ${envVars.PORT} `);
    });
  } catch (error) {
    console.log(error);
  }
};

(async () => {

  await startServer();
  await seedAdmin();
})();

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection detected...... Server shutting down..", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("unCaughtException", (err) => {
  console.log("uncaught Exception detected...... Server shutting down..", err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal received...... Server shutting down..");
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

