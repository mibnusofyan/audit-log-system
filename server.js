const app = require("./src/app");
const sequelize = require("./src/config/database");

require("dotenv").config();

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  console.log("Database connected");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
