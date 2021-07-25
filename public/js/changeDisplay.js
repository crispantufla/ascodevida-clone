function changeDisplay(id) {
    let element = document.getElementById(id);
    let display = getComputedStyle(element).display;

    if (display == "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}