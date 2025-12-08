
import cors from "cors";
import express from "express";
import cookieParser from 'cookie-parser';
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";

const app = express();
 

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser());


app.use('/api', router);



app.get("/", (_req, res) => {
  res.send("EventMate API is running");
});


app.use(globalErrorHandler);

app.use(notFound);

export default app;
