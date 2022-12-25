import path from 'path';
import { createCardElement, Card } from './components/card';
import { createCategoryElement } from './components/category';

require('soundmanager2');
soundManager.setup({
    debugMode: false
})

class Player {
    sound: soundmanager.SMSound
    playing_card: Card
    volume: number
    volume_slider: HTMLElement
    is_playing: boolean
    constructor(volume: number) {
        this.volume_slider = document.getElementById('volume-slider');
        this.volume = volume;
    }
    requestPlay(card: Card) {
        //If nothing is playing
        if (!this.is_playing) {
            this.sound = soundManager.createSound({
                url: card.url,
                autoLoad: true,
                volume: this.volume,
                onload: () => {
                    this.sound.play();
                }
            })
        }
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
            player.requestPlay(card);
        });
    })
}

document.addEventListener('DOMContentLoaded', () => {
    parse_data();
    add_event_listeners();
});