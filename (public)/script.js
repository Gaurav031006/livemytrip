const GEOAPIFY_API_KEY = "5f0d53a943244ea8a1064c8d354f154b";

async function fetchPlaces(city) {
  try {
    const geoUrl =
      "https://api.geoapify.com/v1/geocode/search?text=" +
      encodeURIComponent(city) +
      "&limit=1&apiKey=" +
      GEOAPIFY_API_KEY;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.features || !geoData.features.length) {
      return [];
    }

    const lon = geoData.features[0].properties.lon;
    const lat = geoData.features[0].properties.lat;

    const placesUrl =
      "https://api.geoapify.com/v2/places?categories=tourism.attraction,catering.restaurant,accommodation.hotel&filter=circle:" +
      lon +
      "," +
      lat +
      ",20000&limit=60&apiKey=" +
      GEOAPIFY_API_KEY;

    const placesRes = await fetch(placesUrl);
    const placesData = await placesRes.json();

    return placesData.features || [];
  } catch (error) {
    console.log("Geoapify error:", error);
    return [];
  }
}
var activities = [];

var presets = {
  Paris: [
    [1, "09:00", "Eiffel Tower visit", "sight"],
    [1, "13:00", "Lunch at Le Café", "food"],
    [1, "15:00", "Louvre Museum", "sight"],
    [2, "10:00", "Seine River Cruise", "sight"],
    [2, "19:00", "Dinner in Montmartre", "food"]
  ],
  Goa: [
    [1, "08:00", "Baga Beach morning", "sight"],
    [1, "13:00", "Seafood lunch", "food"],
    [1, "16:00", "Old Goa churches", "sight"],
    [2, "09:00", "Dudhsagar Falls trip", "sight"],
    [2, "20:00", "Night market", "food"]
  ],
  Bali: [
    [1, "09:00", "Tanah Lot Temple", "sight"],
    [1, "14:00", "Nasi Goreng lunch", "food"],
    [1, "16:00", "Tegallalang Rice Terrace", "sight"],
    [2, "08:00", "Ubud Monkey Forest", "sight"],
    [2, "19:00", "Kecak Dance Show", "sight"]
  ],
  Tokyo: [
    [1, "09:00", "Senso-ji Temple", "sight"],
    [1, "12:00", "Sushi at Tsukiji Market", "food"],
    [1, "15:00", "Shibuya Crossing", "sight"],
    [2, "10:00", "Meiji Shrine", "sight"],
    [2, "18:00", "Akihabara District", "sight"]
  ],
  Dubai: [
    [1, "10:00", "Burj Khalifa visit", "sight"],
    [1, "13:00", "Lunch at Dubai Mall", "food"],
    [1, "17:00", "Dubai Fountain Show", "sight"],
    [2, "09:00", "Desert Safari", "sight"],
    [2, "20:00", "Marina Dinner Cruise", "food"]
  ],
  London: [
    [1, "09:00", "Big Ben and Westminster", "sight"],
    [1, "12:30", "Lunch near Covent Garden", "food"],
    [1, "15:00", "London Eye", "sight"],
    [2, "10:00", "Tower Bridge", "sight"],
    [2, "18:00", "Oxford Street Shopping", "sight"]
  ],
  Singapore: [
    [1, "09:00", "Gardens by the Bay", "sight"],
    [1, "13:00", "Lunch at Hawker Centre", "food"],
    [1, "17:00", "Marina Bay Sands", "sight"],
    [2, "10:00", "Sentosa Island", "sight"],
    [2, "19:00", "Clarke Quay Dinner", "food"]
  ],
  Mumbai: [
    [1, "08:00", "Gateway of India", "sight"],
    [1, "12:30", "Lunch at Colaba", "food"],
    [1, "16:00", "Marine Drive sunset", "sight"],
    [2, "09:00", "Elephanta Caves", "sight"],
    [2, "18:00", "Juhu Beach snacks", "food"]
  ],
  Kerala: [
    [1, "09:00", "Munnar Tea Gardens", "sight"],
    [1, "13:00", "Kerala Sadya lunch", "food"],
    [1, "16:00", "Mattupetty Dam", "sight"],
    [2, "09:00", "Alleppey Houseboat", "sight"],
    [2, "19:00", "Backwater dinner", "food"]
  ],
  Thailand: [
    [1, "09:00", "Grand Palace Bangkok", "sight"],
    [1, "13:00", "Thai street food lunch", "food"],
    [1, "17:00", "Chao Phraya River Cruise", "sight"],
    [2, "10:00", "Phi Phi Island Tour", "sight"],
    [2, "19:00", "Night Market Dinner", "food"]
  ]
};

