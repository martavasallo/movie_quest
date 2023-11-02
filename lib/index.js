// Constants
const apiKey = "adf1f2d7";
const omdbapiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=`;

// DOM Elements
const searchBtn = document.querySelector(".btn");
const search = document.getElementById("search-movies");
const results = document.getElementById("search-results");
const movieInput = document.getElementById("movie-name");
const movieCards = document.getElementById("movie-cards");
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const btnCloseModal = document.querySelector(".close-modal");
const modalContent = document.querySelector(".modal-content");

// Logo animation
window.addEventListener("load", () => {
  const slideQuest = document.getElementById("slide-quest");
  const slideMovie = document.getElementById("slide-movie");
  slideQuest.style.top = "0px";
  slideMovie.style.left = "0px";
});

// Tooltip
document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );

  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    var tooltip = new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: "manual",
    });
    tooltip.show();
  });

  // Hide tooltip on form submission
  movieInput.addEventListener("input", function () {
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
      var tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
      tooltip.hide();
    });
  });
});

// Fetch 10 random movies to display in carousel
const searchTerms = [
  "america",
  "hotel",
  "spy",
  "man",
  "spider",
  "spider",
  "war",
  "horror",
];

const yearsArray = [
  2010, 2011, 2012, 2013, 2014, 2014, 2018, 2019, 2020, 2021, 2022, 2023,
];

const fetchRandomMovies = async () => {
  try {
    const randomIndex = Math.floor(Math.random() * searchTerms.length);
    const randomYearIndex = Math.floor(Math.random() * yearsArray.length);
    const searchTerm = searchTerms[randomIndex];
    const randomYear = yearsArray[randomYearIndex];
    const response = await fetch(`${omdbapiUrl}${searchTerm}&y=${randomYear}`);
    const data = await response.json();
    if (data.Search && data.Search.length > 0) {
      return data.Search; // return the first 10 search results
    } else {
      throw new Error(`No movies found for the search term: ${searchTerm}`);
    }
  } catch (error) {
    console.error("Error fetching random movies:", error);
    return [];
  }
};

fetchRandomMovies().then((movies) => {
  const carouselInner = document.getElementById("carousel-inner");
  let isFirstItem = true;

  movies.forEach((movie) => {
    if (movie.Poster === "N/A") {
      // Skip this movie if it doesn't have a poster
      return;
    }

    const carouselItem = document.createElement("div");
    carouselItem.classList.add("carousel-item");
    if (isFirstItem) {
      carouselItem.classList.add("active");
      isFirstItem = false;
    }

    const img = document.createElement("img");
    img.classList.add("d-block");
    img.classList.add("w-100");
    img.src = movie.Poster;
    img.alt = movie.Title;

    carouselItem.appendChild(img);
    carouselInner.appendChild(carouselItem);
  });
});

// Creating movie cards
const createMovieCard = (movie) => {
  return `
    <div class="col-lg-3 col-md-4 col-sm-6 col-12 movie-card">
      <div class="card mb-2" data-movie-id="${movie.imdbID}">
        <img src="${movie.Poster}" class="card-img-top" alt="${movie.Title}">
        <div class="card-body">
          <h5 class="pt-1 card-title">${movie.Title}</h5>
          <p class="mb-2 card-year">${movie.Year}</p>
        </div>
      </div>
    </div>
  `;
};

const displayMovies = (movies) => {
  movieCards.innerHTML = "";

  if (movieInput.value === "") {
    const resultsText = `<h6 class="results-header">👆 PLEASE, TYPE A MOVIE TITLE</h6>`;
    results.innerHTML = resultsText;
  } else if (movies.length > 0) {
    const sortedMovies = movies.sort((a, b) => b.Year.localeCompare(a.Year));
    const resultsText = `<h6 class="results-header">${movies.length} MOVIES FOUND</h6>`;
    results.innerHTML = resultsText;
    sortedMovies.forEach((movie) => {
      if (movie.Poster !== "N/A") {
        const card = createMovieCard(movie);
        movieCards.insertAdjacentHTML("beforeend", card);
        const movieCard = movieCards.lastElementChild;
        setTimeout(() => {
          movieCard.classList.add("fade-in");
        }, 100);
      }
    });
  } else {
    const resultsText = `<h6 class="results-header">SORRY, NO MOVIES FOUND</h6>`;
    results.innerHTML = resultsText;
  }
};

const getMovies = (event) => {
  event.preventDefault();
  const carousel = document.querySelector(".carousel");
  carousel.innerHTML = "";

  const movieSearch = movieInput.value;

  fetch(`${omdbapiUrl}${movieSearch}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      if (data.Response === "True") {
        displayMovies(data.Search, movieSearch);
      } else {
        displayMovies([], movieSearch);
      }
    })
    .catch(handleErrors);
};

