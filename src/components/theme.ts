import anime from "animejs";

export let enableThemeSwitching = () => {
    let current_theme = 'light';
    const theme_btn = document.getElementById('theme-btn');
    theme_btn.addEventListener('click', () => {
        if (current_theme === "light") {
            document.documentElement.classList.add("dark")
            current_theme = "dark";

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
        } else {
            document.documentElement.classList.remove("dark")
            current_theme = "light";

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

    });

    return current_theme;
}