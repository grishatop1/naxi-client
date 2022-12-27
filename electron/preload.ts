function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const styleContent = `
  @keyframes pulsing {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
.app-loading-logo {
  width: 300px;
  height: 220px;
  background-image: url('/naxi.png');
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}
.app-loading-logo::after {
  content: "";
  width: 300px;
  height: 220px;
  display: block;
  background-image: url('/line.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: 150px;
  z-index: 5000;
  position: absolute;
  top: -80px;
  left: 90px;
  animation: pulsing 0.2s infinite alternate;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 10000;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="app-loading-logo"></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)
//appendLoading();

window.onmessage = ev => {
  console.log(ev)
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 3000)


