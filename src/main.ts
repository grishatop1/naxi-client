import path from 'path';
import anime from 'animejs';

import { enableThemeSwitching } from './components/theme';
import { createCardElement, Card } from './components/card';
import { createCategoryElement } from './components/category';
import { get_coords } from './components/utils';

const json = require(path.resolve('src/data/stations.json'))

require('soundmanager2');
soundManager.setup({
    debugMode: false
})

class Player {
    sound?: soundmanager.SMSound
    playing_card?: Card
    volume: number
    volume_slider: HTMLInputElement
    is_playing: boolean
    is_loading: boolean
    constructor(volume: number) {
        this.is_loading = false;
        this.is_playing = false;
        this.volume_slider = <HTMLInputElement>document.getElementById('volume-slider');
        this.volume = volume;

        this.volume_slider.addEventListener('input', () => {
            this.change_volume();
        });
    }
    change_volume() {
        const new_volume = parseInt(this.volume_slider.value);
        this.sound.setVolume(new_volume);
        this.volume = new_volume;
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
            hide_panel();
            return;
        }
        if (this.is_playing) {
            this.stop();
            hide_panel();
        }
        this.play(card)
    }
    play(card: Card) {
        card.set_loading_song();
        this.is_loading = true;
        this.playing_card = card;
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
                show_panel();
                document.title = `Naxi ${this.playing_card.title} | ${this.playing_card.current_artist} ${this.playing_card.current_song}`
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
    }
}

let cards: Array<Card> = [];
let player = new Player(50);

const content = document.getElementById('content');
const panel = <HTMLElement>document.querySelector('#info-panel');

let show_panel = () => {
    panel.querySelector("#info-now-playing").innerHTML = player.playing_card.current_artist + " " + player.playing_card.current_song;
    panel.querySelector("#info-song-title").innerHTML = player.playing_card.title;
    document.getElementById("info-dummy").style.backgroundColor = player.playing_card.color;
    document.getElementById("info-panel-box").style.backgroundColor = player.playing_card.color;
    anime({
        targets: panel,
        bottom: "0",
        duration: 300,
        easing: "easeOutQuart"
    })
}

let hide_panel = () => {
    anime({
        targets: panel,
        bottom: "-4em",
        duration: 300,
        easing: "easeOutQuart"
    })
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

document.addEventListener('DOMContentLoaded', () => {
    parse_data();
    add_event_listeners();
    enableThemeSwitching();
    add_categories();
});