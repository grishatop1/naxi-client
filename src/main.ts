import path from 'path';
import anime from 'animejs';

import { enableThemeSwitching } from './components/theme';
import { createCardElement, Card } from './components/card';
import { createCategoryElement } from './components/category';
import { get_coords } from './components/utils';
import { ipcRenderer } from 'electron';


const json = require(path.resolve('src/data/stations.json'))

require('soundmanager2');
soundManager.setup({
    debugMode: false
})

class Player {
    sound?: soundmanager.SMSound
    playing_card?: Card
    volume?: number
    volume_slider: HTMLInputElement
    is_playing: boolean
    is_loading: boolean
    constructor() {
        this.is_loading = false;
        this.is_playing = false;
        this.volume_slider = <HTMLInputElement>document.getElementById('volume-slider');

        this.volume_slider.addEventListener('input', () => {
            const new_volume = parseInt(this.volume_slider.value);
            this.sound.setVolume(new_volume);
            this.volume = new_volume;
        });
    }
    change_volume(value: number) {
        if (this.sound) {
            this.sound.setVolume(value);
        }
        this.volume = value;
        this.volume_slider.value = value.toString();
    }
    request_play(card: Card) {
        if (this.is_loading) {
            this.playing_card.node.querySelector('img').src = '/play.svg'
            this.sound.destruct()
            this.sound = null;
            this.is_loading = false;
            if (this.playing_card !== card) {
                this.play(card);
            }
            return;
        }
        if (this.is_playing && this.playing_card === card) {
            this.stop();
            return;
        }
        if (this.is_playing) {
            this.stop();
        }
        this.play(card)
    }
    play(card: Card) {
        card.set_loading_song();
        this.is_loading = true;
        this.playing_card = card;
        if (this.playing_card.title === "Naxi") {
            document.getElementById("show-info").style.display = "inline";
            document.getElementById("show-info").innerHTML = this.playing_card.current_show;
        } else {
            document.getElementById("show-info").style.display = "none";
            document.getElementById("show-info").innerHTML = "";
        }
        this.sound = soundManager.createSound({
            url: card.url,
            autoLoad: true,
            volume: this.volume,
            onload: () => {
                if (!this.sound.loaded) return;
                this.is_playing = true;
                this.is_loading = false;
                card.set_loaded_song();
                this.sound.play();
                this.sound.setVolume(this.volume);
                show_panel();
            },
            onerror: () => {
                card.set_errored();
                this.is_loading = false;
            }
        })
    }
    stop() {
        this.playing_card.set_normal()
        this.is_playing = false;
        this.playing_card = null;
        this.sound.stop();
        this.sound.destruct();
        document.title = `Naxi Radio`
        hide_panel();
    }
}

let cards: Array<Card> = [];
let player = new Player(50);

const content = document.getElementById('content');
const panel = <HTMLElement>document.querySelector('#info-panel');
const expand_btn = document.getElementById("info-expand");
let panel_expanded = false;

let show_panel = () => {
    panel.querySelector("#info-song-title").innerHTML = player.playing_card.title;
    document.getElementById("info-dummy").style.backgroundColor = player.playing_card.color;
    document.getElementById("info-panel-box").style.backgroundColor = player.playing_card.color;
    let expand_btn = <HTMLElement>document.querySelector("#info-expand > svg");
    expand_btn.style.fill = player.playing_card.color;
    anime({
        targets: panel,
        bottom: "-4em",
        duration: 300,
        easing: "easeOutQuart"
    })
}

let hide_panel = () => {
    anime({
        targets: panel,
        bottom: "-8em",
        duration: 300,
        easing: "easeOutQuart"
    })
    panel_expanded = false;
    anime({
        targets: expand_btn,
        rotate: "0deg",
        duration: 300,
        easing: "easeOutQuart"
    })
}

let expand_panel = () => {
    if (panel_expanded) {
        anime({
            targets: panel,
            bottom: "-4em",
            duration: 300,
            easing: "easeOutQuart"
        })
        anime({
            targets: expand_btn,
            rotate: "0deg",
            duration: 300,
            easing: "easeOutQuart"
        })
        panel_expanded = false;
    } else {
        anime({
            targets: panel,
            bottom: "0em",
            duration: 300,
            easing: "easeOutQuart"
        })
        anime({
            targets: expand_btn,
            rotate: "180deg",
            duration: 300,
            easing: "easeOutQuart"
        })
        panel_expanded = true;
    }
}


let parse_data = () => {
    for (const [category_title, genres] of Object.entries(json.Kategorije)) {
        const category_node = createCategoryElement(category_title);
        for (const [card_title, data] of Object.entries(genres)) {
            const card = new Card(
                card_title, 
                data.color, 
                data.url, 
                data.metadata
            )
            card.node = createCardElement(card);
            category_node.querySelector(".card-content").appendChild(card.node);
            cards.push(card);
        }
        content.appendChild(category_node);
    }
}

let add_event_listeners = () => {
    cards.forEach(card => {
        card.node.addEventListener('click', () => {
            player.request_play(card);
        });
    })

    expand_btn.addEventListener("click", () => {
        expand_panel();
    })

    document.getElementById('info-stop').addEventListener('click', () => { player.stop() })
}

let add_categories = () => {
    const categories_node = document.getElementById('categories');
    for (const [category_title, _] of Object.entries(json.Kategorije)) {
        const category_btn = document.createElement('div');
        category_btn.innerHTML = category_title;
        category_btn.className = 'select-none cursor-pointer py-2 px-5 tablet-xl:px-3 hover:bg-gray-200 rounded-lg dark:bg-[#3c3c4a] dark:text-white dark:hover:bg-gray-600';
        categories_node.appendChild(category_btn);
        category_btn.addEventListener('click', () => {
            scroll_to_category(category_title);
        })
    }
}

let scroll_to_category = (category: string) => {
    const element = <HTMLElement>document.querySelector(`[data-id="${category}"]`);
    const scrollElement = window.document.scrollingElement || window.document.body || window.document.documentElement;
    anime({
        targets: scrollElement,
        scrollTop: get_coords(element).top + element.getBoundingClientRect().height/2 - window.innerHeight/2,
        easing: 'easeOutSine',
        duration: 200
    })
}

let get_cache = async () => {
    let data = await ipcRenderer.invoke('get_cache');
    player.change_volume(data.volume);
    //document.documentElement.classList.add(data.theme);
}

let save_cache = () => {
    let volume = player.volume_slider.value;
    let theme = document.documentElement.className;
    ipcRenderer.send('save_cache', {volume: parseInt(volume), theme: theme})
}

//Media player stuff
navigator.mediaSession.setActionHandler("pause", () => {
    player.stop()
});
navigator.mediaSession.setActionHandler("stop", () => {
    player.stop()
});

//ENTRY
parse_data();
add_event_listeners();
enableThemeSwitching();
add_categories();
get_cache();
setInterval(save_cache, 1500);