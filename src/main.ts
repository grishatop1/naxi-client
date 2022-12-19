import { createCards } from "./components/genre-card";

var path = require('path');
var json_data = require(path.resolve('src/data/stations.json'))

let createCategorySection = (category: string) => {
    let element = document.createElement('section')
    let title = document.createElement('h1')
    let content = document.createElement('div')
    element.className = 'm-20 tablet:m-10 tablet:my-20'
    title.innerHTML = category
    title.className = 'text-4xl m-3 tablet:m-5 tablet-xl:text-center'
    content.className = 'flex flex-wrap tablet-xl:justify-center'
    element.appendChild(title)
    element.appendChild(content)
    document.getElementById('content').appendChild(element)
    return content
}

let parseData = (json: Object) => {
    for (let [category, genres] of Object.entries(json['Kategorije'])) {
        const category_content = createCategorySection(category);
        createCards(genres, category_content);
    }
}

parseData(json_data);