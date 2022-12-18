var path = require('path');
var json_data = require(path.resolve('src/data/stations.json'))

let createCategorySection = (category: string) => {
    let element = document.createElement('section')
    let title = document.createElement('h1')
    title.innerHTML = category
    title.className = 'font-bold text-3xl'
    element.appendChild(title)
    document.getElementById('content').appendChild(element)
}

let parseData = (json: Object) => {
    for (let [category, genre] of Object.entries(json['Kategorije'])) {
        createCategorySection(category);
    }
}

parseData(json_data);