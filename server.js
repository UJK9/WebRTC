const Socket = require("websocket").server;
const http = require("http");

const server = http.createServer((req, res) => {});

server.listen(3000, () => {
    console.log("Listening on port 3000...");
});

const webSocket = new Socket({ httpServer: server });

const users = [];

webSocket.on("request", (req) => {
    const connection = req.accept();
    connection.on("message", (message) => {
        try {
            const data = JSON.parse(message.utf8Data);
            const user = findUser(data.username);

            switch (data.type) {
                case "store_user":
                    if (user) {
                        return;
                    }
                    const newUser = {
                        conn: connection,
                        username: data.username,
                        offer: null,
                        candidates: [],
                    };
                    users.push(newUser);
                    console.log(newUser.username);
                    break;
                case "store_offer":
                    if (!user) {
                        return;
                    }
                    user.offer = data.offer;
                    break;
                case "store_candidate":
                    if (!user) {
                        return;
                    }
                    user.candidates.push(data.candidate);
                    break;
                case "send_answer":
                    if (!user) {
                        return;
                    }
                    sendData(
                        {
                            type: "candidate",
                            candidate: data.candidate,
                        },
                        user.conn
                    );
                    break;
                case "join_call":
                    if (!user) {
                        return;
                    }
                    if (user.offer) {
                        sendData(
                            {
                                type: "offer",
                                offer: user.offer,
                            },
                            connection
                        );
                    }
                    user.candidates.forEach((candidate) => {
                        sendData(
                            {
                                type: "candidate",
                                candidate: candidate,
                            },
                            connection
                        );
                    });
                    break;
            }
        } catch (error) {
            console.error("Error parsing or processing message:", error);
        }
    });

    connection.on("close", (reason, description) => {
        const index = users.findIndex((user) => user.conn === connection);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

function sendData(data, conn) {
    conn.send(JSON.stringify(data));
}

function findUser(username) {
    return users.find((user) => user.username === username);
}
