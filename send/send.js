const webSocket = new WebSocket("ws://127.0.0.1:3000");

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data){
    switch(data.type){
        case "answer":
            peerConnection.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConnection.addIceCandidate(data.candidate)
    }
}
let username

function SendUsername() {
    username = document.getElementById("username-input").value 
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}

let localStream
let peerConnection

function startCall() {
    document.getElementById("video-call-div").style.display = "inline"
    
    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 36, 
            width: {
                min: 480, ideal: 720, max: 1200
            },
            aspectRatio: 1.33333
        },
        audio: true
    }).then((stream) => {
        localStream = stream;
        document.getElementById("local-video").srcObject = localStream;
    
        let configuration = {
            iceServers : [
                {
                    "urls": ["stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }
        peerConnection = new RTCPeerConnection(configuration);
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        
        peerConnection.ontrack = (e) => {
            document.getElementById("remote-video").srcObject = e.streams[0];
        }

        peerConnection.onicecandidate = (( e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })
        createAndSendOffer();
    }).catch((error) => {
        console.log(error)
    });
}

function createAndSendOffer(){
    peerConnection.createOffer().then((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })
        peerConnection.setLocalDescription(offer);
    }).catch((error) => {
        console.log(error)
    });
}
    
let isAudio = true;
function muteAudio() {
    isAudio = !isAudio;
    localStream.getAudioTracks()[0].enabled = isAudio;
}

let isVideo = true;
function muteVideo() {
    isVideo = !isVideo;
    localStream.getVideoTracks()[0].enabled = isVideo;
}
