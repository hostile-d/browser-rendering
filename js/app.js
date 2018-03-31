Reveal.initialize({
    transition: 'convex',
    multiplex: {
        secret: Reveal.getQueryHash().s || null, // null so the clients do not have control of the master presentation
        id: '8a811ed19082aa65', // id, obtained from socket.io server
        url: 'https://reveal-socket-io-server.herokuapp.com' // Location of socket.io server
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
        { src: 'plugin/notes/notes.js', async: true },
        { src: 'plugin/notes-server/client.js', async: true }
    ],
});