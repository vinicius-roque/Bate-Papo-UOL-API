import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const server = express();
server.use(express.json());
server.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);

server.post('/participants', (req, res) => {
    const { name } = req.body;

    if(name === "") {
        res.status(422);
    }

    res.send(name);
});

server.get('/participants', (req, res) => {
    const { name } = req.body;
    res.send(name);
});

server.post('/messages', (req, res) => {
    const { to, text, type } = req.body;
    
    if((to === "" || text === "") || (type !== "message" || type !== "private_message") || from !== true) {
        res.status(422);
        return;
    }

    res.status(201);
});

server.get('/messages', (req, res) => {
    const { text } = req.body;
    res.send(text);
});

server.post('/status', (req, res) => {
    const { User } = req.header;
    
    if(User !== true) {
        res.status(404);
        return;
    }
    
    res.send(200);
});

server.listen(5000, () => console.log("Listening on port 5000"));