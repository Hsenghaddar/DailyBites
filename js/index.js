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

    // redirect
    setTimeout(function () {
        window.location.href = "./html/home.html";
    }, 3000 + 700); // 700ms matches CSS transition
});