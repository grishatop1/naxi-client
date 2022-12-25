import path from 'path';
import { createCardElement, Card } from './components/card';
import { createCategoryElement } from './components/category';

require('soundmanager2');
soundManager.setup({
    debugMode: false
})

class Player {
    sound?: soundmanager.SMSound
    playing_card?: Card
    volume: number
    volume_slider: HTMLElement
    is_playing: boolean
    is_loading: boolean
    constructor(volume: number) {
        this.is_loading = false;
        this.is_playing = false;
        this.volume_slider = document.getElementById('volume-slider');
        this.volume = volume;
    }
    request_play(card: Card) {
        if (this.is_loading) {
            return;
        }
        if (this.is_playing && this.playing_card === card) {
            this.stop()
            return;
        }
        if (this.is_playing) {
            this.stop()
        }
        this.play(card)
    }
    play(card: Card) {
        card.setLoadingSong();
        this.sound = soundManager.createSound({
            url: card.url,
            autoLoad: true,
            volume: this.volume,
            onload: () => {
                this.playing_card = card;
                this.is_playing = true;
                card.setLoadedSong();
                this.sound.play();
            }
        })
    }
    stop() {
        this.playing_card.setNormal()
        this.is_playing = false;
        this.playing_card = null;
        this.sound.stop();
        this.sound.destruct();
    }
}

let cards: Array<Card> = [];
let player = new Player(50);

const content = document.getElementById('content');

let parse_data = () => {
    const json = require(path.resolve('src/data/stations.json'))
    for (const [category_title, genres] of Object.entries(json.Kategorije)) {
        const categoy_node = createCategoryElement(category_title);
        for (const [card_title, data] of Object.entries(genres)) {
            const card = new Card(
                card_title, 
                data.color, 
                data.url, 
                data.metadata
            )
            card.node = createCardElement(card);
            categoy_node.appendChild(card.node);
            cards.push(card);
        }
        content.appendChild(categoy_node);
    }
}

let add_event_listeners = () => {
    cards.forEach(card => {
        card.node.addEventListener('click', () => {
            player.request_play(card);
        });
    })
}

document.addEventListener('DOMContentLoaded', () => {
    parse_data();
    add_event_listeners();
});