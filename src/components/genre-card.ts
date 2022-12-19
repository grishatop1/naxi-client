export const createCards = (genres: any, parent: HTMLElement) => {
    for (let [title_text, data] of Object.entries(genres)) {
        const main = document.createElement('div')
        const title = document.createElement('p')
        const now_playing = document.createElement('p') //to fetch
        
        main.className = `border-4 rounded-xl inline-block m-3 overflow-hidden w-[15em] h-[8em] shadow-xl`
        main.style.borderColor = data['color'];
        main.style.backgroundColor = data['color'];

        title.innerHTML = title_text;
        title.className = "font-bold text-white mt-2 ml-2";

        now_playing.innerHTML = "Playing: John Doe - Relax"
        now_playing.className = "text-gray-300 ml-3"

        main.appendChild(title);
        main.appendChild(now_playing);
        parent.appendChild(main);
    }
}