document.getElementById("header-button-file").addEventListener("click", function () {

    // Nothing is selected
    if (!document.querySelector(".is-on")) {
        document.getElementById("setting-panel").classList.remove("hidden");
        this.classList.add("is-on");
        document.getElementById("settings-menu-file").classList.remove("transparent");
    }

    // File is already selected
    else if (this.classList.contains("is-on")) {
        document.getElementById("setting-panel").classList.add("hidden");
        this.classList.remove("is-on");
        document.querySelectorAll(".settings-menu").forEach(element => {
            element.classList.add("transparent");
        });
    }
    // Another menu is selected
    else {
        document.querySelectorAll(".is-on").forEach(element => {
            element.classList.remove("is-on");

        });
        this.classList.add("is-on");
        document.querySelectorAll(".settings-menu").forEach(element => {
            element.classList.add("transparent");
        });
        document.getElementById("settings-menu-file").classList.remove("transparent");
    }
});

document.getElementById("header-button-layout").addEventListener("click", function () {

    // Nothing is selected
    if (!document.querySelector(".is-on")) {
        document.getElementById("setting-panel").classList.remove("hidden");
        this.classList.add("is-on");
        document.getElementById("settings-menu-layout").classList.remove("transparent");
    }

    // Layout is already selected
    else if (this.classList.contains("is-on")) {
        document.getElementById("setting-panel").classList.add("hidden");
        this.classList.remove("is-on");
        document.querySelectorAll(".settings-menu").forEach(element => {
            element.classList.add("transparent");
        });
    }
    // Another menu is selected
    else {
        document.querySelectorAll(".is-on").forEach(element => {
            element.classList.remove("is-on");
        });
        this.classList.add("is-on");
        document.querySelectorAll(".settings-menu").forEach(element => {
            element.classList.add("transparent");
        });
        document.getElementById("settings-menu-layout").classList.remove("transparent");
    }
});
