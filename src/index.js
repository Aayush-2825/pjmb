import app from "./app.js";
import dotenv from "dotenv";
import { connectToDB } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || "3000";

connectToDB()
  .then(() =>
    app.listen(PORT, () => {
      console.log(`App is listening on port:${PORT}`);
    }),
  )
  .catch((err) => {
    console.log("Database Error:", err);
    process.exit(1);
  });
