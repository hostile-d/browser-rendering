var blendTimer = undefined;

Reveal.addEventListener( 'blend', function() {
    var blendModes = [
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

    var screenshot = document.querySelector(".js-blend-screenshot");
    var blendButton = document.querySelector(".js-toggle-blend");

    blendTimer = setInterval(blendToggle, 1000);

    function blendToggle() {
        var random = blendModes[Math.floor(Math.random()*blendModes.length)];
        screenshot.style.backgroundBlendMode = random;
    }

}, false );

Reveal.addEventListener( 'afterBlend', function() {
    clearInterval(blendTimer);
}, false );
