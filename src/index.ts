import express, { Express, Request, Response } from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import axios from "axios";
import { IAddToStreamReq, IClient } from "./types";
dotenv.config();

const PORT = process.env.PORT || 3001;
const app: Express = express();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello from the TypeScript world1!</h1>");
});

let counter = 1;
const socketNumberMap = new Map<string, number>();
const jokeStreams = new Map<string, any>();
const clientSubStreams = new Map<string, IClient[]>();

const getAllClients = () => {
  let clients: string[] = [];

  let allClients = io.sockets.adapter.rooms.get("all-clients");
  allClients?.forEach((client) => {
    clients.push(client);
  });

  return clients.map((client, ind) => {
    return {
      name: `client ${socketNumberMap.get(client)}`,
      id: client,
    };
  });
};

const getRandomJokeFromServer = async (): Promise<string> => {
  const { data } = await axios.get("https://icanhazdadjoke.com", {
    headers: {
      Accept: "application/json",
      "User-Agent": "DadJokes",
    },
  });
  return data.joke;
};

const initJokeStream = async (socket: string) => {
  try {
    jokeStreams.set(
      socket,
      setInterval(async () => {
        const joke = await getRandomJokeFromServer();
        console.log("joke from ", socket, joke);
        io.to("joke-stream-" + socket).emit("joke", {
          joke: joke,
          fromClientId: `client ${socketNumberMap.get(socket)}`,
        });
      }, 5000)
    );
  } catch (error) {
    console.log("error", error);
  }
};

function mapToObj(inputMap: Map<string, IClient[]>) {
  let obj: {
    [key: string]: IClient[];
  } = {};

  inputMap.forEach(function (value, key) {
    obj[key] = value;
  });

  return obj;
}

io.on("connection", (socket) => {
  console.log("socket connected");

  socket.join(`all-clients`);
  // socket.join(`joke-stream-${socket.id}`); //Check if by default we listen to our jokes
  socketNumberMap.set(socket.id, counter++);

  initJokeStream(socket.id);

  io.to(`all-clients`).emit("all-clients", getAllClients());
  io.to(`all-clients`).emit("update-sub-streams", mapToObj(clientSubStreams));

  socket.on("add-client-to-joke-stream", (data: IAddToStreamReq) => {
    const clientSubStreamsArray = clientSubStreams.get(data.jokeStreamId) || [];

    //check if client is already in the stream
    if (clientSubStreamsArray.find((client) => client.id === data.clientId)) {
      console.log("client already in stream");
      return;
    }

    clientSubStreams.set(data.jokeStreamId, [
      ...clientSubStreamsArray,
      {
        name: `client ${socketNumberMap.get(data.clientId)}`,
        id: data.clientId,
      },
    ]);

    socket.join("joke-stream-" + data.jokeStreamId);

    io.to(`all-clients`).emit("update-sub-streams", mapToObj(clientSubStreams));
  });

  socket.on("remove-client-from-stream", (data: IAddToStreamReq) => {
    const clientSubStreamsArray = clientSubStreams.get(socket.id) || [];

    clientSubStreams.set(
      data.jokeStreamId,
      clientSubStreamsArray.filter((client) => client.id !== data.clientId)
    );

    socket.leave("joke-stream-" + data.jokeStreamId);

    io.to(`all-clients`).emit("update-sub-streams", mapToObj(clientSubStreams));
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");

    socket.leave(`all-clients`);

    clearInterval(jokeStreams.get(socket.id));

    io.to(`all-clients`).emit("all-clients", getAllClients());
  });
});

server.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
