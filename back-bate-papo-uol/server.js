import express from "express";
import cors from "cors";

const server = express();
server.use(express.json());
server.use(cors());

server.post('/participants', (req, res) => {
    const { name } = req.body;

    if(name === "") {
        res.status(422);
    }

    res.send(name);
});

server.get('/participants', (req, res) => {
    res.send();
});

server.post('/messages', (req, res) => {
    const { to, text, type } = req.body;
    
    req.header(User);

    if((to === "" || text === "") || (type !== "message" || type !== "private_message") || from === false) {
        res.status(422);
    }

    res.status(201);
});

server.listen(5000, () => console.log("Listening on port 5000"));