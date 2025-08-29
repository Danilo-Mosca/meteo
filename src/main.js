/* IMPORT DEL FILE config.js CONTENENTE LE API KEYS NECESSARIE */
// Importo dal file ".env" la chiave contenente l'API di Open Weather Map:
const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API;  //Assegno alla variabile API_KEY la chiave presente nella costante OPEN_WEATHER_API nel file .env
// console.log('OPEN_WEATHER_API:', API_KEY);   // testo per il funzionamento
/* -------------------- FINE IMPORTO API KEYS -------------------- */

// Recupero gli elementi di interesse dalla pagina
const htmlElement = document.documentElement;
const suggestion = document.querySelector('.suggestion');
const weatherIcon = document.querySelector('.weather-icon');
const weatherLocation = document.querySelector('.weather-location');
const weatherTemperature = document.querySelector('.weather-temperature');
const cityButtons = document.querySelectorAll('.city-button');
let textInput = document.querySelector('.text-input');
const searchCityButton = document.querySelector('.search-city-button');
let citySelected = '';  // la creo come let perchè la variabile dovrà cambiare sempre di valore. Le assegno '' inizialmente perchè al primo avvio
// della pagina non viene selezionato nessun pulsante, e poter così eseguire la ricerca tramite geolocalizzazione (se attiva)

// Provo a recuperare la mia posizione
navigator.geolocation.getCurrentPosition(onSuccess, onError);

// Funzione da eseguire in caso di errore
function onError() {
  // Preparo degli elementi in pagina per far capire che va attivata
  weatherLocation.innerText = '';
  weatherIcon.alt = "Geolocation disattivata";
  weatherIcon.src = "./src/images/geolocation_disabled.png";
  suggestion.innerText = 'Attiva la geolocalizzazione'

  // Disattivare il loading
  htmlElement.className = '';
}

