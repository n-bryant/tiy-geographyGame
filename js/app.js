(function() {
    "use strict";

    // setting up gameModule as a Revealing Module pattern
    const gameModule = function() {
      // declaration of global variables
      const startBtn = document.querySelector('.start-btn');
      const playAgainBtn = document.querySelector('.play-again');
      const beginContainer = document.querySelector('.begin-container');
      const questionContainer = document.querySelector('.question-container');
      const resultsContainer = document.querySelector('.results-container');
      const loadingContainer = document.querySelector('.loading-container');
      const guessForm = document.querySelector('.guess-form');

      const loseWords = ['womp', 'duh', 'wrong', 'fml', 'epic fail', 'the worst', 'terrible', 'awful', "sadness", ' failure'];
      const winWords = ['get down', 'winner', 'sweet', 'omg', 'party', 'celebrate', 'lit', 'turnt', 'success', 'shocked'];

      let countryHealdine = document.querySelector('.country-headline');
      let correctAnswer = document.querySelector('.correct-answer');
      let giphyContainer = document.querySelector('.giphy-container');
      let resultText = document.querySelector('.result-text');

      let currentCountry = null;
      let allCountriesArray = [];
      let didWin = false;

      // making a namespace for setting the load icon
      const loading = {
        show() {
          loadingContainer.classList.remove('is-hidden');
        },
        hide() {
          loadingContainer.classList.add('is-hidden');
        }
      };

      // set event handlers
      function bindEvents() {
        startBtn.addEventListener('click', () => {
          event.preventDefault();
          play();
        });
        guessForm.addEventListener('submit', () => {
          event.preventDefault();
          const guess = event.target[0].value;
          checkGuess(guess);
        });
        playAgainBtn.addEventListener('click', () => {
          clearAll();
          play();
        });
      }

      // evaluate guess
      function checkGuess(guess) {
        if (guess.toLowerCase() === currentCountry.capital.toLowerCase()) {
          getGiphy('winner');
          didWin = true;
        } else {
          getGiphy('loser');
          didWin = false;
        }
      }

      function clearAll() {
        guessForm.reset();
        giphyContainer.innerHTML = '';
      }

      // show the result to the user
      function displayResults(img) {
        // display image
        let image = document.createElement('img');
        image.src = img;
        giphyContainer.appendChild(image);

        // waiting for image to load before showing results screen
        image.addEventListener('load', () => {
          // show results container
          showContainer('results');
          loading.hide();
        });
        // display correct answer
        correctAnswer.textContent = currentCountry.capital;

        // update result text
        resultText.textContent = didWin ? 'Winner, winner, chicken dinner.' : 'Womp womp.';
      }

      // getting data from giphy api
      function getGiphy(result) {
        loading.show();
        const randNum = Math.floor(Math.random() * loseWords.length);
        const sourceWords = result === 'winner' ? winWords : loseWords;

        // encoding sourceWords with spaces or punctuation in it
        const searchTerm = encodeURIComponent(sourceWords[randNum]);
        console.log(searchTerm);

        const http = new XMLHttpRequest();
        http.onreadystatechange = function() {
          if (http.readyState === 4 && http.status === 200) {
            const data = JSON.parse(http.response).data;
            // console.log(JSON.parse(http.response));

            // grabbing random result from result set
            const newNum = Math.floor(Math.random() * data.length);
            const resultImg = data[newNum].images.original.url;
            console.log(resultImg);
            displayResults(resultImg);
          }
        };

        http.open('GET', `http://api.giphy.com/v1/gifs/search?q=${searchTerm}&api_key=dc6zaTOxFJmzC`, true);
        http.send();
      }

      // switching active screen depending on game state
      function showContainer(activeScreen) {
        if (activeScreen === 'begin') {
            beginContainer.classList.remove('is-hidden');
            questionContainer.classList.add('is-hidden');
            resultsContainer.classList.add('is-hidden');
        } else if (activeScreen === 'play') {
            beginContainer.classList.add('is-hidden');
            questionContainer.classList.remove('is-hidden');
            resultsContainer.classList.add('is-hidden');
        } else {
            beginContainer.classList.add('is-hidden');
            questionContainer.classList.add('is-hidden');
            resultsContainer.classList.remove('is-hidden');
        }
      }

      // filter country data
      function filterCountries(countriesData) {
        // making this more performant by only fetching the length of the data set once
        const dataLength = countriesData.length;
        let tempObj = {};

        // iterating over all country data and collecting each name/capital
        for (let index = 0; index < dataLength; index++) {
          // clearing tempObj value at each iteration so we can collect the data at the next index
          tempObj = {};

          // collecting country data
          tempObj.name = countriesData[index].name;
          tempObj.capital = countriesData[index].capital;
          allCountriesArray.push(tempObj);
        }
      }

      // select random country
      function getRandomCountry() {
        const randNum = Math.floor(Math.random() * allCountriesArray.length);
        return allCountriesArray[randNum];
      }

      // fetches country data
      function loadCountries() {
        const http = new XMLHttpRequest();
        loading.show();

        // only log response if request is complete
        http.onreadystatechange = function() {
          if (http.readyState === 4 && http.status === 200) {
            const allCountries = JSON.parse(http.response);
            filterCountries(allCountries);
            loading.hide();
          }
        }

        http.open('GET', 'https://restcountries.eu/rest/v1/all', true);
        http.send();
      }

      // set play state
      function play() {
        // change the screen to play
        showContainer('play');

        // pick a random country
        currentCountry = getRandomCountry();
        console.log(currentCountry);

        // update country display
        updateCountryHeadline();
      }

      // set country headline
      function updateCountryHeadline() {
        countryHealdine.textContent = currentCountry.name;
      }

      // initialize game
      function init() {
        loadCountries();
        bindEvents();
      }

      // revealing init function to external scope
      return {
        init: init
      }
    };

    // storing value of executed gameModule
    const gameApp = gameModule();
    gameApp.init();
})();
