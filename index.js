document.addEventListener("DOMContentLoaded", async ()=>{
    const playerDOM = document.getElementById("player")

    const apiBaseUrl = 'http://localhost:9339'

    const player = new Player(playerDOM, apiBaseUrl)

    await player.loadTracksFromServer()
})