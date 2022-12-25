import path from 'path';
import { createCardElement } from './components/createCard';
import { createCategoryElement } from './components/createCategory';
import { Card } from './types';

class Player {
    sound: soundmanager.SMSound
    playing_card: Card
    volume: number
    volume_slider: HTMLElement
    constructor(volume: number) {
        this.volume_slider = document.getElementById('volume-slider');
        this.volume = volume;
    }
}

let cards: Array<Card>;
let player = new Player(50);

const content = document.getElementById('content');

let parse_data = () => {
    const json = require(path.resolve('src/data/stations.json'))
    for (const [category_title, genres] of Object.entries(json.Kategorije)) {
        const categoy_node = createCategoryElement(category_title);
        for (const [card_title, data] of Object.entries(genres)) {
            const card: Card = {
                title: card_title,
                is_loading: true,
                is_playing: false,
                color: data.color,
                url: data.url,
                metadata_url: data.metadata_url
            }
            const card_node = createCardElement(card);
            categoy_node.appendChild(card_node);
        }
        content.appendChild(categoy_node);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    parse_data();
});