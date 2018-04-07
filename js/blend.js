Reveal.addEventListener( 'ready', function() {
    const constraints = {
        video: true
    };

    const blendModes = [
        "normal",
        "multiply",
        "screen",
        "overlay",
        "darken",
        "lighten",
        "color-dodge",
        "color-burn",
        "hard-light",
        "soft-light",
        "difference",
        "exclusion",
        "hue",
        "saturation",
        "color",
        "luminosity"
    ];

    const   video = document.querySelector('.js-broadcast-video'),
            takeScreenshot = document.querySelector('.js-take-screenshot'),
            canvas = document.createElement('canvas'),
            screenshot = document.querySelector(".js-blend-screenshot"), 
            gif = document.querySelector(".js-travolta").currentSrc,
            blendButton = document.querySelector(".js-toggle-blend");


    takeScreenshot.addEventListener("click", handleClick);

    function handleClick(e) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        screenshot.style.width = "100%"
        screenshot.style.height = "100%";

        canvas.getContext('2d').drawImage(video, 0, 0);
        var blob = canvas.toDataURL('image/webp');
        var gif = document.querySelector(".js-travolta").currentSrc;
        screenshot.style.backgroundImage = `url(${gif}), url(${blob})`;
        e.target.style.display = "none";

        blendButton.addEventListener("click", blendToggle)
    }

    function blendToggle() {
        var random = blendModes[Math.floor(Math.random()*blendModes.length)];
        screenshot.style.backgroundBlendMode = random;
    }
}, false );
