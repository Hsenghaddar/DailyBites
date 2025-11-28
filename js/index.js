document.addEventListener("DOMContentLoaded", function () {
    let textContainer = document.querySelector(".text-container");
    let pageElements = document.querySelectorAll(".page-transition");
    if (textContainer) {
        textContainer.classList.add("show");
    }
    setTimeout(function () {
        pageElements.forEach(function (el) {
            el.classList.add("fade-out");
        });
    }, 1000); 
    setTimeout(function () {
        window.location.href = "./html/home.html";
    }, 1000 + 400); 
});