function toast(msg) {
  var t = document.getElementById("toast");

  if (!t) {
    console.log(msg);
    return;
  }

  t.textContent = msg;
  t.classList.add("show");

  setTimeout(function () {
    t.classList.remove("show");
  }, 2500);
}

/* =========================
   PLANNER
========================= */

async function generateItinerary() {
  var destInput = document.getElementById("plan-dest");
  var startInput = document.getElementById("plan-start");
  var endInput = document.getElementById("plan-end");

  if (!destInput) return;

  var dest = destInput.value.trim();

  if (!dest) {
    toast("⚠️ Please enter destination");
    return;
  }

  var totalDays = 3;

  if (startInput && endInput && startInput.value && endInput.value) {
    var startDate = new Date(startInput.value);
    var endDate = new Date(endInput.value);

    if (endDate < startDate) {
      toast("⚠️ End date should be after start date");
      return;
    }

    totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }

  activities = [];

  var cityName = dest;

  toast("🔎 Finding real places in " + cityName + "...");

  var places = await fetchPlaces(cityName);

  function hasCategory(place, category) {
    return (
      place &&
      place.properties &&
      place.properties.name &&
      place.properties.categories &&
      place.properties.categories.includes(category)
    );
  }

  var hotels = places.filter(function (p) {
    return hasCategory(p, "accommodation.hotel");
  });

  var restaurants = places.filter(function (p) {
    return hasCategory(p, "catering.restaurant");
  });

  var attractions = places.filter(function (p) {
    return hasCategory(p, "tourism.attraction");
  });

  function pick(list, index, fallback) {
    if (list && list.length) {
      return list[index % list.length].properties.name;
    }
    return fallback;
  }

  for (var day = 1; day <= totalDays; day++) {
    activities.push(
      {
        day: day,
        time: "08:00",
        name: day === 1
          ? "Arrival at " + cityName + " airport / station"
          : "Local transport for sightseeing in " + cityName,
        cat: "transit"
      },
      {
        day: day,
        time: "09:30",
        name: day === 1
          ? "Check-in at " + pick(hotels, 0, "Best Hotel in " + cityName)
          : "Breakfast at " + pick(hotels, 0, "Hotel in " + cityName),
        cat: "hotel"
      },
      {
        day: day,
        time: "13:00",
        name: "Lunch at " + pick(restaurants, day - 1, "Top Restaurant in " + cityName),
        cat: "food"
      },
      {
        day: day,
        time: "16:00",
        name: "Visit " + pick(attractions, day - 1, "Popular Attraction in " + cityName),
        cat: "sight"
      }
    );
  }

  renderItinerary(cityName);
  toast("✨ " + totalDays + " days itinerary generated for " + cityName);
}

function addActivity() {
  var nameInput = document.getElementById("act-name");
  var dayInput = document.getElementById("act-day");
  var timeInput = document.getElementById("act-time");
  var catInput = document.getElementById("act-cat");

  if (!nameInput || !dayInput || !timeInput || !catInput) return;

  var name = nameInput.value.trim();

  if (!name) {
    toast("⚠️ Please enter activity");
    return;
  }

  activities.push({
    day: parseInt(dayInput.value),
    time: timeInput.value,
    name: name,
    cat: catInput.value
  });

  nameInput.value = "";

  var destBox = document.getElementById("plan-dest");
  renderItinerary(destBox ? destBox.value || "My Trip" : "My Trip");

  toast("✅ Activity added");
}

