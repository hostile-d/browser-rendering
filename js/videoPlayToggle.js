Reveal.addEventListener( 'slidechanged', function( e ) {
    var videos = e.currentSlide.querySelectorAll('.js-play-toggle');
    videos.forEach(v => v.play());
});