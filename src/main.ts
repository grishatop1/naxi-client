import { createCards } from "./components/genre-card";

var soundmanager2 = require("soundmanager2")

var path = require('path');
var json_data = require(path.resolve('src/data/stations.json'))


let currentSound: soundmanager.SMSound = null;
let currentURL: string = null;
let currentCard: HTMLElement = null;
let audioLoading: boolean = false;
  

let createCategorySection = (category: string) => {
    let element = document.createElement('section')
    let title = document.createElement('h1')
    let content = document.createElement('div')
    element.className = 'mt-10 mb-10 ml-10 tablet:m-10 tablet:my-20'
    title.innerHTML = category
    title.className = 'text-4xl m-3 tablet:m-5 tablet-xl:text-center'
    content.className = 'flex flex-wrap tablet-xl:justify-center'
    element.appendChild(title)
    element.appendChild(content)
    document.getElementById('content').appendChild(element)
    return content
}

let parseData = (json: Object) => {
    let cards = [];
    for (let [category, genres] of Object.entries(json['Kategorije'])) {
        const category_content = createCategorySection(category);
        cards.push(...createCards(genres, category_content));
    }

    cards.forEach((card) => {
        card[0].addEventListener('click', () => {
            if (audioLoading) {
                return;
            }
            if (currentURL === card[1].url) {
                stopAll();
                return;
            }
            if (currentURL) {
                stopAll();
            }
            card[0].querySelector('img').src = "/loading.svg";
            audioLoading = true;
            currentSound = soundManager.createSound({
                url: card[1].url,
                autoLoad: true,
                volume: 50,
                onload: () => {
                    currentSound.play();
                    card[0].querySelector('img').src = "/stop.svg";
                    card[0].classList.add('pulsing');
                    currentURL = card[1].url;
                    currentCard = card[0];
                    audioLoading = false;
                }
            });
        })
    });
}

let stopAll = () => {
    currentSound.stop();
    currentCard.querySelector('img').src = "/play.svg";
    currentCard.classList.remove('pulsing');
    currentURL = null;
    currentSound = null;
    currentCard = null;
}

parseData(json_data);