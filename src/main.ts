import { createCards } from "./components/genre-card";
import { respondToVisibility, hexToRgb } from "./utils";
import anime from 'animejs/lib/anime.es.js';

var soundmanager2 = require("soundmanager2")
soundManager.setup({
    debugMode: false
})

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
        respondToVisibility(card[0], () => {
            fetchMetadata(card);
            setInterval(() => {
                fetchMetadata(card);
            }, 10000)
        });
        card[0].addEventListener('click', () => {
            if (audioLoading) {
                return;
            }
            if (currentURL === card[1].url) {
                stopAll();
                hideInfoPanel();
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

                    currentURL = card[1].url;
                    currentCard = card[0];
                    audioLoading = false;

                    animatePulse(card[0], card[1].color);
                    showInfoPanel(card[1].title, card[1].color);
                    card[0].querySelector('img').src = "/stop.svg";
                }
            });
        })
    });
}

setInterval(() => {
    if (currentCard) {
        info_panel.querySelector("#info-now-playing").innerHTML = currentCard.querySelector("#now-playing").innerHTML;
    }
}, 5000)

const info_panel = document.querySelector("#info-panel")
let showInfoPanel = (genre: string, color: string) => {
    info_panel.querySelector("#info-song-title").innerHTML = genre;
    info_panel.querySelector("#info-now-playing").innerHTML = currentCard.querySelector("#now-playing").innerHTML;
    document.getElementById("info-dummy").style.backgroundColor = color;
    document.getElementById("info-panel-box").style.backgroundColor = color;
    anime({
        targets: info_panel,
        bottom: "0",
        duration: 300,
        easing: "easeOutQuart"
    })
}

let hideInfoPanel = () => {
    anime({
        targets: info_panel,
        bottom: "-5em",
        duration: 300,
        easing: "easeOutQuart"
    })
}

var animationPulsing: Animation = null;
let animatePulse = (element: HTMLElement, color: string) => {
    let colorRGB = hexToRgb(color)
    const keyframes = [
        { boxShadow: `0 0 0px 0px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0.8)` },
        { boxShadow: `0 0 0px 10px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0)` },
        { boxShadow: `0 0 0px 10px rgba(${colorRGB.r}, ${colorRGB.g}, ${colorRGB.b}, 0)` },
    ];

    const timing = {
        duration: 1000,
        iterations: Infinity
    };

    animationPulsing = element.animate(keyframes, timing);
}

let stopAnimatePulse = () => {
    animationPulsing.cancel()
}

let fetchMetadata = (card: object) => {
    fetch(card[1].metadata)
        .then((response) => response.json())
        .then((data) => {
            const unparsed_html = data['rs']
            const parsed = new DOMParser().parseFromString(unparsed_html, "text/xml");

            const artist = parsed.querySelector(".details p span").innerHTML + " ";
            const song = [].reduce.call(parsed.querySelector(".details p").childNodes, function (a, b) { return a + (b.nodeType === 3 ? b.textContent : '').trim(); }, '');

            const result = artist + song

            if (result.trim() == "") {
                card[0].querySelector('#now-playing').innerHTML = "Naxi Radio - " + card[1].title;
            } else {
                card[0].querySelector('#now-playing').innerHTML = result;
            }

        });
}

let stopAll = () => {
    currentSound.stop();
    currentCard.querySelector('img').src = "/play.svg";
    currentCard.classList.remove('pulsing');
    currentURL = null;
    currentSound.destruct();
    currentSound = null;
    currentCard = null;
    stopAnimatePulse();
}

const volume_slider = <HTMLInputElement>document.getElementById('volume-slider');
volume_slider.addEventListener('input', () => {
    const value = 100 + parseInt(volume_slider.value);
    currentSound.setVolume(value);
})

parseData(json_data);