// Funzione da eseguire in caso di successo
async function onSuccess(position) {
  if ((citySelected == "local-position") || (citySelected == '')) {
    // Recupero latitudine e longitudine
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Prepariamoci a chiamare l'API di Open Weather
    const units = 'metric';
    const lang = 'it';

    //  Gli passo l'endpoint con latitudine, longitudine, API KEY, unità di miusura e lingua italiana
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=${units}&lang=${lang}`;


    // Chiamo le API di Open Weather
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(data);
    fillContent(data);  // richiamo la funzione che riempie il contenuto della webapp
  }

  else {
    cityClicked(citySelected);  // altrimenti non ho selezionato la città in base alla mia posizione e quindi richiamo la funzione cityClicked
  }
}



/* FUNZIONI PER LA VERIFICA DELLA CITTA' CLICCATA, INSERITA O GEOLOCALIZZATA */
async function cityClicked(citySelected) {

  // Chiamata l'API di Open Weather
  const units = 'metric';
  const lang = 'it';

  //  Gli passo l'endpoint con città inserita o selezionata dal pulsante, API KEY, unità di miusura e lingua italiana
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${citySelected}&appid=${API_KEY}&units=${units}&lang=${lang}`;

  // Chiamo le API di Open Weather
  const response = await fetch(endpoint);
  const data = await response.json();
  //console.log(data.cod);     //Console log di prova
  console.log(data);

  // Verifico se la città inserita dall'utente esiste 
  // grazie al campo/parametro "cod" che restituisce 200 nel caso in cui la città
  // inserita nella input text esiste, '404' in caso di errore
  if (data.cod == '404') {
    // Se la città non esiste visualizzo il messaggio
    weatherLocation.innerText = `La città "${citySelected}" non esiste!`;
    // Azzero la text input
    textInput.value = '';
    // Inserisco un testo nel pannello dei suggerimenti
    suggestion.innerText = "Ops!";
    // Così come al pannello della temperatura
    weatherTemperature.innerText = "XXX°"
    // inserisco l'icona city not found
    weatherIcon.alt = "Città non trovata";
    weatherIcon.src = "./src/images/city_not_found_icon.png";
    citySelected = ''; //rinizializzo la variabile citySelected allo stato iniziale
  }
  else {

    fillContent(data);    // richiamo la funzione che riempie il contenuto della webapp
  }
}



/* FUNZIONE CHE RIEMPIE IL CONTENUTO DELLA WEBAPP CON: GRADI, CITTA', TEMA NOTTURO O DIURNO */
function fillContent(data) {
  const iconCode = data.weather[0].icon;
  const description = data.weather[0].description;

  // Riempio gli elementi della pagina
  weatherLocation.innerText = data.name;
  weatherIcon.alt = description;
  weatherIcon.src = `./src/images/${iconCode}.png`;
  weatherTemperature.innerText = `${Math.floor(data.main.temp)}°`;
  suggestion.innerText = suggestions[iconCode];

  // Disattivare il loading
  htmlElement.className = '';

  /* Verifica tema notturno o classico */
  // se la terza lettera di iconCode è uguale alla "d"
  if (iconCode[2] == 'd') {
    //allora inserisco il tema con i colori diurni di default disattivando
    //la classe di loading 'night-mode' che li va a sovrascrivere
    htmlElement.className = '';
    searchCityButton.src = './src/images/search_icon.png';  //imposto l'icona giornaliera del pulsante ricerca città
  }
  else {
    // altrimenti la terza lettera di iconCode è per forza uguale a "n"
    // ed inserisco il tema notturno attivando la classe di loading 'night-mode'
    // con i colori di modalità notte
    htmlElement.className = 'night-mode';
    searchCityButton.src = './src/images/search_icon_night.png';  //imposto l'icona notturna del pulsante ricerca città
  }

  citySelected = ''; //rinizializzo la variabile citySelected allo stato iniziale
}
/* ------------------- FINE DELLE FUNZIONI -------------- */




// Operazioni sui pulsanti, reazioni al click dei pulsanti city-button
cityButtons.forEach(function (cityButton) {
  cityButton.addEventListener('click', function () {
    //recupero il valore del data-attribute del pulsante per capire quale città ha cliccato
    //const citySelected = cityButton.dataset.city;   //vecchia versione del sorgente
    citySelected = cityButton.dataset.city;
    //console.log(citySelected);

    // Verifico se è stato schiacciato il pulsante per recuperare la mia posizione
    if ((citySelected == "local-position") || (citySelected == '')) {
      // In questo caso provo a recuperare di nuovo la mia posizione
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
      // Altrimenti recupero la posizione della città cliccata invocando la funzione
      // delle città preimpostate e faccio partire la chiamata alle API
      cityClicked(citySelected);
      //console.log(citySelected);
    }
  });

});

// Operazione dinamica al click del pulsante search-city-button
searchCityButton.addEventListener('click', function () {
  const text = textInput.value.trim();    //rimuovo gli spazi dalla stringa della textInput

  // Verifico se il campo di input ha realmente del testo
  if (text.length > 0) {
    //console.log(text);
    // Chiamo la funzione cityClicked e gli passo il parametro inserito nella input text
    cityClicked(text);
  }
});

// Operazione dinamica al click del pulsante invio della tastiera sulla textInput
textInput.addEventListener('keydown', (event) => {
  // Controlla se il tasto premuto è "Invio"
  if (event.key === 'Enter' || event.keyCode === 13) {
    // Impedisce l'azione predefinita del tasto Invio (come inviare un modulo)
    event.preventDefault();

    const text = textInput.value.trim();    //rimuovo gli spazi dalla stringa della textInput
    // console.log("Tasto Invio premuto!");
    // Verifico se il campo di input ha realmente del testo
    if (text.length > 0) {
      //console.log(text);
      // Chiamo la funzione cityClicked e gli passo il parametro inserito nella input text
      cityClicked(text);
    }
  }
});