class Player{

    #tracks
    #currentTrack

    #player
    #isPause

    #trackName
    #trackArtist
    #trackArt

    #playBtn
    #nextBtn
    #prevBtn

    constructor(playerDOM){
        this.#tracks = []
        this.#currentTrack = 0

        this.#player = playerDOM
        this.#isPause = true

        this.#trackName = playerDOM.querySelector(".track-name");
        this.#trackArtist = playerDOM.querySelector(".track-artist");
        this.#trackArt = playerDOM.querySelector(".track-art");

        this.#playBtn = playerDOM.querySelector(".playpause-track");
        this.#nextBtn = playerDOM.querySelector(".next-track")
        this.#prevBtn = playerDOM.querySelector(".prev-track")

        this.#playBtn.addEventListener("click",()=>{
            this.#isPause = !this.#isPause
            this.render()
        })

        this.#prevBtn.addEventListener("click",()=>{
            this.#isPause = true
            this.prevTrack()
            this.render()
        })

        this.#nextBtn.addEventListener("click",()=>{
            this.#isPause = true
            this.nextTrack()
            this.render()
        })
    }

    render(){
        const track = this.#tracks[this.#currentTrack]

        this.#trackArt.style.backgroundImage = `url(${track.art})`
        this.#trackName.innerHTML = track.name
        this.#trackArtist.innerHTML = track.artist

        this.renderControlsBtn()
    }

    renderControlsBtn(){
        const iconElement = this.#playBtn.querySelector('i')
        iconElement.className = `fa fa-${this.#isPause ? "play" : "pause"}-circle fa-5x`

        this.#prevBtn.style.color = this.#currentTrack == 0 ? "#757575" : "#EEEEEE"

        this.#nextBtn.style.color = this.#currentTrack == (this.#tracks.length - 1) ? "#757575" : "#EEEEEE"
        
    }

    prevTrack(){
        if(this.#currentTrack == 0){
            return
        }

        this.#currentTrack -= 1
    }

    nextTrack(){
        if(this.#currentTrack == (this.#tracks.length - 1)){
            return
        }

        this.#currentTrack += 1
    }

    addTrack(track){
        this.#tracks.push(track)
    }

}