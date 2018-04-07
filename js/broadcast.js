var connection = new RTCMultiConnection();

// this line is VERY_important
connection.socketURL = 'https://rtc-multi-connection-server.herokuapp.com/';

// all below lines are optional; however recommended.

connection.session = {
    audio: false,
    video: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: true
};


connection.onstream = function(event) {
    event.mediaElement.removeAttribute('src');
    event.mediaElement.removeAttribute('srcObject');

    var video = document.querySelector('.js-broadcast-video');
    video.srcObject = event.stream;

    video.controls = false;

    if(event.type === 'local') {
        video.muted = true;
    }

    setTimeout(function() {
        video.play();
    }, 5000);
};

var predefinedRoomId = 'YOUR_Name';

document.getElementById('btn-open-room').onclick = function() {
    this.disabled = true;
    connection.open( predefinedRoomId );
};

document.getElementById('btn-join-room').onclick = function() {
    this.disabled = true;
    connection.join( predefinedRoomId );
};