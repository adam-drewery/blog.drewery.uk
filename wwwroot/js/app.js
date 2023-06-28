(function($) {

    'use strict';

    function initMetisMenu() {
        //metis menu
        $("#side-menu").metisMenu();
    }

    function initLeftMenuCollapse() {
        // Left menu collapse
        $('.button-menu-mobile').on('click', function (event) {
            event.preventDefault();
            $("body").toggleClass("enlarged");
        });
    }

    function init() {
        initMetisMenu();
        initLeftMenuCollapse();
    }
    init();

})(jQuery)

window.highlightCode = () => { hljs.highlightAll(); };

window.setupPhoto = () => {
    let photo = document.getElementById('photo'); // get your photo element

    let angle = 0; // starting angle
    let speed = 0.01; // starting speed in radians per frame
    let requestID; // request ID for canceling the animation frame
    let isMouseOver = false; // flag to indicate whether the mouse is over the image

    function rotate() {
        angle += speed; // increase the angle by speed
        speed += 0.0001; // increase the speed to accelerate rotation

        photo.style.transform = `rotate(${angle}rad)`; // rotate the photo by the current angle

        if (isMouseOver) { // if the mouse is over the photo, keep accelerating
            requestID = requestAnimationFrame(rotate);
        } else { // if the mouse is not over the photo, start decelerating
            requestID = requestAnimationFrame(decelerate);
        }
    }

    function decelerate() {
        angle += speed; // increase the angle by speed
        speed -= 0.0001; // decrease the speed to decelerate rotation
        if (speed < 0) speed = 0; // prevent speed from becoming negative

        photo.style.transform = `rotate(${angle}rad)`; // rotate the photo by the current angle

        if (speed > 0) { // if the photo is still rotating, keep decelerating
            requestID = requestAnimationFrame(decelerate);
        }
    }

    photo.onmouseover = function() { // when mouse is over the photo
        isMouseOver = true;
        requestID = requestAnimationFrame(rotate); // start rotating
    };

    photo.onmouseout = function() { // when mouse leaves the photo
        // set flag to false and start decelerating
        isMouseOver = false;
    };
}