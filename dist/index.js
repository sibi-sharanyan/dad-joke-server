"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var socket_io_1 = require("socket.io");
var body_parser_1 = __importDefault(require("body-parser"));
var dotenv_1 = __importDefault(require("dotenv"));
var http_1 = __importDefault(require("http"));
var cors_1 = __importDefault(require("cors"));
var axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
var PORT = process.env.PORT || 3001;
var app = (0, express_1.default)();
var server = http_1.default.createServer(app);
var io = new socket_io_1.Server(server, { cors: { origin: "*" } });
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", function (req, res) {
    res.send("<h1>Hello from the TypeScript world1!</h1>");
});
var counter = 1;
var socketNumberMap = new Map();
var jokeStreams = new Map();
var clientSubStreams = new Map();
var getAllClients = function () {
    var clients = [];
    var allClients = io.sockets.adapter.rooms.get("all-clients");
    allClients === null || allClients === void 0 ? void 0 : allClients.forEach(function (client) {
        clients.push(client);
    });
    return clients.map(function (client, ind) {
        return {
            name: "client ".concat(socketNumberMap.get(client)),
            id: client,
        };
    });
};
var getRandomJokeFromServer = function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1.default.get("https://icanhazdadjoke.com", {
                    headers: {
                        Accept: "application/json",
                        "User-Agent": "DadJokes",
                    },
                })];
            case 1:
                data = (_a.sent()).data;
                return [2 /*return*/, data.joke];
        }
    });
}); };
var initJokeStream = function (socket) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            jokeStreams.set(socket, setInterval(function () { return __awaiter(void 0, void 0, void 0, function () {
                var joke;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getRandomJokeFromServer()];
                        case 1:
                            joke = _a.sent();
                            console.log("joke from ", socket, joke);
                            io.to("joke-stream-" + socket).emit("joke", {
                                joke: joke,
                                fromClientId: "client ".concat(socketNumberMap.get(socket)),
                            });
                            return [2 /*return*/];
                    }
                });
            }); }, 5000));
        }
        catch (error) {
            console.log("error", error);
        }
        return [2 /*return*/];
    });
}); };
function mapToObj(inputMap) {
    var obj = {};
    inputMap.forEach(function (value, key) {
        obj[key] = value;
    });
    return obj;
}
io.on("connection", function (socket) {
    console.log("socket connected");
    socket.join("all-clients");
    // socket.join(`joke-stream-${socket.id}`); //Check if by default we listen to our jokes
    socketNumberMap.set(socket.id, counter++);
    initJokeStream(socket.id);
    io.to("all-clients").emit("all-clients", getAllClients());
    io.to("all-clients").emit("update-sub-streams", mapToObj(clientSubStreams));
    socket.on("add-client-to-joke-stream", function (data) {
        var clientSubStreamsArray = clientSubStreams.get(data.jokeStreamId) || [];
        //check if client is already in the stream
        if (clientSubStreamsArray.find(function (client) { return client.id === data.clientId; })) {
            console.log("client already in stream");
            return;
        }
        clientSubStreams.set(data.jokeStreamId, __spreadArray(__spreadArray([], clientSubStreamsArray, true), [
            {
                name: "client ".concat(socketNumberMap.get(data.clientId)),
                id: data.clientId,
            },
        ], false));
        socket.join("joke-stream-" + data.jokeStreamId);
        io.to("all-clients").emit("update-sub-streams", mapToObj(clientSubStreams));
    });
    socket.on("remove-client-from-stream", function (data) {
        var clientSubStreamsArray = clientSubStreams.get(socket.id) || [];
        clientSubStreams.set(data.jokeStreamId, clientSubStreamsArray.filter(function (client) { return client.id !== data.clientId; }));
        socket.leave("joke-stream-" + data.jokeStreamId);
        io.to("all-clients").emit("update-sub-streams", mapToObj(clientSubStreams));
    });
    socket.on("disconnect", function () {
        console.log("socket disconnected");
        socket.leave("all-clients");
        clearInterval(jokeStreams.get(socket.id));
        io.to("all-clients").emit("all-clients", getAllClients());
    });
});
server.listen(PORT, function () { return console.log("Running on ".concat(PORT, " \u26A1")); });
