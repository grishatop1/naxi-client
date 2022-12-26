export let createCategoryElement = (category: string) => {
    let element = document.createElement('section')
    let title = document.createElement('h1')
    let content = document.createElement('div')
    element.className = 'mt-10 mb-10 ml-10 tablet-xl:m-10 tablet-xl:my-20'
    title.innerHTML = category
    title.className = 'text-4xl m-3 tablet-xl:m-5 tablet-xl:text-center dark:text-white select-none'
    content.className = 'flex flex-wrap tablet-xl:justify-center items-center card-content'
    element.appendChild(title)
    element.appendChild(content)
    return element
}
