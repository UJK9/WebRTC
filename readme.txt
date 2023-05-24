WebRTC allows audio and video streaming across different browsers. Only prerequisite is that both sender and receiver should be connected to the same WebSocket IP which in this case is the local ip of the host.  

First of all we run 'node server.js' in terminal which activates a WebSocket server and when the server starts listening.

We run sender.html in a browser which will send messages to the server which will be handled acc to its type. 
 
Further 'server.js'Utility Functions:

sendData(): Sends data to a specified WebSocket connection by calling conn.send() with the serialized JSON data.
findUser(): Finds a user in the users array based on their username.

Running sender.html wil establish a WebSocket connection, handle signaling data, send username and required data to the server via WebSocket. Then it will start the video call with 'startCall' function.

It uses 'navigator.mediaDevices.getUserMedia' to request access to the user's audio and video streams.

The 'ontrack' event handler is set to display the remote stream in the video element with the ID "remote-video".

The 'onicecandidate' event handler is set to send ICE candidates to the server using sendData when they become available.

Finally, the 'createAndSendOffer' function is called to create an offer and send it to the server.


When receiver.html is opened it pretty much acts the same way as server.html.
- It connects to the Websocket server
- Handles Signaling data
- creates and sends answer
- Joins the call

Styles.css is implemented to make the interface look better. 
