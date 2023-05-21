const ipAddress = "192.168.100.75";
const webSocket = new WebSocket("ws://" + ipAddress + ":3000");

webSocket.onopen = () => {
    console.log("WebSocket connection established.");
};

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data));
};

webSocket.onerror = (error) => {
    console.error("WebSocket error:", error);
};

function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
                .then(() => {
                    return createAndSendAnswer();
                })
                .catch((error) => {
                    console.error("Error setting remote description:", error);
                });
            break;
        case "candidate":
            peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate))
                .catch((error) => {
                    console.error("Error adding ICE candidate:", error);
                });
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
        .catch((error) => {
            console.error("Error creating and sending answer:", error);
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
            frameRate: 24,
            width: {
                min: 480,
                ideal: 720,
                max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    })
    .then((stream) => {
        localStream = stream;
        document.getElementById("remote-video").srcObject = localStream;

        const configuration = {
            iceServers: [
                { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
                { urls: "turn:turn", username: "user", credential: "password" }
            ]
        };

        peerConnection = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(track =>
            peerConnection.addTrack(track, localStream));
        peerConnection.ontrack = (e) => {
            document.getElementById("remote-video").srcObject = e.stream;
        };
        peerConnection.onicecandidate = (e) => {
            if (e.candidate == null)
                return;
            sendData({
                type: "send_candidate",
                candidate: e.candidate
            });
        };

        return peerConnection.createOffer();
    })
    .then((offer) => {
        return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
        sendData({
            type: "store_offer",
            offer: peerConnection.localDescription.toJSON()
        });
    })
    .catch((error) => {
        console.error("Error accessing media devices:", error);
    });
}
