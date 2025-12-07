document.addEventListener("DOMContentLoaded", ()=>{
    const playerDOM = document.getElementById("player")

    const tracks = [
        new Track("All I Want for Christmas Is You", "Mariah Carey", "https://i.scdn.co/image/ab67616d00001e02c0862332847213b151ffab31"),
        new Track("Ordinary", "Alex Warren", "https://i.scdn.co/image/ab67616d00001e0242fe69c0e7e5c92f01ece8ce"),
        new Track("End of Beginning", "Djo", "https://i.scdn.co/image/ab67616d00001e02fddfffec51b4580acae727c1"),
        new Track("Die With A Smile", "Lady Gaga, Bruno Mars", "https://i.scdn.co/image/ab67616d00001e02b0860cf0a98e09663c82290c"),
        new Track("WILDFLOWER", "Billie Eilish", "https://i.scdn.co/image/ab67616d00001e0271d62ea7ea8a5be92d3c1f62"),
        new Track("Iris", "The Goo Goo Dolls", "https://i.scdn.co/image/ab67616d00001e02ce5e0c89b768384d45d9b0fa"),
        new Track("Rock Your Body", "Justin Timberlake", "https://i.scdn.co/image/ab67616d00001e02346a5742374ab4cf9ed32dee")
    ]

    const player = new Player(playerDOM)

    tracks.forEach((track)=>{
        player.addTrack(track)
    })

    player.render()
})