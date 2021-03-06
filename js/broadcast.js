
var connection = new RTCMultiConnection();
var predefinedRoomId = 'myRoomId';
var connectTimer = null;
var video = document.querySelector('.js-broadcast-video');
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
    video.srcObject = event.stream;
    video.controls = false;

    if(event.type === 'local') {
        video.muted = true;
    }
    setTimeout(function() {
        video.play();
    }, 2000);

    video.id = event.streamid;

};
connection.onstreamended = function(event) {
    var video = document.querySelector('.js-broadcast-video');
};

manageControls();

function keepCheckingForRoom() {
    connection.checkPresence(predefinedRoomId, function(isRoomExist, roomid) {
        if(connection.isInitiator) {
            console.log('You are room owner');
            return;
        }

        if(connection.peers[connection.sessionid]) {
            setTimeout(keepCheckingForRoom, 3000);
            console.log('Room owner is in the room');
            return;
        }
        if (isRoomExist === true) {
            connection.join(roomid);
            console.log('Rejoined the room');
            setTimeout(keepCheckingForRoom, 3000);
            return;
        }

        console.log('Room owner left. Rechecking for the room...');
        setTimeout(keepCheckingForRoom, 3000);
    });
};

video.addEventListener('play', function() {
    this.classList.add("is-no-bg");
    document.querySelector('.js-travolta').classList.remove('is-hidden');
})

function manageControls() {
    if(Reveal.getQueryHash().s || Reveal.isSpeakerNotes()) {
        var roomBtn = document.querySelector('.js-broadcast-open');
        roomBtn.addEventListener('click', function() {
            connection.open( predefinedRoomId );
        });
    } else {
        document.querySelector('.js-broadcast-open').style.display = 'none';
        connectTimer = setTimeout(keepCheckingForRoom, 3000);
    }
}
