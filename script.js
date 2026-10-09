const DATA_URL = "data/covid-19.json";

// ---------- DOM references ----------
const countrySelector = document.getElementById("countrySelector");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const resetButton = document.getElementById("resetRange");
const messageBox = document.getElementById("message");
const asOfText = document.getElementById("asOf");

const cardValues = {
    confirmed: document.getElementById("confirmedValue"),
    deaths: document.getElementById("deathsValue"),
    recovered: document.getElementById("recoveredValue"),
    active: document.getElementById("activeValue")
};

// ---------- State ----------
let countries = [];
let selectedCountry = null;
let lineChart = null;
let dailyChart = null;

// ---------- Helpers ----------
function formatNumber(n) {
    return Number(n).toLocaleString();
}

function daysBetween(dateA, dateB) {
    return Math.round((new Date(dateB) - new Date(dateA)) / 86400000);
}

function showMessage(text) {
    messageBox.textContent = text;
    messageBox.hidden = !text;
}

// New cases between each pair of consecutive readings, converted to a per-day average.
// The dataset does not have a reading for every calendar day, so we divide the change
// by the number of days between the two readings.
function calculateDailyNew(series) {
    const result = [];
    for (let i = 1; i < series.length; i++) {
        const previous = series[i - 1];
        const current = series[i];
        const days = Math.max(1, daysBetween(previous.date, current.date));
        const change = Math.max(0, current.confirmed - previous.confirmed);
        result.push({
            date: current.date,
            change: change,
            days: days,
            perDay: Math.round(change / days)
        });
    }
    return result;
}

// ---------- Rendering ----------
function resetCards() {
    Object.values(cardValues).forEach(el => (el.textContent = "-"));
    asOfText.textContent = "";
}

function updateCards(latest) {
    const active = Math.max(0, latest.confirmed - latest.deaths - latest.recovered);

    cardValues.confirmed.textContent = formatNumber(latest.confirmed);
    cardValues.deaths.textContent = formatNumber(latest.deaths);
    cardValues.recovered.textContent = formatNumber(latest.recovered);
    cardValues.active.textContent = formatNumber(active);

    asOfText.textContent = `${selectedCountry.country}: latest data in the selected range is from ${latest.date}`;
}

function drawLineChart(series) {
    if (lineChart) lineChart.destroy();

    lineChart = new Chart(document.getElementById("lineChart"), {
        type: "line",
        data: {
            labels: series.map(d => d.date),
            datasets: [
                {
                    label: "Confirmed",
                    data: series.map(d => d.confirmed),
                    borderColor: "#e74c3c",
                    backgroundColor: "#e74c3c",
                    tension: 0.2
                },
                {
                    label: "Deaths",
                    data: series.map(d => d.deaths),
                    borderColor: "#34495e",
                    backgroundColor: "#34495e",
                    tension: 0.2
                },
                {
                    label: "Recovered",
                    data: series.map(d => d.recovered),
                    borderColor: "#27ae60",
                    backgroundColor: "#27ae60",
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                title: { display: true, text: `Cumulative cases - ${selectedCountry.country}` }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "People (cumulative)" } },
                x: { title: { display: true, text: "Date" } }
            }
        }
    });
}

function drawDailyChart(daily) {
    if (dailyChart) dailyChart.destroy();

    dailyChart = new Chart(document.getElementById("dailyChart"), {
        type: "bar",
        data: {
            labels: daily.map(d => d.date),
            datasets: [{
                label: "New confirmed cases per day",
                data: daily.map(d => d.perDay),
                backgroundColor: "#e67e22"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Daily new cases (average since previous report) - ${selectedCountry.country}`
                },
                tooltip: {
                    callbacks: {
                        afterLabel: ctx => {
                            const d = daily[ctx.dataIndex];
                            return `+${formatNumber(d.change)} over ${d.days} day(s)`;
                        }
                    }
                }
            },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: "New cases per day" } },
                x: { title: { display: true, text: "Date of report" } }
            }
        }
    });
}

function destroyCharts() {
    if (lineChart) { lineChart.destroy(); lineChart = null; }
    if (dailyChart) { dailyChart.destroy(); dailyChart = null; }
}

function render() {
    if (!selectedCountry) return;

    const start = startDateInput.value;
    const end = endDateInput.value;

    if (start > end) {
        showMessage("The start date must be on or before the end date.");
        return;
    }

    const filtered = selectedCountry.series.filter(d => d.date >= start && d.date <= end);
    const dailyFiltered = selectedCountry.daily.filter(d => d.date >= start && d.date <= end);

    if (filtered.length === 0) {
        showMessage("No data in the selected date range.");
        resetCards();
        destroyCharts();
        return;
    }

    showMessage(dailyFiltered.length === 0
        ? "Only one reading falls in this range, so there is no daily change to show."
        : "");

    updateCards(filtered[filtered.length - 1]);
    drawLineChart(filtered);
    drawDailyChart(dailyFiltered);
}

// ---------- Country and date handling ----------
function clearDashboard() {
    selectedCountry = null;
    startDateInput.value = "";
    endDateInput.value = "";
    startDateInput.disabled = true;
    endDateInput.disabled = true;
    resetCards();
    destroyCharts();
    showMessage("");
}

function resetDateRange() {
    if (!selectedCountry) return;

    const firstDate = selectedCountry.series[0].date;
    const lastDate = selectedCountry.series[selectedCountry.series.length - 1].date;

    startDateInput.min = endDateInput.min = firstDate;
    startDateInput.max = endDateInput.max = lastDate;
    startDateInput.value = firstDate;
    endDateInput.value = lastDate;
}

function selectCountry(code) {
    const country = countries.find(c => c.code === code);

    if (!country) {
        clearDashboard();
        return;
    }

    selectedCountry = country;
    startDateInput.disabled = false;
    endDateInput.disabled = false;
    resetDateRange();
    render();
}

// ---------- Load data ----------
fetch(DATA_URL)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => {
        console.log(data);

        // Sort each country's readings by date and pre-calculate daily new cases
        countries = data.countries.map(c => {
            const series = [...c.data].sort((a, b) => a.date.localeCompare(b.date));
            return { country: c.country, code: c.code, series: series, daily: calculateDailyNew(series) };
        });

        countries.forEach(c => {
            const option = document.createElement("option");
            option.value = c.code;
            option.textContent = c.country;
            countrySelector.appendChild(option);
        });

        // Events
        countrySelector.addEventListener("change", () => selectCountry(countrySelector.value));
        startDateInput.addEventListener("change", render);
        endDateInput.addEventListener("change", render);
        resetButton.addEventListener("click", () => {
            resetDateRange();
            render();
        });

        // Show the first country on load
        countrySelector.value = countries[0].code;
        selectCountry(countries[0].code);
    })
    .catch(error => {
        console.error("Failed loading JSON:", error);
        showMessage("Could not load data/covid-19.json. Run the page through a local server (for example VS Code Live Server) instead of opening the file directly.");
    });
