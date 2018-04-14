var isBroadcast = false;
Reveal.addEventListener( 'broadcast', handleBroadcast, false );

function handleBroadcast(e) {
    isBroadcast = true;
	Reveal.addEventListener( 'slidechanged', handleSlideChange);
}

function handleSlideChange(e) {
    if(!isBroadcast) {
        Reveal.removeEventListener( 'slidechanged', handleSlideChange);
        if (connection.isInitiator) {
            // use this method if you did NOT set "autoCloseEntireSession===true"
            // for more info: https://github.com/muaz-khan/RTCMultiConnection#closeentiresession
            connection.closeEntireSession();
            connection.attachStreams.forEach(function(localStream) {
                localStream.stop();
            });
        } else {
            connection.leave();
        }
        connection.close();
    } else {
        isBroadcast = false;
    }
}