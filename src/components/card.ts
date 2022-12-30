import Toastify from 'toastify-js'
import "toastify-js/src/toastify.css"

import { is_element_in_viewport, hexToRgb } from "./utils"

export class Card {
    node?: HTMLElement
    title: string
    is_loading: boolean
    is_playing: boolean
    is_loading_metadata: boolean
    current_artist?: string
    current_song?: string
    last_five_songs?: Array<string>
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
        this.last_five_songs = [];

        this.fetch_startup();
        this.setup_metadata_fetching();
    }
    set_loading_song() {
        this.node.querySelector('img').src = '/loading.svg'
    }
    set_loaded_song() {
        this.node.querySelector('img').src = '/stop.svg'
        this.start_pulsing_animation()
        this.is_playing = true;
        this.update_metadata_everywhere();
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
    async fetch_startup() {
        await this.fetch_metadata();
        this.update_metadata_card();
    }
    async setup_metadata_fetching() {
        setInterval(async () => {
            if (this.is_loading_metadata) return;
            if (this.is_playing) {
                await this.fetch_metadata();
                this.update_metadata_everywhere()
                return;
            }
            if (is_element_in_viewport(this.node)) {
                await this.fetch_metadata();
                this.update_metadata_card();
            }
        }, 6000)
    }
    async update_metadata_everywhere() {
        const meta = await this.get_playstrings();
        this.node.querySelector('#now_playing').innerHTML = meta.play_string;
        document.querySelector('#info-now-playing').innerHTML = meta.play_string;
        document.title = meta.play_title_string;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: this.current_song,
            artist: this.current_artist,
        });
        let i = 1;
        document.getElementById("info-last5").innerHTML = "";
        for (const last_song of this.last_five_songs) {
            const last_song_node = document.createElement('span')
            last_song_node.innerHTML = i.toString() + ". " + last_song;
            last_song_node.className = "mx-1 whitespace-nowrap"
            document.getElementById("info-last5").appendChild(last_song_node);
            i++;
        }
    }
    async update_metadata_card() {
        const meta = await this.get_playstrings();
        this.node.querySelector('#now_playing').innerHTML = meta.play_string;
    }
    async get_playstrings() {
        let play_string: string = "";
        let play_title_string: string = "";
        if (!this.current_song && !this.current_artist) {
            play_string = `Naxi Radio - ${this.title}`
        } else {
            if (this.current_song) {
                play_string = `${this.current_artist} - ${this.current_song}`
            } else {
                play_string = `${this.current_artist}`
            }
            play_title_string = `Naxi ${this.title} | ${this.current_artist} - ${this.current_song}`
        }
        return {
            play_string: play_string,
            play_title_string: play_title_string
        }
    }
    async fetch_metadata() {
        try {
            let request = await fetch(this.metadata_url);
            let data = await request.json();
            const unparsed_html = data['rs'];
            const parsed = new DOMParser().parseFromString(unparsed_html, "text/html");
            var artist = "";
            var song = "";
            if (this.title === "Naxi") {
                artist = parsed.querySelectorAll(".details p span")[1].innerHTML+" ";
                song = [].reduce.call(parsed.querySelectorAll(".details p")[1].childNodes, function (a, b) { return a + (b.nodeType === 3 ? b.textContent : '').trim(); }, '');
            } else {
                artist = parsed.querySelector(".details p span").innerHTML + " ";
                song = [].reduce.call(parsed.querySelector(".details p").childNodes, function (a, b) { return a + (b.nodeType === 3 ? b.textContent : '').trim(); }, '');
            }
            const songs = parsed.querySelector("ol").children;
            
            this.last_five_songs = [];
            for (const song_node of songs) {
                this.last_five_songs.push(song_node.innerHTML.trim());
            }
            this.current_artist = artist.trim();
            this.current_song = song.trim().slice(2);
        } catch {
            this.current_artist = null;
            this.current_song = null;
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
