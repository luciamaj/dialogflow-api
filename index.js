const dialogflow = require('dialogflow');
const { struct } = require('pb-util');  

const projectId = 'provaapi-jrgakd';
const contextsClient = new dialogflow.ContextsClient({keyFilename: "new.json"});
const sessionClient = new dialogflow.SessionsClient({keyFilename: "new.json"});
const uuid = require('uuid');

//new context
let context;

// importo express
const express = require('express');
// creo l'app di express
const app = express();
// così gli dico quale cartella è la root della nostra applicazione
app.use(express.static('client'))
// specifico la porta su cui farò girare il server
const port = 3000
// quanto il mio url è vuto punta in automatico a /client/index.html
app.get('/', (req, res) => res.send('/'));
// fallback per il 404
app.use(function (req, res, next) {
    res.status(404).send("HUH SORRY! 404")
});

// questa è la variabile in cui salverò la connessione con il mio client

let server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log("new user connected");
    client = socket;

    socket.on('USER_MSG', (msg) => {
        console.log('utente ha inviato questo messaggio: ' + msg);
        sendMsg(msg);
    });
});

function sendQuery(sessionId, query, contexta) {
    const session = sessionClient.sessionPath(projectId, sessionId);

    const request = {
        session: session,
        queryInput: {
            text: {
                text: query,
                languageCode: 'en-US',
            },
        },
        queryParams: {
            contexts: [context] // You can pass multiple contexts if you wish
        }
    };

    return sessionClient.detectIntent(request);
}

async function sendMsg(msg) {
    const sessionId = uuid.v4();
    const responses = await sendQuery(sessionId, msg, {});

    console.log('Detected intent', responses[0].queryResult.outputContexts);
    const result = responses[0].queryResult;
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentText}`);
    client.emit('BOT_RESPONSE', result.fulfillmentText);

    if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
    } else {
        console.log(`  No intent matched.`);
    }
}

(async() => {
    const parameters = { // Custom parameters to pass with context
    welcome: true
    };

    const sessionId = 'my-session';
    context = await createContext(sessionId, 'whacky-context', parameters);
})();

async function createContext(sessionId, contextId, parameters, lifespanCount = 5) {
    const sessionPath = contextsClient.sessionPath(projectId, sessionId);
    const contextPath = contextsClient.contextPath(
        projectId,
        sessionId,
        contextId
    );

    const request = {
        parent: sessionPath,
        context: {
            name: contextPath,
            parameters: struct.encode(parameters),
            lifespanCount
        }
    };

    const [context] = await contextsClient.createContext(request);
    return context;
}

/*

socket.emit('message', "this is a test"); //sending to sender-client only
socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
io.emit('message', "this is a test"); //sending to all clients, include sender
io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
socket.emit(); //send to all connected clients
socket.broadcast.emit(); //send to all connected clients except the one that sent the message
socket.on(); //event listener, can be called on client to execute on server
io.sockets.socket(); //for emiting to specific clients
io.sockets.emit(); //send to all connected clients (same as socket.emit)
io.sockets.on() ; //initial connection from a client.

*/