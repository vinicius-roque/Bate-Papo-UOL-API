import express from "express";
import cors from "cors";

const server = express();
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
    res.send("OK");
});

server.listen(5000, () => console.log("Listening on port 5000"));