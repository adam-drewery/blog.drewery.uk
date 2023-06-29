window.initializeMenu = () => {
    // //metis menu
    // $("#side-menu").metisMenu();
    //
    // // Left menu collapse
    // $('.button-menu-mobile').on('click', function (event) {
    //     event.preventDefault();
    //     $("body").toggleClass("enlarged");
    // });
}

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

window.fitImages = () => {
    const images = document.querySelectorAll('.container img');
    for (let i = 0; i < images.length; i++) {
        images[i].classList.add('img-fluid');
    }
}

window.loadUtterances = () => {
    // Get existing Utterances comments and script elements
    const utterances = document.querySelector('.utterances');
    const utterancesScript = document.querySelector('script[src="https://utteranc.es/client.js"]');

    // If they exist, remove them
    if (utterances) utterances.remove();
    if (utterancesScript) utterancesScript.remove();

    // Create a new script element for Utterances
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.setAttribute("repo", "adam-drewery/blog");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");

    // Get the comments div and append the script to it
    const commentsDiv = document.getElementById("comments");
    if (commentsDiv) commentsDiv.appendChild(script);
}