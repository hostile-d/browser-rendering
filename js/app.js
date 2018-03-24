Reveal.initialize({
    transition: 'convex',
    dependencies: [

        // Interpret Markdown in <section> elements
        { src: 'js/plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
        { src: 'js/plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },

        // Syntax highlight for <code> elements
        { src: 'js/plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },

        // Zoom in and out with Alt+click
        { src: 'js/plugin/zoom-js/zoom.js', async: true },

        // Speaker notes
        { src: 'js/plugin/notes/notes.js', async: true },

        // MathJax
        { src: 'js/plugin/math/math.js', async: true }
    ]
});