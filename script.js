fetch("data/covid-19.json")
    .then(response => response.json())
    .then(data => {

        console.log(data);

        const countrySelector = document.getElementById("countrySelector");

        data.countries.forEach(country => {
            const optionSelected = document.createElement("option");

            optionSelected.value = country.code;
            optionSelected.textContent = country.country;
            countrySelector.appendChild(optionSelected);
        });

        // implementing the chart.js to display the line graph
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

        // display the first country so the chart is visible when you load the page
        countrySelector.value = data.countries[0].code;
        drawChart(data.countries[0].code);

    })
    .catch(error => {
        console.error("Failed loading JSON:", error);
    });