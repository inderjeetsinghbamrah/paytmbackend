const express = require("express");
const cors = require("cors");


const PORT = 5000;
const mainRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", mainRouter);

app.listen(PORT, () => {
  console.log("App Started");
});
