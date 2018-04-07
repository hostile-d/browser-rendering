var connection = new RTCMultiConnection();
var predefinedRoomId = 'myRoomId';
var connectTimer = null;
// this line is VERY_important
connection.socketURL = 'https://rtc-multi-connection-server.herokuapp.com/';

// all below lines are optional; however recommended.

connection.session = {
    audio: true,
    video: true,
    oneway: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
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

    video.id = event.streamid;

};
connection.onstreamended = function(event) {

    var video = document.querySelector('.js-broadcast-video');
    if (video) {
        video.pause();
    }
};
function manageControls() {
    if(Reveal.getQueryHash().s) {
        var controls = document.querySelector('.js-broadcast-controls');
        var roomBtn = document.createElement('button');
        controls.appendChild(roomBtn);
        roomBtn.classList.add('js-broadcast-open');
        roomBtn.innerText = "Open room";
        roomBtn.addEventListener('click', function() {
            this.disabled = true;
            connection.open( predefinedRoomId );
        });
    } else {
        connectTimer = setTimeout(checkingForRoom, 2000);
    }
}
manageControls();

function checkingForRoom() {
    connection.checkPresence(predefinedRoomId, function(isRoomEists, predefinedRoomId) {
        if (isRoomEists) {
            connection.join(predefinedRoomId);
            clearInterval(connectTimer);
            return;
        }
        setTimeout(checkingForRoom, 2000);
    });
}