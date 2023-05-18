const webSocket = new WebSocket("ws://127.0.0.1:3000");

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data));
};

function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => {
                    createAndSendAnswer();
                });
            break;
        case "candidate":
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            break;
    }
}

function createAndSendAnswer() {
    peerConnection.createAnswer()
        .then((answer) => {
            return peerConnection.setLocalDescription(answer);
        })
        .then(() => {
            sendData({
                type: "send_answer",
                answer: peerConnection.localDescription.toJSON()
            });
        })
        .catch(error => {
            console.log(error);
        });
}

function sendData(data) {
    data.username = username;
    webSocket.send(JSON.stringify(data));
}

let localStream;
let peerConnection;
let username;

function joinCall() {
    username = document.getElementById("username-input").value;
    document.getElementById("video-call-div").style.display = "inline";
    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 36,
            width: {
                min: 480
            }
        }
    })
        .then(stream => {
            localStream = stream;
            document.getElementById("local-video").srcObject = stream;

            const configuration = {
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "turn:turn", username: "user", credential: "password" }
                ]
            };

            peerConnection = new RTCPeerConnection(configuration);
            peerConnection.addStream(localStream);
        })
        .catch(error => {
            console.log(error);
        });
}
