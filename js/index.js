var playingSong;
var currentPage = document.getElementById("homepage");
var a = new Audio("");
var playlist = []
var timeSlider;
var baseURL =  localStorage.getItem("baseURL") ?? "http://127.0.0.1:8337"


function truncateString(str) {
  if (str.length > 20) {
    return str.slice(0, 20) + "...";
  } else {
    return str;
  }
}

a.addEventListener('ended', (event) => {
    var currentSongIndex = playlist.indexOf(playingSong)
    if (currentSongIndex+1 < playlist.length) {
        playingSong = playlist[currentSongIndex+1]
        a.src = baseURL+"/item/"+playingSong.getAttribute("src")+"/file"
        a.play()
        if (currentPage.id == "playlist") {
            renderPlaylist()
        } if (currentPage.id == "playscreen") {
            renderPlayscreen()
        }
    }
});

a.onloadedmetadata = function() {
    if (currentPage.id != "playscreen") return;
    timeSlider.max = a.duration;
};

a.ontimeupdate = function() {
    if (currentPage.id != "playscreen") return;
    timeSlider.value = a.currentTime;
};

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function getSongFromID(id) {
    for (var i = 0; i < document.getElementById("pageContent").childElementCount; i++) {
        var songElement = document.getElementById("pageContent").children[i];
        if (songElement.getAttribute("src") == id) {
            return songElement
        }
    }
    return -1
}

function renderHomepage() {
    if (currentPage) currentPage.classList.remove("highlighted")
    currentPage = document.getElementById(getKeyByValue(pages, renderHomepage))
    currentPage.classList.add("highlighted")

    document.getElementById("pageContent").innerHTML = `
    <input type="text" id="searchbar" placeholder="Search in this list...">
    `

    document.getElementById("searchbar").oninput = (event) => {
        for (var i = 0; i < document.getElementById("pageContent").childElementCount; i++) {
            var child = document.getElementById("pageContent").children[i]
            if (child.nodeName == "INPUT") continue;
            if (!child.querySelector("h2").textContent.toLowerCase().includes(event.target.value.toLowerCase()) && !child.querySelector("h3").textContent.toLowerCase().includes(event.target.value.toLowerCase())) {
                child.style.display = "none"
            } else {
                child.style.display = "inherit"
            }
        }
    }

    fetch(baseURL+"/item/", {
        mode: 'cors'
    }).then(response => response.json()).then(object => {
        var songs = object["items"]
        songs.forEach((song) => {
            var songContainer = document.createElement("div")
            songContainer.classList.add("songContainer")
            songContainer.setAttribute("src", song["id"])
            var songTitle = document.createElement("h2")
            songTitle.textContent = truncateString(song["title"])
            var songAuthor = document.createElement("h3")
            songAuthor.textContent = truncateString(song["artist"])
            songContainer.appendChild(songTitle)
            songContainer.appendChild(songAuthor)

            var detailButton = document.createElement("button")
            detailButton.classList.add("detailButton")
            detailButton.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-dots"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`
            songContainer.appendChild(detailButton)

            document.getElementById("pageContent").appendChild(songContainer)

            songContainer.onclick = function (event) {
                if (event.target.nodeName == "BUTTON" || event.target.nodeName == "svg" || event.target.nodeName == "path") {
                    document.getElementById("popup").style.visibility = "visible"
                    document.getElementById("popupContent").innerHTML = ""
                    var addToQueueButton = document.createElement("button")
                    addToQueueButton.classList.add("popupButton")
                    addToQueueButton.textContent = "Add song to queue"
                    addToQueueButton.setAttribute("id", event.currentTarget.getAttribute("src"))

                    addToQueueButton.onclick = (event) => {
                        playlist.push(getSongFromID(event.target.getAttribute("id")))
                        document.getElementById("popup").style.visibility = "hidden"
                    }
                    document.getElementById("popupContent").appendChild(addToQueueButton)
                    return false;
                }
                a.src = baseURL+"/item/"+event.currentTarget.getAttribute("src")+"/file"
                playingSong = event.currentTarget
                playlist = [playingSong]
                a.play()
                pages["playscreen"]()
            }
        })
    }).catch((error) => {
        console.log(error)
        alert("Error getting songs, perhaps the base URL is invalid?")
    })
}

