let currentSong = new Audio();
let songs;
let currFolder;
console.log("now commit")

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

//function to fetch all the songs from folder
async function getSongs(folder) {
    console.log("this ia folder line 22 ",folder)
    let a = await fetch(`/${folder}/`)
    currFolder = folder;
    let response = await a.text();
    console.log("this is response line 26",response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log("these are as inside div holding response xdata line 30",as)
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        console.log("this is element", element, element.href.endsWith(".mp3"))

        if (element.href.endsWith(".mp3")) {
            console.log("tis is element.href",element.href)
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    //show all the songs in the play list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    console.log("this is song ul",songUL)
    songUL.innerHTML = ""
    for (var song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
         
       
                             <img  class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div>${song.replaceAll("%20", " ")}</div>
                                 <div>Warda</div>
                             </div>
 
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <img  class="invert" src="img/play.svg" alt="">
                             </div>
      </li>`;

    }
    //attach an event listener to each song 
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })
    return songs


}
function playMusic(track, pause = false) {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/ 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    console.log("cards showing",response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if( (e.href.includes("/songs/"))  && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-1)[0]
            //get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}"  class="card ">

                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.W3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141B34" stroke-width="1.5"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>



                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`

        }
    }

    //load the playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })





}


async function main() {

    //get the list of all songs
    await getSongs("https://raw.githubusercontent.com/wardaowais/SPOTIFY-CLONE/main/songs/cs")
    playMusic(songs[0], true)


    //display  all the albums on the page 
    displayAlbums()



    //Attach  an event listener to play , next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    //Add an eventlistener to seek bar
    //getBoundingClientRect() this function gives all the info about the element that where it is placed including its height , width , top , bottom, left
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";

    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";

    })

    //add an event listener to previous
    previous.addEventListener("click", () => {
        console.log("prev click")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])

        }


    })
    //add an event listener to next
    next.addEventListener("click", () => {
        console.log("next click")
        console.log("this is next button",currentSong.src.split("/").slice(-1))
        
        console.log("at this point ",songs)
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < (songs.length)) {
            playMusic(songs[index + 1])

        }



    })

    //Add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(`this is e : ${e} and this is e.target : ${e.target} and this e.t.value : ${e.target.value}`)
        console.log("setting volume to ", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src =    document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")


        }
    })

    //Add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src =   e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src =   e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })


}

main()