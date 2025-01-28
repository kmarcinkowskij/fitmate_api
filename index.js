import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import fitmate_router from "./routes/router.js";

const app = express();
const PORT = process.env.PORT;
const db_login = process.env.DB_LOGIN;
const db_password = process.env.DB_PASSWORD;
const uri = `mongodb+srv://${db_login}:${db_password}@fitmate.unr7t.mongodb.net/app?retryWrites=true&w=majority&appName=FitMate`
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true} };

app.use(bodyParser.json());
app.use(fitmate_router)

app.listen(PORT, async () => {
    try {
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1});
        console.log("database connected");
    } catch (e) {
        console.error(e);
    }

    console.log(`api listening on ${PORT}`);
})