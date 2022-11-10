let searchCityBtn = document.querySelector(".search-bar-button");
let searchBarEl = document.querySelector(".search-bar");
let cityName = document.querySelector(".city-name");
let temp = document.querySelector(".temperature");
let wind = document.querySelector(".wind");
let humidity = document.querySelector(".humidity");
let uvi = document.querySelector(".uv");
let searchHistory = document.querySelector(".search-history");
let uviValue = document.querySelector(".uvi-value p");
let forcastContainer = document.querySelector(".forcast-container");
let storedInput = localStorage.getItem("recentCities");

let array = [];

const APIKey = "6d7635984c221029e00373571bf1b705";
function start(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKey}`
  )
    .then((response) => response.json())
    .then(async (data) => {
      console.log({ data });
      const nameValue = data["name"];
      const tempValue = data["main"]["temp"];
      const windSpeed = data["wind"]["speed"];
      const humidityValue = data["main"]["humidity"];
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const fiveDayObject = await getFiveDayObject(lat, lon);
      const uvIndex = getUV(fiveDayObject);
      cityName.innerHTML = `Weather in ${nameValue}`;
      const icon = fiveDayObject.current.weather[0].icon;
      const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;
      const iconEl = document.createElement("img");
      iconEl.src = iconURL;
      cityName.appendChild(iconEl);
      getFiveDayForcast(fiveDayObject);
      console.log(uvIndex);
      //get name from api somehow
      temp.innerHTML = `${Math.round(
        parseFloat(tempValue - 273.15) * 1.8 + 32
      )}°F`;
      wind.innerHTML = `Wind Speed:${windSpeed}`;
      humidity.innerHTML = `Humidity: ${humidityValue}%`;
      uviValue.innerHTML = `${uvIndex}`;
    })
    .catch((err) => console.log(err));

  //make buttons for search history
  const historyBtns = document.createElement("button");
  const searchHistoryButtons = document.querySelectorAll("#recent-search-btn");
  console.log("searchHistoryButtons: ", searchHistoryButtons);
  let canCreateButton = true;
  if (searchHistoryButtons.length > 0) {
    for (let i = 0; i < searchHistoryButtons.length; i++) {
      if (searchHistoryButtons[i].textContent === city) {
        canCreateButton = false;
      }
    }
  }
  if (searchHistoryButtons.length === 0 || canCreateButton) {
    historyBtns.textContent = city;
    historyBtns.setAttribute("id", "recent-search-btn");
    searchHistory.appendChild(historyBtns);
  }

  historyBtns.addEventListener("click", () => {
    start(city);
  });
}

searchCityBtn.addEventListener("click", () => {
  if (!searchBarEl.value) return;
  array.push(searchBarEl.value);
  start(searchBarEl.value);
  saveToLocalStorage();
});

async function getFiveDayObject(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${APIKey}`
  );
  const sevenDayData = await response.json();
  console.log({ sevenDayData });
  return sevenDayData;
}

function getUV(data) {
  const uvIndex = data.current.uvi;

  if (uvIndex >= 0 && uvIndex <= 2) {
    uviValue.setAttribute("class", "green");
  } else if (uvIndex >= 3 && uvIndex <= 5) {
    uviValue.setAttribute("class", "yellow");
  } else if (uvIndex >= 6 && uvIndex <= 7) {
    uviValue.setAttribute("class", "orange");
  } else if (uvIndex >= 8 && uvIndex <= 10) {
    uviValue.setAttribute("class", "red");
  } else {
    uviValue.setAttribute("class", "purple");
  }
  return uvIndex;
}

function getFiveDayForcast(data) {
  const fiveDayArray = data.daily;
  const dates = document.querySelectorAll(".forcast-container-date");
  const forcastIconEl = document.querySelectorAll(".forcast-container img");
  const forcastTemp = document.querySelectorAll(".forcast-container-temp");
  const windSpeed = document.querySelectorAll(".forcast-container-wind");
  const humidityAmount = document.querySelectorAll(
    ".forcast-container-humidity"
  );

  console.log(dates);

  for (let i = 1; i < 6; i++) {
    const epochTime = fiveDayArray[i].dt;
    let convertedDate = new Date(0);
    convertedDate.setUTCSeconds(epochTime);
    dates[i - 1].innerHTML = convertedDate.toLocaleDateString();

    const icon = fiveDayArray[i].weather[0].icon;
    const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

    forcastIconEl[i - 1].src = iconURL;

    const temp = fiveDayArray[i].temp.day;
    const fahrTemp = `${Math.round(parseFloat(temp - 273.15) * 1.8 + 32)}°F`;
    forcastTemp[i - 1].innerHTML = `Temp: ${fahrTemp}`;

    const wind = fiveDayArray[i].wind_speed;
    windSpeed[i - 1].innerHTML = `Wind: ${wind}`;

    const humidity = fiveDayArray[i].humidity;
    humidityAmount[i - 1].innerHTML = `Humidity: ${humidity}%`;
  }
}

function saveToLocalStorage() {
  localStorage.setItem("recentCities", JSON.stringify(array));
}

function getFromLocalStorageAndPersist() {
  const recentCities = JSON.parse(localStorage.getItem("recentCities"));
  if (recentCities?.length > 0) {
    for (const c of recentCities) {
        start(c);
    }
    array = recentCities;
  }
}

window.addEventListener("load", () => {
  getFromLocalStorageAndPersist();
});
