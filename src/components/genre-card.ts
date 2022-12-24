export const createCards = (genres: any, parent: HTMLElement): Array<HTMLElement> => {
    const cards = [];
    for (let [title_text, data] of Object.entries(genres)) {
        const main = document.createElement('div')
        const title = document.createElement('p')
        const now_playing = document.createElement('p') //to fetch
        const playstop_img = document.createElement('img')
        const dummy_1 = document.createElement('div')
        const dummy_2 = document.createElement('div')
        
        main.className = `border-4 rounded-xl inline-block m-3 overflow-hidden w-[15em] h-[8em] shadow-xl relative cursor-pointer group`
        main.style.borderColor = data['color'];
        main.style.backgroundColor = data['color'];

        title.innerHTML = title_text;
        title.className = "font-bold text-white text-xl mt-2 ml-2 select-none";

        now_playing.innerHTML = "Loading..."
        now_playing.className = "text-white ml-2 z-[0] now-playing relative whitespace-nowrap"

        dummy_1.className = "brightness-75 absolute w-[15em] h-[8em] rotate-12 top-[100px] left-[150px]"
        dummy_1.style.backgroundColor = data['color'];

        dummy_2.className = "brightness-75 absolute w-[15em] h-[8em] top-[20px] left-[150px] rotate-[100deg]"
        dummy_2.style.backgroundColor = data['color'];

        playstop_img.src = "/play.svg"
        playstop_img.className = "absolute bottom-2 left-2 h-[2.5em] group-hover:scale-[1.10] transition-all"
        
        
        main.appendChild(title);
        main.appendChild(now_playing);
        main.appendChild(dummy_1);
        main.appendChild(dummy_2);
        main.appendChild(playstop_img);
        

        parent.appendChild(main);
        cards.push([main, data]);
    }
    return cards;
}

// icons source https://www.svgrepo.com/collection/music-control-panel/