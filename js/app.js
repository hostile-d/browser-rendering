Reveal.initialize({
    transition: 'convex',
    multiplex: {
        secret: Reveal.getQueryHash().s || null, // null so the clients do not have control of the master presentation
        id: '8a811ed19082aa65', // id, obtained from socket.io server
        url: 'https://reveal-socket-io-server.herokuapp.com' // Location of socket.io server
    },
    broadcast: {
        // Set master password to "123456"
        secret: '$2a$05$hhgakVn1DWBfgfSwMihABeYToIBEiQGJ.ONa.HWEiNGNI6mxFCy8S', 
        // Configure RTCMultiConnection
        connection: {
          socketURL: 'https://revealjs-broadcast.herokuapp.com/'
        },
        session: {
            audio: false
        }
    },
    dependencies: [
        //server
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js', async: true },
        
        { src: Reveal.getQueryHash().s ?
            'plugin/multiplex/master.js' :
            'plugin/multiplex/client.js', async: true },
        
        // Syntax highlight for <code> elements
        
        
        { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },

        // Speaker notes
        // { src: Reveal.getQueryHash().s ? 'plugin/notes-server/client.js' : '', async: true },


        // broadcast
        { src: 'plugin/broadcast/RTCMultiConnection.min.js'},
        { src: 'plugin/broadcast/bCrypt.js'},
        { src: 'plugin/broadcast/broadcast.js'},
    ],
});