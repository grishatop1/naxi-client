import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

import { fetch_metadata, is_element_in_viewport, hexToRgb } from "./utils"

export class Card {
    node?: HTMLElement
    title: string
    is_loading: boolean
    is_playing: boolean
    is_loading_metadata: boolean
    current_artist?: string
    current_song?: string
    color: string
    url: string
    metadata_url: string
    animationPulsing?: Animation
    constructor(title: string, color: string, url: string, metadata_url: string) {
        this.title = title;
        this.is_loading = true;
        this.is_playing = false;
        this.is_loading_metadata = false;
        this.color = color;
        this.url = url;
        this.metadata_url = metadata_url;

        this.set_metadata();
        this.setup_metadata_fetching();
    }
    set_loading_song() {
        this.node.querySelector('img').src = '/loading.svg'
    }
    set_loaded_song() {
        this.node.querySelector('img').src = '/stop.svg'
        this.start_pulsing_animation()
        this.is_playing = true;
    }
    set_errored() {
        this.is_playing = false;
        this.node.querySelector('img').src = '/play.svg'
        Toastify({
            text: "Network error",
            duration: 3000,
            newWindow: true,
            gravity: "top",
            position: "left"
        }).showToast()
    }
    set_normal() {
        this.node.querySelector('img').src = '/play.svg'
        this.stop_pulsing_animation()
        this.is_playing = false;
    }
    setup_metadata_fetching() {
        setInterval(async () => {
            if (this.is_loading_metadata) return;
            if (this.is_playing) {
                this.is_loading_metadata = true;
                const data = await this.set_metadata()
                this.is_loading_metadata = false;
                document.querySelector('#info-now-playing').innerHTML = data;
                document.title = `Naxi ${this.title} | ${this.current_artist} ${this.current_song}`
                return;
            }
            if (is_element_in_viewport(this.node)) {
                await this.set_metadata()
            }
        }, 3000)
    }
    async set_metadata() {
        const data = await fetch_metadata(this.metadata_url);
        if (data) {
            this.current_artist = data.artist;
            this.current_song = data.song;
            this.node.querySelector('#now_playing').innerHTML = data.artist + " " + data.song;
            return data.artist + " " + data.song;
        } else {
            this.current_artist = "Naxi Radio";
            this.current_song = this.title;
            this.node.querySelector('#now_playing').innerHTML = `Naxi Radio - ${this.title}`;
            return `Naxi Radio - ${this.title}`;
        }
    }
    start_pulsing_animation() {
        let colorRGB = hexToRgb(this.color)
        const keyframes = [
            { boxShadow: `0 0 0px 0px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.8)` },
            { boxShadow: `0 0 0px 10px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0)` },
            { boxShadow: `0 0 0px 10px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0)` },
        ];

        const timing = {
            duration: 1000,
            iterations: Infinity
        };

        this.animationPulsing = this.node.animate(keyframes, timing);
    }
    stop_pulsing_animation() {
        this.animationPulsing.cancel()
    }
}

export const createCardElement = (card: Card) => {
    const main = document.createElement('div')
    const title = document.createElement('p')
    const now_playing = document.createElement('p')
    const playstop_img = document.createElement('img')
    const dummy_1 = document.createElement('div')
    const dummy_2 = document.createElement('div')

    main.className = `border-4 rounded-xl inline-block m-3 overflow-hidden w-[15em] h-[8em] shadow-xl relative cursor-pointer group`
    main.style.borderColor = card.color;
    main.style.backgroundColor = card.color;

    title.innerHTML = card.title;
    title.className = 'font-bold text-white text-xl mt-2 ml-2 select-none';

    now_playing.innerHTML = 'Loading...'
    now_playing.className = 'text-white ml-2 z-[0] now-playing select-none relative whitespace-nowrap'
    now_playing.id = 'now_playing'

    dummy_1.className = 'brightness-75 absolute w-[15em] h-[8em] rotate-12 top-[100px] left-[150px]'
    dummy_1.style.backgroundColor = card.color;

    dummy_2.className = 'brightness-75 absolute w-[15em] h-[8em] top-[20px] left-[150px] rotate-[100deg]'
    dummy_2.style.backgroundColor = card.color;

    playstop_img.src = '/play.svg'
    playstop_img.className = 'absolute bottom-2 left-2 h-[2.5em] group-hover:scale-[1.10] transition-all select-none'


    main.appendChild(title);
    main.appendChild(now_playing);
    main.appendChild(dummy_1);
    main.appendChild(dummy_2);
    main.appendChild(playstop_img);

    return main;
}

// icons source https://www.svgrepo.com/collection/music-control-panel/