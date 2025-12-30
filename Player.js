class Player{

    #tracks
    #currentTrack

    #player
    #isPause
    #audioElement

    #trackName
    #trackArtist
    #trackArt

    #playBtn
    #nextBtn
    #prevBtn

    #volumeButton
    #volumeIcon
    #volumeSlider
    #volumeValue
    #previousVolume
    #volumeWrapper

    #progressSlider
    #currentTime
    #totalTime

    #apiBaseUrl
    #updateInterval

    constructor(playerDOM, apiBaseUrl = 'http://localhost:9339'){
        this.#tracks = []
        this.#currentTrack = 0

        this.#player = playerDOM
        this.#isPause = true
        this.#apiBaseUrl = apiBaseUrl

        this.#audioElement = new Audio()
        this.#audioElement.addEventListener('ended', () => {
            this.nextTrack()
            this.render()
        })
        
        this.#audioElement.addEventListener('loadedmetadata', () => {
            this.updateTotalTime()
        })
        
        this.#audioElement.addEventListener('timeupdate', () => {
            this.updateProgress()
        })

        this.#trackName = playerDOM.querySelector(".track-name");
        this.#trackArtist = playerDOM.querySelector(".track-artist");
        this.#trackArt = playerDOM.querySelector(".track-art");

        this.#playBtn = playerDOM.querySelector(".playpause-track");
        this.#nextBtn = playerDOM.querySelector(".next-track")
        this.#prevBtn = playerDOM.querySelector(".prev-track")

        this.#volumeWrapper = playerDOM.querySelector(".volume-wrapper");
        this.#volumeButton = playerDOM.querySelector(".volume-button");
        this.#volumeIcon = playerDOM.querySelector(".volume-button i");
        this.#volumeSlider = playerDOM.querySelector(".volume-slider");
        this.#volumeValue = playerDOM.querySelector(".volume-value");

        this.#progressSlider = playerDOM.querySelector(".progress-slider");
        this.#currentTime = playerDOM.querySelector(".current-time");
        this.#totalTime = playerDOM.querySelector(".total-time");

        this.#audioElement.volume = 0.5
        this.#previousVolume = 0.5
        this.updateVolumeIcon(0.5)

        this.#playBtn.addEventListener("click",()=>{
            this.togglePlay()
        })

        this.#prevBtn.addEventListener("click",()=>{
            this.prevTrack()
            this.render()
        })

        this.#nextBtn.addEventListener("click",()=>{
            this.nextTrack()
            this.render()
        })

        this.#volumeSlider.addEventListener("input", (e) => {
            e.stopPropagation()
            this.setVolume(e.target.value / 100)
        })

        this.#volumeButton.addEventListener("click", (e) => {
            e.stopPropagation()
            this.toggleVolumeControl()
        })

        this.#volumeWrapper.querySelector('.volume-control').addEventListener("click", (e) => {
            e.stopPropagation()
        })

        this.#volumeIcon.addEventListener("dblclick", (e) => {
            e.stopPropagation()
            this.toggleMute()
        })

        document.addEventListener("click", (e) => {
            if(!this.#volumeWrapper.contains(e.target)){
                this.hideVolumeControl()
            }
        })

        this.#progressSlider.addEventListener("input", (e) => {
            this.seekTo(e.target.value)
        })

        this.#updateInterval = null
    }

    render(){
        if(this.#tracks.length === 0) return

        const track = this.#tracks[this.#currentTrack]

        if(track.art){
            this.#trackArt.style.backgroundImage = `url(${track.art})`
        } else {
            this.#trackArt.style.backgroundImage = 'none'
            this.#trackArt.style.backgroundColor = '#333'
        }
        
        this.#trackName.innerHTML = track.name
        this.#trackArtist.innerHTML = track.artist

        if(track.filename){
            this.loadTrack(track.filename)
        }

        this.renderControlsBtn()
    }

    loadTrack(filename){
        const url = `${this.#apiBaseUrl}/api/stream/${encodeURIComponent(filename)}`
        this.#audioElement.src = url
        this.#audioElement.load()
        
        this.#progressSlider.value = 0
        this.#currentTime.textContent = '0:00'
        
        if(!this.#isPause){
            this.#audioElement.play().catch(err => {
                console.error('Playback error:', err)
            })
        }
    }

    togglePlay(){
        this.#isPause = !this.#isPause
        
        if(this.#isPause){
            this.#audioElement.pause()
        } else {
            this.#audioElement.play().catch(err => {
                console.error('Playback error:', err)
                this.#isPause = true
            })
        }
        
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
        this.#isPause = true
    }

    nextTrack(){
        if(this.#currentTrack == (this.#tracks.length - 1)){
            return
        }

        this.#currentTrack += 1
        this.#isPause = true
    }

    addTrack(track){
        this.#tracks.push(track)
    }

    setVolume(volume){
        this.#audioElement.volume = volume
        const percent = Math.round(volume * 100)
        this.#volumeSlider.value = percent
        this.#volumeValue.textContent = `${percent}%`
        
        if(volume > 0){
            this.#previousVolume = volume
        }
        
        this.updateVolumeIcon(volume)
    }

    toggleVolumeControl(){
        this.#volumeWrapper.classList.toggle('active')
    }

    hideVolumeControl(){
        this.#volumeWrapper.classList.remove('active')
    }

    toggleMute(){
        if(this.#audioElement.volume === 0){
            const volumeToRestore = this.#previousVolume || 0.5
            this.setVolume(volumeToRestore)
        } else {
            this.#previousVolume = this.#audioElement.volume
            this.#audioElement.volume = 0
            this.#volumeSlider.value = 0
            this.#volumeValue.textContent = '0%'
            this.updateVolumeIcon(0)
        }
    }

    updateVolumeIcon(volume){
        if(volume === 0){
            this.#volumeIcon.className = 'fa fa-volume-mute fa-2x'
        } else if(volume < 0.5){
            this.#volumeIcon.className = 'fa fa-volume-down fa-2x'
        } else {
            this.#volumeIcon.className = 'fa fa-volume-up fa-2x'
        }
    }

    formatTime(seconds){
        if(isNaN(seconds) || !isFinite(seconds)){
            return '0:00'
        }
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    updateProgress(){
        const current = this.#audioElement.currentTime
        const duration = this.#audioElement.duration
        
        if(duration && isFinite(duration)){
            const percent = (current / duration) * 100
            this.#progressSlider.value = percent
            this.#currentTime.textContent = this.formatTime(current)
        } else {
            this.#currentTime.textContent = '0:00'
        }
    }

    updateTotalTime(){
        const duration = this.#audioElement.duration
        if(duration && isFinite(duration)){
            this.#totalTime.textContent = this.formatTime(duration)
            this.#progressSlider.max = 100
        } else {
            this.#totalTime.textContent = '0:00'
        }
    }

    seekTo(percent){
        const duration = this.#audioElement.duration
        if(duration && isFinite(duration)){
            const newTime = (percent / 100) * duration
            this.#audioElement.currentTime = newTime
            this.#currentTime.textContent = this.formatTime(newTime)
        }
    }

    async loadTracksFromServer(){
        try {
            const response = await fetch(`${this.#apiBaseUrl}/api/tracks`)
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            
            this.#tracks = []
            data.tracks.forEach(trackData => {
                this.addTrack(new Track(
                    trackData.name,
                    trackData.artist,
                    trackData.art,
                    trackData.filename
                ))
            })
            
            if(this.#tracks.length > 0){
                this.render()
            }
        } catch (error) {
            console.error('Error loading tracks:', error)
        }
    }

}