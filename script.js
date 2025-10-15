// --- Menu di động ---
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    const navLinks = document.querySelector(".md\\:flex");
    if (navLinks) navLinks.classList.toggle("hidden");
  });
}

// --- Pokemon Explorer ---
const randomBtn = document.getElementById("random-pokemon-btn");
const loading = document.getElementById("pokemon-loading");
const display = document.getElementById("pokemon-display");

if (randomBtn) {
  randomBtn.addEventListener("click", async () => {
    loading?.classList.remove("hidden");
    display?.classList.add("hidden");

    try {
      const id = Math.floor(Math.random() * 150) + 1;
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await res.json();

      document.getElementById("pokemon-image").src = data.sprites.front_default;
      document.getElementById("pokemon-name").textContent = data.name.toUpperCase();
      document.getElementById("pokemon-height").textContent = data.height;
      document.getElementById("pokemon-weight").textContent = data.weight;
      document.getElementById("pokemon-types").innerHTML = data.types
        .map(t => `<span class='bg-white/30 px-2 py-1 rounded-full text-sm mr-1'>${t.type.name}</span>`)
        .join("");
    } catch (err) {
      console.error("Error fetching Pokémon:", err);
    } finally {
      loading?.classList.add("hidden");
      display?.classList.remove("hidden");
    }
  });
}
//Weather
document.getElementById("get-weather-btn").addEventListener("click", () => {
  const loading = document.getElementById("weather-loading");
  const card = document.getElementById("weather-card");

  loading.classList.remove("hidden");
  card.classList.add("hidden");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const current = data.current;

        // Cập nhật thông tin
        document.getElementById("weather-temp").innerText = current.temperature_2m.toFixed(1);
        document.getElementById("weather-wind").innerText = `${current.wind_speed_10m} km/h`;
        document.getElementById("weather-direction").innerText = `${current.wind_direction_10m}°`;
        document.getElementById("weather-time").innerText = `Cập nhật: ${new Date(current.time).toLocaleTimeString("vi-VN")}`;

        // Chuyển mã thời tiết thành biểu tượng và mô tả
        const weatherCode = current.weather_code;
        let icon = "☀️", desc = "Trời quang";
        if ([1, 2, 3].includes(weatherCode)) { icon = "🌤️"; desc = "Ít mây"; }
        else if ([45, 48].includes(weatherCode)) { icon = "🌫️"; desc = "Sương mù"; }
        else if ([51, 61, 80].includes(weatherCode)) { icon = "🌦️"; desc = "Mưa nhẹ"; }
        else if ([63, 65, 81, 82].includes(weatherCode)) { icon = "🌧️"; desc = "Mưa to"; }
        else if ([71, 73, 75].includes(weatherCode)) { icon = "❄️"; desc = "Tuyết rơi"; }
        else if ([95, 96, 99].includes(weatherCode)) { icon = "⛈️"; desc = "Giông bão"; }

        document.getElementById("weather-icon").innerText = icon;
        document.getElementById("weather-description").innerText = desc;

        // Hiện kết quả
        loading.classList.add("hidden");
        card.classList.remove("hidden");

        // Màu nền động theo nhiệt độ
        let bgColor = "bg-blue-600";
        if (current.temperature_2m > 30) bgColor = "bg-red-500";
        else if (current.temperature_2m > 20) bgColor = "bg-orange-400";
        else if (current.temperature_2m < 15) bgColor = "bg-cyan-500";

        card.className = `rounded-xl p-6 text-white text-center shadow-inner transition-all duration-500 ${bgColor}`;
      } catch (error) {
        alert("Không thể lấy dữ liệu thời tiết!");
        console.error(error);
      }
    }, () => {
      alert("Không thể truy cập vị trí. Hãy bật định vị (GPS).");
      loading.classList.add("hidden");
    });
  } else {
    alert("Trình duyệt không hỗ trợ định vị.");
  }
});

// --- Currency Exchange ---
async function fetchExchangeRate() {
  const loadingEl = document.getElementById("currency-loading");
  const displayEl = document.getElementById("currency-display");
  const errorEl = document.getElementById("currency-error");

  loadingEl?.classList.remove("hidden");
  displayEl?.classList.add("opacity-50");
  errorEl?.classList.add("hidden");

  try {
    // API chính (ổn định hơn exchangerate.host)
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();

    const rate = data?.rates?.VND;
    if (!rate) throw new Error("Invalid data");

    document.getElementById("exchange-rate").textContent = rate.toLocaleString("vi-VN");
    document.getElementById("usd-10").textContent = (rate * 10).toLocaleString("vi-VN") + " VND";
    document.getElementById("usd-100").textContent = (rate * 100).toLocaleString("vi-VN") + " VND";
    document.getElementById("last-updated").textContent =
      `Cập nhật lần cuối: ${new Date(data.time_last_update_utc).toLocaleString("vi-VN")}`;

    // Lưu cache
    localStorage.setItem("usd-vnd-rate", JSON.stringify({ rate, timestamp: Date.now() }));

  } catch (err) {
    console.error("❌ Lỗi tải dữ liệu:", err);

    const stored = localStorage.getItem("usd-vnd-rate");
    if (stored) {
      const { rate, timestamp } = JSON.parse(stored);
      const date = new Date(timestamp);

      document.getElementById("exchange-rate").textContent = rate.toLocaleString("vi-VN");
      document.getElementById("usd-10").textContent = (rate * 10).toLocaleString("vi-VN") + " VND";
      document.getElementById("usd-100").textContent = (rate * 100).toLocaleString("vi-VN") + " VND";
      document.getElementById("last-updated").textContent =
        `Cập nhật lần cuối: ${date.toLocaleString("vi-VN")} (Offline)`;
    } else {
      errorEl?.classList.remove("hidden");
    }
  } finally {
    loadingEl?.classList.add("hidden");
    displayEl?.classList.remove("opacity-50");
  }
}

const refreshBtn = document.getElementById("refresh-rate-btn");
refreshBtn?.addEventListener("click", fetchExchangeRate);

document.addEventListener("DOMContentLoaded", () => {
  const stored = localStorage.getItem("usd-vnd-rate");
  if (stored) {
    const { rate, timestamp } = JSON.parse(stored);
    const date = new Date(timestamp);

    document.getElementById("exchange-rate").textContent = rate.toLocaleString("vi-VN");
    document.getElementById("usd-10").textContent = (rate * 10).toLocaleString("vi-VN") + " VND";
    document.getElementById("usd-100").textContent = (rate * 100).toLocaleString("vi-VN") + " VND";
    document.getElementById("last-updated").textContent =
      `Cập nhật lần cuối: ${date.toLocaleString("vi-VN")}`;
  }
  fetchExchangeRate();
});