function renderPlayscreen() {
    if (currentPage) currentPage.classList.remove("highlighted")
    currentPage = document.getElementById(getKeyByValue(pages, renderPlayscreen))
    currentPage.classList.add("highlighted")

    document.getElementById("pageContent").innerHTML = `
    `

    if (!playingSong) return;

    var title = document.createElement("h2")
    title.style.marginTop = "100px"
    title.textContent = playingSong.querySelector("h2").textContent

    var artist = document.createElement("h4")
    artist.textContent = playingSong.querySelector("h3").textContent

    timeSlider = document.createElement("input")
    timeSlider.type = "range"
    timeSlider.max = a.duration
    timeSlider.value = a.currentTime
    timeSlider.id = "timeSlider"

    timeSlider.addEventListener('input', function() {
       a.currentTime = timeSlider.value;
    });

    var controls = document.createElement("div");
    controls.classList.add("controls")
    var playButton = document.createElement("button");
    playButton.classList.add("controlButton")
    
    var pauseSVG = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-pause"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg>`
    var playSVG =`<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-play"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>`
    if (!a.paused) {playButton.innerHTML = pauseSVG}
        else playButton.innerHTML = playSVG
    
    playButton.onclick = () => {
        if (a.paused) {a.play(); playButton.innerHTML = pauseSVG}
        else {a.pause(); playButton.innerHTML = playSVG}
    }

    var previousButton = document.createElement("button");
    previousButton.classList.add("controlButton")
    previousButton.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-skip-back"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.496 4.136l-12 7a1 1 0 0 0 0 1.728l12 7a1 1 0 0 0 1.504 -.864v-14a1 1 0 0 0 -1.504 -.864z" /><path d="M4 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" /></svg>`
    previousButton.onclick = () => {
        var currentSongIndex = playlist.indexOf(playingSong)
        if (currentSongIndex-1 >= 0) {
            playingSong = playlist[currentSongIndex-1]
            a.src = baseURL+"/item/"+playingSong.getAttribute("src")+"/file"
            a.play()
            renderPlayscreen()
        }
    }

    var nextButton = document.createElement("button");
    nextButton.classList.add("controlButton")
    nextButton.innerHTML = `<svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="currentColor"  class="icon icon-tabler icons-tabler-filled icon-tabler-player-skip-forward"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14a1 1 0 0 0 1.504 .864l12 -7a1 1 0 0 0 0 -1.728l-12 -7a1 1 0 0 0 -1.504 .864z" /><path d="M20 4a1 1 0 0 1 .993 .883l.007 .117v14a1 1 0 0 1 -1.993 .117l-.007 -.117v-14a1 1 0 0 1 1 -1z" /></svg>`
    nextButton.onclick = () => {
        var currentSongIndex = playlist.indexOf(playingSong)
        if (currentSongIndex+1 < playlist.length) {
            playingSong = playlist[currentSongIndex+1]
            a.src = baseURL+"/item/"+playingSong.getAttribute("src")+"/file"
            a.play()
            renderPlayscreen()
        }
    }

    document.getElementById("pageContent").appendChild(title)
    document.getElementById("pageContent").appendChild(artist)
    document.getElementById("pageContent").appendChild(timeSlider)
    controls.appendChild(previousButton)
    controls.appendChild(playButton)
    controls.appendChild(nextButton)
    document.getElementById("pageContent").appendChild(controls)
}

function renderPlaylist() {
    if (currentPage) currentPage.classList.remove("highlighted")
    currentPage = document.getElementById(getKeyByValue(pages, renderPlaylist))
    currentPage.classList.add("highlighted")

    document.getElementById("pageContent").innerHTML = `
    `
    playlist.forEach((song) => {
        song = song.cloneNode(true)
        document.getElementById("pageContent").appendChild(song)
        song.removeChild(song.querySelector("button"))
        song.onclick = (event) => {
            a.src = baseURL+"/item/"+event.currentTarget.getAttribute("src")+"/file"
            playingSong = event.currentTarget
            a.play()
            renderPlaylist()
        }
        if (song.classList.contains("highlightedSong")) song.classList.remove("highlightedSong")
        if (playingSong.getAttribute("src") == song.getAttribute("src")) {
            song.classList.add("highlightedSong")
        }
    })
}

function renderSettings() {
    if (currentPage) currentPage.classList.remove("highlighted")
    currentPage = document.getElementById(getKeyByValue(pages, renderSettings))
    currentPage.classList.add("highlighted")

    document.getElementById("pageContent").innerHTML = `
    <input type="text" id="urlsetting" placeholder="http://example.com:8337">
    <br>
    <button id="saveSettingsButton"> Save settings</button>
    `
    document.getElementById("urlsetting").value = baseURL

    document.getElementById("saveSettingsButton").onclick = () => {
        baseURL = document.getElementById("urlsetting").value
        localStorage.setItem("baseURL", baseURL);
    }
}
var pages = {
    "homepage": renderHomepage,
    "playscreen": renderPlayscreen,
    "playlist": renderPlaylist,
    "settings": renderSettings
}

function registerChangeScreen(element) {
    if (currentPage != element) {
        pages[element.id]()
    }
}

document.getElementById("popup").onclick = (event) => {
    if (event.target == document.getElementById('popup')) document.getElementById("popup").style.visibility = "hidden"
}

renderHomepage()