import express from "express";
import { container, setup } from "./bootstrap/container.js";
const app = express();
import errorHandler from "./shared/error-handler.js";
import reservationsModule from "./modules/reservations/index.js";
import { AuthRoutes } from "./modules/identity/index.js";
setup();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", new AuthRoutes().getRouter());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "hello world",
  });
});
const reservations = reservationsModule(container);
app.use("/api/v1", reservations.routes);
app.use(errorHandler);
export default app;
