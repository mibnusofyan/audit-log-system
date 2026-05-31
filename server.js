const app = require("./src/app");
const sequelize = require("./src/config/database");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}

const PORT = process.env.PORT || 3000;
let server;

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully`);

  if (server) {
    server.close(async () => {
      await sequelize.close();
      console.log("Server closed");
      process.exit(0);
    });
    return;
  }

  await sequelize.close();
  process.exit(0);
};

sequelize.sync()
  .then(() => {
    console.log("Database connected");

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to database:", error.message);
    process.exit(1);
  });

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
