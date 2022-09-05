import express from "express";
import cors from "cors";
import joi from "joi";
import dayjs from "dayjs";
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config();

const server = express();
server.use(express.json());
server.use(cors());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
const dbName = 'liveChat';
mongoClient.connect().then(() => db = mongoClient.db(dbName));

const participantsSchema = joi.object({
    name: joi.string().min(1).required()
});

const messagesSchema = joi.object({
    to: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    type: joi.string().valid("message", "private_message").required(),
    
});

server.post('/participants', async (req, res) => {
    const participantsValidation = participantsSchema.validate(req.body, { abortEarly: false });
    if(participantsValidation.error) {
        const errors = participantsValidation.error.details.map(error => error.message);
        res.status(422).send(errors);
        return;
    }

    const { name } = req.body;

    if(await checkExistingParticipant(name)) {
        return res.sendStatus(409)
    }

    try {
        await db.collection("participants").insertOne({
            name, 
            lastStatus: catchTime()
        })
        await db.collection("messages").insertOne({
            from: name,
            to: "Todos", 
            text: "entra na sala...",
            type: "status",
            time: catchTime(true)
        });

        res.sendStatus(201)
    } catch (error) {
        res.status(500).send(error);
    }

    res.send(name);
});

async function checkExistingParticipant(name) {
    let answer;
    try {
        const existingParticipant = await db.collection("participants").findOne({name});

        if(existingParticipant !== null) {
            answer = true;
        } else {
            answer = false;
        }
    } catch (error) {
        console.log(error);
        response = error;
    }
    return answer;
}

function catchTime(formatted = false) {
    const time = Date.now();
    
    if(formatted) {
        return dayjs(time).format("HH:mm:ss");
    }
    return time;
}

server.get('/participants', async (req, res) => {
    try {
        const dbAnswer = await db.collection("participants").find().toArray();
        res.send(dbAnswer);
    } catch (error) {
        res.status(500).send(error);
    }
});

server.post('/messages', async (req, res) => {
    const messageValidation = messagesSchema.validate(req.body, { abortEarly: false });
    if(messageValidation.error) {
        const errors = messageValidation.error.details.map(error => error.message);
        res.status(422).send(errors);
        return; 
    }

    const { user } = req.headers;
    const { to, text, type } = req.body;

    if(!await checkExistingParticipant(user)) {
        res.sendStatus(422);
        return;
    }

    try {
        await db.collection("messages").insertOne({
            from: user,
            to,
            text,
            type,
            time: catchTime(true)
        });
        res.sendStatus(201);
    } catch (error) {
        res.status(500).send(error);
    }
});

server.get('/messages', async (req, res) => {
    const { limit } = req.query;
    const { user } = req.headers;

    try {
        const dbMessages = await db.collection('messages').find().toArray();
        const selectedMessages = dbMessages.filter(message => message.to === user || message.from === user|| message.to === "Todos");
        const lastMessages = limit ? selectedMessages.slice(-limit) : selectedMessages;

        res.send(lastMessages);
    } catch (error) {
        res.status(500).send(error);
    }
});

server.post('/status', async (req, res) => {
    const { user } = req.headers;
    
    if(await checkExistingParticipant(user)) {
        res.sendStatus(404);
        return;
    }

    try {
        await db.collection("participants").updateOne(
            {name: user},
            { $set: {lastStatus: catchTime()}},
            function (erro, res) {}
        );
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error)
    }
});

server.listen(5000, () => console.log("Listening on port 5000"));