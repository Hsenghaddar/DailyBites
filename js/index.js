document.addEventListener("DOMContentLoaded", function () {
    // Start animation
    let textContainer = document.querySelector(".text-container");
    let pageElements = document.querySelectorAll(".page-transition");

    if (textContainer) {
        textContainer.classList.add("show");
    }

    setTimeout(function () {
        // fade-out
        pageElements.forEach(function (el) {
            el.classList.add("fade-out");
        });
    }, 3000); // 1000 ms = 1 seconds
    const scriptUrl = document.currentScript
        ? document.currentScript.src
        : window.location.href

    const htmlBase = new URL('../html/', scriptUrl)

    function redirectToHome() {
        const homeUrl = new URL('home.html', htmlBase)
        window.location.href = homeUrl.href
    }
    setTimeout(function () {
        redirectToHome()
    }, 3000 + 700); // 700ms matches CSS transition
});