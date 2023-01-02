import anime from "animejs";

export let switch_theme = (current_theme: string) => {
    if (current_theme === "light") {
        current_theme = "dark";
        set_dark_theme();
    } else {
        current_theme = "light";
        set_light_theme();
    }
    return current_theme;
}

export let set_dark_theme = () => {
    document.documentElement.classList.add("dark")
    document.documentElement.classList.remove("light")

    anime({
        targets: "#moon",
        translateX: "-3em"
    })
    anime({
        targets: "#sun",
        translateX: "0em"
    })
    anime({
        targets: "#theme-btn",
        backgroundColor: "#fff"
    })
}

export let set_light_theme = () => {
    document.documentElement.classList.add("light")
    document.documentElement.classList.remove("dark")

    anime({
        targets: "#moon",
        translateX: "0em"
    })
    anime({
        targets: "#sun",
        translateX: "3em"
    })
    anime({
        targets: "#theme-btn",
        backgroundColor: "#202029"
    })
}