function renderItinerary(dest) {
  var title = document.getElementById("itin-title");
  var body = document.getElementById("itinerary-body");

  if (!title || !body) return;

  title.textContent = (dest || "My") + " Itinerary";

  if (!activities.length) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🗺️</div>
        <p>Add destination and generate itinerary!</p>
      </div>
    `;
    return;
  }

  activities.sort(function (a, b) {
    return a.day - b.day || a.time.localeCompare(b.time);
  });

  var days = {};

  activities.forEach(function (item) {
    if (!days[item.day]) {
      days[item.day] = [];
    }

    days[item.day].push(item);
  });

  var totalDays = Object.keys(days).length;

  localStorage.setItem("plannedDestination", dest || "My Trip");
  localStorage.setItem("plannedDays", totalDays);

  var html = "";

  Object.keys(days).forEach(function (day) {
    html += `
      <div class="day-block">
        <div class="day-label">Day ${day}</div>
    `;

    days[day].forEach(function (item) {
      var tagLabel =
        {
          sight: "Sightseeing",
          food: "Food",
          hotel: "Accommodation",
          transit: "Transit"
        }[item.cat] || item.cat;

      html += `
        <div class="activity-item">
          <span class="activity-time">${item.time}</span>
          <span class="activity-name">${item.name}</span>
          <span class="activity-tag tag-${item.cat}">${tagLabel}</span>
        </div>
      `;
    });

    html += `</div>`;
  });

  body.innerHTML = html;
}

function clearItinerary() {
  activities = [];
  renderItinerary("My");
  toast("🗑️ Itinerary cleared");
}

/* =========================
   WEATHER
========================= */

async function fetchWeather() {
  var cityInput = document.getElementById("weather-city");
  if (!cityInput) return;

  var city = cityInput.value.trim();

  if (!city) {
    toast("⚠️ Please enter city name");
    return;
  }

  document.getElementById("w-city").textContent = "Loading...";
  document.getElementById("w-temp").textContent = "--°C";
  document.getElementById("w-desc").textContent = "Fetching latest weather...";
  document.getElementById("w-extras").textContent = "";
  document.getElementById("forecast-grid").innerHTML = "";

  try {
    var geoUrl =
      "https://api.geoapify.com/v1/geocode/search?text=" +
      encodeURIComponent(city) +
      "&limit=1&apiKey=" +
      GEOAPIFY_API_KEY;

    var geoRes = await fetch(geoUrl);
    var geoData = await geoRes.json();

    if (!geoData.features || geoData.features.length === 0) {
      document.getElementById("w-city").textContent = "Location not found";
      document.getElementById("w-temp").textContent = "--°C";
      document.getElementById("w-desc").textContent =
        "Try correct spelling, e.g. Dehradun Uttarakhand";
      document.getElementById("w-extras").textContent = "";
      document.getElementById("forecast-grid").innerHTML = "";
      toast("⚠️ Location not found");
      return;
    }

    var place = geoData.features[0].properties;
    var lat = place.lat;
    var lon = place.lon;

    var placeName =
      (place.city || place.name || city) +
      (place.state ? ", " + place.state : "") +
      (place.country ? ", " + place.country : "");

    var weatherUrl =
      "https://api.open-meteo.com/v1/forecast?latitude=" +
      lat +
      "&longitude=" +
      lon +
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&forecast_days=5" +
      "&temperature_unit=celsius" +
      "&wind_speed_unit=kmh" +
      "&timezone=auto";

    var weatherRes = await fetch(weatherUrl);
    var weatherData = await weatherRes.json();

    var current = weatherData.current;
    var daily = weatherData.daily;

    document.getElementById("w-city").textContent = placeName;
    document.getElementById("w-temp").textContent =
      Math.round(current.temperature_2m) + "°C";

    document.getElementById("w-desc").textContent =
      getWeatherText(current.weather_code) +
      " · Humidity " +
      current.relative_humidity_2m +
      "%";

    document.getElementById("w-extras").textContent =
      "Wind: " +
      Math.round(current.wind_speed_10m) +
      " km/h · Feels like " +
      Math.round(current.apparent_temperature) +
      "°C";

    document.getElementById("w-icon").textContent =
      getWeatherIcon(current.weather_code);

    var html = "";

    for (var i = 0; i < daily.time.length; i++) {
      var date = new Date(daily.time[i]);
      var dayName = date.toLocaleDateString("en-US", { weekday: "short" });

      html += `
        <div class="weather-day">
          <div class="weather-day-name">${dayName}</div>
          <div class="weather-day-icon">${getWeatherIcon(daily.weather_code[i])}</div>
          <div class="weather-day-temp">
            ${Math.round(daily.temperature_2m_max[i])}° / ${Math.round(daily.temperature_2m_min[i])}°
          </div>
        </div>
      `;
    }

    document.getElementById("forecast-grid").innerHTML = html;
    toast("✅ Weather loaded for " + placeName);

  } catch (error) {
    console.log(error);
    document.getElementById("w-city").textContent = "Weather loading failed";
    document.getElementById("w-temp").textContent = "--°C";
    document.getElementById("w-desc").textContent =
      "Check internet/API key or try another city";
    document.getElementById("w-extras").textContent = "";
    document.getElementById("forecast-grid").innerHTML = "";
    toast("❌ Weather loading failed");
  }
}

function getWeatherText(code) {
  if (code === 0) return "Clear Sky";
  if ([1, 2, 3].includes(code)) return "Partly Cloudy";
  if ([45, 48].includes(code)) return "Foggy";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67].includes(code)) return "Rainy";
  if ([71, 73, 75, 77].includes(code)) return "Snowy";
  if ([80, 81, 82].includes(code)) return "Rain Showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}

function getWeatherIcon(code) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77].includes(code)) return "❄️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "☁️";
}

/* =========================
   BUDGET
========================= */

var budgetData = {};

var catColors = {
  flight: "#3B82F6",
  hotel: "#8B5CF6",
  food: "#F59E0B",
  activity: "#10B981",
  transport: "#6B7280",
  shopping: "#EC4899",
  misc: "#EF4444"
};

var catEmoji = {
  flight: "✈️",
  hotel: "🏨",
  food: "🍽️",
  activity: "🎭",
  transport: "🚌",
  shopping: "🛍️",
  misc: "📦"
};

var budgetPlans = {
  goa: { flight: 20, hotel: 30, food: 20, activity: 15, transport: 10, shopping: 3, misc: 2 },
  dubai: { flight: 25, hotel: 35, food: 15, activity: 15, transport: 5, shopping: 3, misc: 2 },
  london: { flight: 25, hotel: 35, food: 18, activity: 10, transport: 7, shopping: 3, misc: 2 },
  kerala: { flight: 18, hotel: 28, food: 18, activity: 18, transport: 12, shopping: 3, misc: 3 },
  mumbai: { flight: 15, hotel: 35, food: 20, activity: 10, transport: 15, shopping: 3, misc: 2 },
  bali: { flight: 25, hotel: 30, food: 15, activity: 18, transport: 7, shopping: 3, misc: 2 },
  tokyo: { flight: 28, hotel: 32, food: 18, activity: 10, transport: 7, shopping: 3, misc: 2 },
  singapore: { flight: 22, hotel: 35, food: 18, activity: 12, transport: 8, shopping: 3, misc: 2 },
  thailand: { flight: 22, hotel: 28, food: 18, activity: 18, transport: 8, shopping: 4, misc: 2 },
  default: { flight: 20, hotel: 30, food: 20, activity: 15, transport: 10, shopping: 3, misc: 2 }
};

function getBudgetLocation() {
  var input = document.getElementById("budget-location");
  var loc = input ? input.value.trim() : "Goa";

  if (!loc) loc = "Goa";

  if (!budgetData[loc]) {
    budgetData[loc] = {
      totalBudget: 50000,
      expenses: []
    };
  }

  return loc;
}

function setBudget() {
  var loc = getBudgetLocation();
  var budgetInput = document.getElementById("set-budget");
  var budget = budgetInput ? parseInt(budgetInput.value) : 0;

  if (!budget || budget <= 0) {
    toast("⚠️ Enter valid budget");
    return;
  }

  budgetData[loc].totalBudget = budget;
  renderExpenses();

  toast("💰 Budget set for " + loc);
}

function autoCalculateBudget() {
  var loc = getBudgetLocation();
  var budgetInput = document.getElementById("set-budget");
  var budget = budgetInput ? parseInt(budgetInput.value) : 0;

  if (!budget || budget <= 0) {
    toast("⚠️ Enter total budget first");
    return;
  }

  var plan = budgetPlans[loc.toLowerCase()] || budgetPlans.default;

  budgetData[loc] = {
    totalBudget: budget,
    expenses: [
      { desc: "Estimated Flights", amt: Math.round((budget * plan.flight) / 100), cat: "flight" },
      { desc: "Estimated Hotel Stay", amt: Math.round((budget * plan.hotel) / 100), cat: "hotel" },
      { desc: "Estimated Food & Dining", amt: Math.round((budget * plan.food) / 100), cat: "food" },
      { desc: "Estimated Activities", amt: Math.round((budget * plan.activity) / 100), cat: "activity" },
      { desc: "Estimated Local Transport", amt: Math.round((budget * plan.transport) / 100), cat: "transport" },
      { desc: "Estimated Shopping", amt: Math.round((budget * plan.shopping) / 100), cat: "shopping" },
      { desc: "Estimated Miscellaneous", amt: Math.round((budget * plan.misc) / 100), cat: "misc" }
    ]
  };

  renderExpenses();

  toast("✨ Auto budget calculated for " + loc);
}

function addExpense() {
  var loc = getBudgetLocation();

  var descInput = document.getElementById("exp-desc");
  var amtInput = document.getElementById("exp-amt");
  var catInput = document.getElementById("exp-cat");

  if (!descInput || !amtInput || !catInput) return;

  var desc = descInput.value.trim();
  var amt = parseInt(amtInput.value);
  var cat = catInput.value;

  if (!desc || !amt || amt <= 0) {
    toast("⚠️ Fill expense title and amount");
    return;
  }

  budgetData[loc].expenses.push({
    desc: desc,
    amt: amt,
    cat: cat
  });

  descInput.value = "";
  amtInput.value = "";

  renderExpenses();

  toast("💸 Expense added");
}

function clearExpenses() {
  var loc = getBudgetLocation();

  budgetData[loc].expenses = [];

  renderExpenses();

  toast("🗑️ Expenses cleared");
}

function renderExpenses() {
  if (!document.getElementById("page-budget")) return;

  var loc = getBudgetLocation();
  var data = budgetData[loc];

  var spent = data.expenses.reduce(function (sum, exp) {
    return sum + exp.amt;
  }, 0);

  var left = Math.max(0, data.totalBudget - spent);
  var pct =
    data.totalBudget > 0
      ? Math.min(100, Math.round((spent / data.totalBudget) * 100))
      : 0;

  document.getElementById("expense-title").textContent =
    loc + " Expense Log";
  document.getElementById("b-total").textContent =
    "₹" + data.totalBudget.toLocaleString();
  document.getElementById("b-spent").textContent =
    "₹" + spent.toLocaleString();
  document.getElementById("b-left").textContent =
    "₹" + left.toLocaleString();
  document.getElementById("bbar").style.width = pct + "%";
  document.getElementById("bbar-pct").textContent = pct + "% used";
  document.getElementById("bbar-max").textContent =
    "₹" + data.totalBudget.toLocaleString();

  var html = "";

  data.expenses.forEach(function (exp) {
    var color = catColors[exp.cat] || "#6B7280";
    var emoji = catEmoji[exp.cat] || "📦";

    html += `
      <div class="expense-item">
        <div class="expense-cat">
          <div class="expense-dot" style="background:${color}"></div>
          <div>
            <div class="expense-name">${exp.desc}</div>
            <div class="expense-sub">${emoji} ${exp.cat}</div>
          </div>
        </div>
        <div class="expense-amt">₹${exp.amt.toLocaleString()}</div>
      </div>
    `;
  });

  document.getElementById("expense-log").innerHTML =
    html ||
    '<div class="empty-state"><div class="empty-icon">💰</div><p>No expenses added for ' +
      loc +
      "</p></div>";
}

/* =========================
   BOOKINGS
========================= */

function quickBook() {
  var type = document.getElementById("quick-type").value;
  var from = document.getElementById("quick-from").value.trim();
  var to = document.getElementById("quick-to").value.trim();
  var date = document.getElementById("quick-date").value;
  var adults = parseInt(document.getElementById("quick-adults").value);
  var children = parseInt(document.getElementById("quick-children").value);

  if (isNaN(children)) children = 0;

  if (!from || !to || !date) {
    toast("⚠️ Fill all booking details");
    return;
  }

  var grid = document.getElementById("bookings-grid");
  if (!grid) return;

  var cityPrices = {
    goa: { flight: 4500, hotel: 2500, package: 12000 },
    dubai: { flight: 18000, hotel: 8500, package: 45000 },
    london: { flight: 42000, hotel: 12000, package: 95000 },
    bali: { flight: 25000, hotel: 7000, package: 60000 },
    singapore: { flight: 22000, hotel: 9000, package: 55000 },
    mumbai: { flight: 3500, hotel: 3000, package: 10000 },
    kerala: { flight: 6000, hotel: 3500, package: 18000 },
    thailand: { flight: 20000, hotel: 6500, package: 50000 },
    default: { flight: 8000, hotel: 4000, package: 25000 }
  };

  var key = to.toLowerCase();
  var priceData = cityPrices[key] || cityPrices.default;

  var airlineList = [
    "Air India",
    "IndiGo",
    "Vistara",
    "SpiceJet",
    "Emirates",
    "Qatar Airways"
  ];

  var hotelList = [
    "The Grand Resort",
    "Sea View Palace",
    "Royal Stay Hotel",
    "Palm Paradise Hotel",
    "Luxury Inn"
  ];

  var airline =
    airlineList[Math.floor(Math.random() * airlineList.length)];

  var hotel =
    hotelList[Math.floor(Math.random() * hotelList.length)];

  var flightNo =
    airline.substring(0, 2).toUpperCase() +
    " " +
    Math.floor(Math.random() * 9000 + 1000);

  var totalTravelersPrice = adults + children * 0.6;

  var amount = 0;
  var bookingTitle = "";
  var extraRows = "";

  if (type === "flight") {
    bookingTitle = "✈️ Flight Booking";
    amount = Math.round(priceData.flight * totalTravelersPrice);

    extraRows = `
      <div class="booking-row"><span>Airline</span><span>${airline}</span></div>
      <div class="booking-row"><span>Flight</span><span>${flightNo}</span></div>
      <div class="booking-row"><span>Class</span><span>Economy</span></div>
    `;
  } else if (type === "hotel") {
    bookingTitle = "🏨 Hotel Booking";
    amount = Math.round(priceData.hotel * 3);

    extraRows = `
      <div class="booking-row"><span>Hotel</span><span>${hotel}</span></div>
      <div class="booking-row"><span>Check-in</span><span>${date}</span></div>
      <div class="booking-row"><span>Stay</span><span>3 Nights</span></div>
      <div class="booking-row"><span>Room</span><span>Deluxe Room</span></div>
    `;
  } else {
    bookingTitle = "📦 Travel Package";
    amount = Math.round(priceData.package * totalTravelersPrice);

    extraRows = `
      <div class="booking-row"><span>Airline</span><span>${airline}</span></div>
      <div class="booking-row"><span>Flight</span><span>${flightNo}</span></div>
      <div class="booking-row"><span>Hotel</span><span>${hotel}</span></div>
      <div class="booking-row"><span>Room</span><span>Deluxe Suite</span></div>
      <div class="booking-row"><span>Includes</span><span>Flight + Hotel + Activities</span></div>
      <div class="booking-row"><span>Duration</span><span>5 Nights / 6 Days</span></div>
    `;
  }

  var card = document.createElement("div");
  card.className = "booking-card";

  card.innerHTML = `
    <div class="booking-header">
      <h3>${bookingTitle}</h3>
      <span class="booking-status status-confirmed">Confirmed</span>
    </div>

    <div class="booking-body">
      <div class="booking-row"><span>Route</span><span>${from} → ${to}</span></div>
      <div class="booking-row"><span>Date</span><span>${date}</span></div>
      ${extraRows}
      <div class="booking-row"><span>Travelers</span><span>${adults} Adults, ${children} Child</span></div>
      <div class="booking-row">
        <span>Amount</span>
        <span style="font-weight:700;color:var(--primary)">₹${amount.toLocaleString()}</span>
      </div>
    </div>
  `;

  grid.prepend(card);

  toast("✅ Booking confirmed for " + to);

  document.getElementById("quick-from").value = "";
  document.getElementById("quick-to").value = "";
  document.getElementById("quick-date").value = "";
}

/* =========================
   AUTH
========================= */

var isSignupMode = false;

function openAuthModal() {
  var modal = document.getElementById("auth-modal");
  if (modal) modal.classList.add("show");
}

function closeAuthModal() {
  var modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("show");
}

function toggleAuthMode() {
  isSignupMode = !isSignupMode;

  document.getElementById("auth-title").textContent = isSignupMode
    ? "Create Account"
    : "Sign In";

  document.getElementById("auth-submit").textContent = isSignupMode
    ? "Sign Up"
    : "Sign In";

  document
    .getElementById("auth-submit")
    .setAttribute("onclick", isSignupMode ? "signupUser()" : "loginUser()");

  document.getElementById("signup-name-box").style.display = isSignupMode
    ? "block"
    : "none";

  document.getElementById("auth-switch-text").textContent = isSignupMode
    ? "Already have an account?"
    : "Don’t have an account?";

  document.getElementById("auth-switch-btn").textContent = isSignupMode
    ? "Sign In"
    : "Sign Up";
}

async function signupUser() {
  var name = document.getElementById("signup-name").value.trim();
  var email = document.getElementById("auth-email").value.trim();
  var password = document.getElementById("auth-password").value;

  if (!name || !email || !password) {
    toast("⚠️ Fill all signup details");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    toast("✅ Signup successful");
    closeAuthModal();
  } catch (error) {
    alert(error.message);
  }
}

async function loginUser() {
  var email = document.getElementById("auth-email").value.trim();
  var password = document.getElementById("auth-password").value;

  if (!email || !password) {
    toast("⚠️ Fill login details");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast("✅ Login successful");
    closeAuthModal();
  } catch (error) {
    alert(error.message);
  }
}

async function googleLogin() {
  try {
    var result = await signInWithPopup(auth, provider);

    toast("✅ Google login successful");

    closeAuthModal();

    var btn = document.getElementById("auth-btn");
    if (btn) {
      btn.textContent = result.user.displayName || "User";
      btn.onclick = logoutUser;
    }

  } catch (error) {
    alert(error.message);
  }
}

function logoutUser() {
  signOut(auth);
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", function () {
  var plannerInput = document.getElementById("plan-dest");

  if (plannerInput) {
    if (!plannerInput.value.trim()) {
      plannerInput.value = "Paris";
    }

    generateItinerary();
  }

  var weatherInput = document.getElementById("weather-city");

  if (weatherInput) {
    if (!weatherInput.value.trim()) {
      weatherInput.value = "Mumbai";
    }

    fetchWeather();
  }

  if (document.getElementById("page-budget")) {
    var budgetLocation = document.getElementById("budget-location");

    if (budgetLocation) {
      budgetLocation.addEventListener("input", function () {
        renderExpenses();
      });
    }

    renderExpenses();
  }

  if (typeof onAuthStateChanged !== "undefined") {
    onAuthStateChanged(auth, function (user) {
      var btn = document.getElementById("auth-btn");

      if (!btn) return;

      if (user) {
        btn.textContent = user.displayName || user.email.split("@")[0];
        btn.onclick = logoutUser;
      } else {
        btn.textContent = "Sign In";
        btn.onclick = openAuthModal;
      }
    });
  }
});

function planTrip() {
  var dest = document.getElementById("dest-input").value.trim();
  var checkin = document.getElementById("checkin-input").value;
  var checkout = document.getElementById("checkout-input").value;

  if (!dest || !checkin || !checkout) {
    toast("⚠️ Destination, Check-in aur Check-out fill karo");
    return;
  }

  localStorage.setItem("tripDestination", dest);
  localStorage.setItem("tripCheckin", checkin);
  localStorage.setItem("tripCheckout", checkout);

  window.location.href = "planner.html";
}

function planTrip() {
  var destInput = document.getElementById("dest-input");
  var checkinInput = document.getElementById("checkin-input");
  var checkoutInput = document.getElementById("checkout-input");

  if (!destInput || !checkinInput || !checkoutInput) {
    alert("Home page input IDs missing");
    return;
  }

  var dest = destInput.value.trim();
  var checkin = checkinInput.value;
  var checkout = checkoutInput.value;

  if (!dest || !checkin || !checkout) {
    toast("⚠️ Destination, Check-in aur Check-out fill karo");
    return;
  }

  localStorage.setItem("tripDestination", dest);
  localStorage.setItem("tripCheckin", checkin);
  localStorage.setItem("tripCheckout", checkout);

  window.location.href = "planner.html";
}
function createAutoBookingFromTrip() {
  var shouldCreate = localStorage.getItem("autoCreateBooking");

  if (shouldCreate !== "yes") return;

  var grid = document.getElementById("bookings-grid");
  if (!grid) return;

  var dest = localStorage.getItem("tripDestination") || "Goa";
  var checkin = localStorage.getItem("tripCheckin") || "";
  var checkout = localStorage.getItem("tripCheckout") || "";

  var startDate = new Date(checkin);
  var endDate = new Date(checkout);

  var days = 3;

  if (checkin && checkout && endDate >= startDate) {
    days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  }

  var airline = "IndiGo";
  var flightNo = "IN " + Math.floor(Math.random() * 9000 + 1000);
  var hotel = "The Grand Resort";

  var pricePerDay = {
    Goa: 4500,
    Bali: 9000,
    Paris: 15000,
    Dubai: 12000,
    London: 18000,
    Mumbai: 4000,
    Kerala: 5000,
    Tokyo: 17000,
    Singapore: 14000,
    Thailand: 11000
  };

  var base = pricePerDay[dest] || 6000;
  var amount = base * days;

  var card = document.createElement("div");
  card.className = "booking-card";

  card.innerHTML = `
    <div class="booking-header">
      <h3>📦 ${dest} Trip Package</h3>
      <span class="booking-status status-confirmed">Confirmed</span>
    </div>

    <div class="booking-body">
      <div class="booking-row"><span>Destination</span><span>${dest}</span></div>
      <div class="booking-row"><span>Duration</span><span>${days} Days</span></div>
      <div class="booking-row"><span>Check-in</span><span>${checkin}</span></div>
      <div class="booking-row"><span>Check-out</span><span>${checkout}</span></div>
      <div class="booking-row"><span>Airline</span><span>${airline}</span></div>
      <div class="booking-row"><span>Flight</span><span>${flightNo}</span></div>
      <div class="booking-row"><span>Hotel</span><span>${hotel}</span></div>
      <div class="booking-row"><span>Includes</span><span>Flight + Hotel + Itinerary</span></div>
      <div class="booking-row">
        <span>Amount</span>
        <span style="font-weight:700;color:var(--primary)">₹${amount.toLocaleString()}</span>
      </div>
    </div>
  `;

  grid.prepend(card);

  localStorage.removeItem("autoCreateBooking");
}

function quickPlanTrip(destination) {

  var today = new Date();

  var checkin = new Date(today);
  checkin.setDate(today.getDate() + 7);

  var checkout = new Date(today);
  checkout.setDate(today.getDate() + 10);

  var checkinStr =
    checkin.toISOString().split("T")[0];

  var checkoutStr =
    checkout.toISOString().split("T")[0];

  localStorage.setItem(
    "tripDestination",
    destination
  );

  localStorage.setItem(
    "tripCheckin",
    checkinStr
  );

  localStorage.setItem(
    "tripCheckout",
    checkoutStr
  );

  localStorage.setItem(
    "autoCreateBooking",
    "yes"
  );

  window.location.href = "planner.html";
}