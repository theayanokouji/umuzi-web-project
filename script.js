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

    })
    .catch(error => {
        console.error("Failed loading JSON:", error);
    });