fetch("data/covid-19.json")
    .then(response => response.json())
    .then(data => {

        console.log(data);

        const countrySelector = document.getElementById("countrySelector");

        // -- 1. Populating the country selector dropdown --
        data.countries.forEach(country => {
            const optionSelected = document.createElement("option");

            optionSelected.value = country.code;
            optionSelected.textContent = country.country;
            countrySelector.appendChild(optionSelected);
        });

        // -- 2. Implement the line chart -- 
        let chart = null;

        function drawChart(countryCode) {
            const selected = data.countries.find(c => c.code === countryCode);
            if (!selected) return;

            const labels = selected.data.map(d => d.date);
            const confirmed = selected.data.map(d => d.confirmed);

            if (chart) 
            {
                chart.destroy(); // remove the previous chart before drawing a new one
            }

            chart = new Chart(document.getElementById("casesChart"), {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Confirmed cases - ${selected.country}`,
                        data: confirmed,
                        borderColor: "crimson",
                        tension: 0.2
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true, title: { display: true, text: "Confirmed cases" } },
                        x: { title: { display: true, text: "Date" } }
                    }
                }
            });
        }

        countrySelector.addEventListener("change", () => {
            if (countrySelector.value) drawChart(countrySelector.value);
        });

        // -- 3. Implementing bar chart --
        let barChart = null;

        function drawBarChart(country) {
            const latest = country.data[country.data.length - 1];

            if (barChart) barChart.destroy();

            barChart = new Chart(document.getElementById("barChart"), {
                type: "bar",
                data: {
                    labels: ["Confirmed", "Deaths", "Recovered"],
                    datasets: [{
                        label: `${country.country} (as of ${latest.date})`,
                        data: [latest.confirmed, latest.deaths, latest.recovered],
                        backgroundColor: ["#e74c3c", "#7f8c8d", "#2ecc71"]
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // -- 4. Metric cards --
        function updateCards(country) {
            const latest = country.data[country.data.length - 1];
            const fatality = latest.confirmed > 0
                ? ((latest.deaths / latest.confirmed) * 100).toFixed(2) + "%"
                : "0%";

            document.getElementById("confirmedValue").textContent = latest.confirmed.toLocaleString();
            document.getElementById("deathsValue").textContent = latest.deaths.toLocaleString();
            document.getElementById("recoveredValue").textContent = latest.recovered.toLocaleString();
            document.getElementById("fatalityValue").textContent = fatality;
        }

        // -- 5. Update dashboard based on selected country --
        function updateDashboard(countryCode) {
            const selected = data.countries.find(c => c.code === countryCode);
            if (!selected) return;

            drawChart(countryCode);   // my existing line chart
            drawBarChart(selected);
            updateCards(selected);
        }

        countrySelector.addEventListener("change", () => {
            if (countrySelector.value) updateDashboard(countrySelector.value);
        });

        // Show the first country on load
        countrySelector.value = data.countries[0].code;
        updateDashboard(data.countries[0].code);

    })
    .catch(error => {
        console.error("Failed loading JSON:", error);
    });