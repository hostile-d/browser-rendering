
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
    if (video) {
        video.pause();
    }
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


function manageControls() {
    if(Reveal.getQueryHash().s) {
        var roomBtn = document.querySelector('.js-broadcast-open');
        roomBtn.addEventListener('click', function() {
            this.disabled = true;
            connection.open( predefinedRoomId );
        });
    } else {
        document.querySelector('.js-broadcast-controls').style.display = 'none';
        connectTimer = setTimeout(keepCheckingForRoom, 3000);
    }
}


document.querySelector('.js-show-gif').addEventListener('click', function (evt) {
    document.querySelector('.js-travolta').style.display = 'block';
})