// Creating modal window with movie info
const openModal = () => {
  modal.style.display = "block";
  overlay.style.display = "block";
  modal.scrollTo(0, 0);
  const dialog = document.getElementById("dialog");
  dialog.style.display = "block";
  dialog.classList.add("appear");
};

const closeModal = () => {
  modal.style.display = "none";
  overlay.style.display = "none";
};

const handleModalClose = () => {
  closeModal();
};

const displayInfo = (info, movie) => {
  // Poster
  const leftModal = document.getElementById("left-modal");
  const leftModalImg = leftModal.querySelector("img");
  leftModalImg.src = movie.Poster;
  leftModalImg.alt = movie.Title;

  // Title
  const titleElement = modalContent.querySelector(".info-heading");
  titleElement.textContent = info.Title;

  // Rating
  const ratingElement = modalContent.querySelector(".fa-star");
  ratingElement.nextSibling.textContent = movie.Ratings[0].Value.split("/")[0];

  // Type
  const typeElement = modalContent.querySelector(
    ".type-runtime .info-span:first-child"
  );
  typeElement.textContent = info.Type;

  // If it is a series, displaying total of seasons
  const seasonsElement = modalContent.querySelector(
    ".type-runtime .info-span:nth-child(2)"
  );
  if (info.totalSeasons) {
    seasonsElement.innerHTML = `<span class="info-span">(${info.totalSeasons} seasons)</span>`;
  } else {
    seasonsElement.innerHTML = "";
  }

  // Genres
  const genreElement = modalContent.querySelector(".genre");
  genreElement.innerHTML = info.Genre.split(",")
    .map((genre, index, array) => {
      if (index === array.length - 1) {
        return `<div>${genre.trim()}</div>`;
      }
      return `<div>${genre.trim()}</div><span> • </span>`;
    })
    .join("");

  // Rated
  const ratedElement = modalContent.querySelector(".box-rated");
  ratedElement.textContent = info.Rated;

  // Year
  const yearElement = modalContent.querySelector(".box-year");
  yearElement.textContent = info.Year;

  // Runtime
  const runtimeElement = modalContent.querySelector(".box-runtime");
  runtimeElement.textContent = info.Runtime;

  // Plot
  const plotElement = modalContent.querySelector("#bottom-modal .info-plot");
  plotElement.textContent = info.Plot;

  // Director
  const directorElement = modalContent.querySelector(
    "#bottom-modal .info-director"
  );
  directorElement.textContent = info.Director;

  // Actors
  const castElement = modalContent.querySelector("#bottom-modal .info-cast");
  castElement.textContent = info.Actors;

  // Country
  const countryElement = modalContent.querySelector(
    "#bottom-modal .info-country"
  );
  countryElement.textContent = info.Country;

  // Awards
  const awardsElement = modalContent.querySelector(
    "#bottom-modal .info-awards"
  );
  awardsElement.textContent = info.Awards;

  openModal();
};

const fetchMovieInfo = (movieID) => {
  fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${movieID}`)
    .then((response) => response.json())
    .then((data) => {
      displayInfo(data, data);
    });
};

const handleMovieClick = (event) => {
  const movieID = event.target.closest(".card").getAttribute("data-movie-id");
  fetchMovieInfo(movieID);
  openModal();
  overlay.style.display = "block";
};

overlay.style.display = "none";

// Event Listeners
movieCards.addEventListener("click", handleMovieClick);
btnCloseModal.addEventListener("click", handleModalClose);

movieInput.addEventListener("click", () => {
  movieInput.value = "";
  searchBtn.value = "Search";
  searchBtn.classList.remove("clicked");
  searchBtn.classList.add("reset");
});

searchBtn.addEventListener("click", function () {
  if (!this.classList.contains("clicked")) {
    this.value = "▶▶";
    this.classList.add("clicked");
    this.classList.remove("reset");
    setTimeout(() => {
      this.classList.add("reset");
      this.classList.remove("clicked");
    }, 400);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

search.addEventListener("submit", getMovies);

overlay.addEventListener("click", (event) => {
  if (event.target === overlay) {
    closeModal();
  }
});

// Helper Functions
const handleErrors = (error) => {
  console.error("Error fetching data:", error);
};
