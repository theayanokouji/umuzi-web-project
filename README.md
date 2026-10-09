# COVID-19 Early Outbreak Dashboard

An interactive dashboard for exploring the early phase of the COVID-19 outbreak (February to March 2020), up to the WHO pandemic declaration on 11 March 2020. It reads a JSON dataset from the Johns Hopkins CSSE COVID-19 repository and shows trends for a selected country. No login is needed.

## Features

- **Country selector** to choose a country from the dataset (China, Italy, South Korea, United States, South Africa)
- **Key metric cards**: latest confirmed cases, deaths, recoveries and active cases
- **Line chart** of cumulative confirmed cases, deaths and recoveries over time
- **Daily new cases bar chart**, calculated from the cumulative data
- **Date range filter** (From / To date pickers) that updates the cards and both charts
- **Responsive layout** for desktop and tablet (and phone) screens

## Project structure

```
index.html
style.css
script.js
README.md
data/
    covid-19.json
screenshots/        (testing evidence)
```

## Setup

The dashboard loads the JSON file with `fetch()`, which browsers block when a page is opened directly from disk (`file://`). Serve the folder through a local web server instead.

**Option 1: VS Code Live Server**
1. Install the "Live Server" extension in VS Code.
2. Right-click `index.html` and choose "Open with Live Server".

**Option 2: Python**
1. Open a terminal in the project folder.
2. Run `python -m http.server 8000`.
3. Open `http://localhost:8000` in a browser.

An internet connection is needed because Chart.js is loaded from a CDN (`https://cdn.jsdelivr.net/npm/chart.js`).

## How to use

1. Pick a country from the dropdown. The first country loads automatically.
2. Read the latest figures in the four metric cards.
3. Use the **From** and **To** date pickers to narrow the timeline. The cards, line chart and bar chart all update.
4. Click **Reset date range** to go back to the full period for that country.

## Calculations

| Metric | How it is calculated |
|---|---|
| Latest confirmed / deaths / recovered | The values from the most recent reading inside the selected date range (the last reading of the dataset when the full range is selected) |
| Active cases | `confirmed - deaths - recovered` for that latest reading. Values below zero are shown as 0 |
| Daily new cases | The increase in cumulative confirmed cases since the previous reading, divided by the number of days between the two readings, rounded to a whole number. A drop in the cumulative number (a data correction) is treated as 0 |
| Date range filter | Keeps only readings whose date is between the From and To dates, inclusive. Daily new cases are calculated on the full series first, so the first reading in a filtered range still compares against the reading before it |

### Assumptions and limitations

- The dataset does not have a reading for every calendar day. For example, China has readings on 1, 10 and 20 February and on 1, 10, 20 and 31 March. Daily new cases are therefore **average new cases per day between two readings**, and the tooltip shows the total change and the number of days it covers.
- The first reading of a country has no earlier reading to compare against, so it has no bar in the daily chart.
- The line chart places readings evenly along the x-axis, even though the gaps between dates are not equal.
- Active cases are an estimate derived from the data, not a reported figure.

## Technologies

- HTML, CSS, JavaScript
- [Chart.js](https://www.chartjs.org/) for the charts
- Data: COVID-19 Data Repository by Johns Hopkins CSSE

## Testing evidence

Screenshots are saved in the `screenshots/` folder.

| Test | Expected result | Screenshot | Pass |
|---|---|---|---|
| China selected | Cards, line chart and bar chart show China data | `screenshots/china.PNG` | |
| Italy selected | Charts start from 20 Feb 2020 | `screenshots/italy.PNG` | |
| South Korea selected | Cards and charts update | `screenshots/South-Korea.PNG` | |
| United States selected | Cards and charts update | `screenshots/United-States.PNG` | |
| South Africa selected | Cards and charts update | `screenshots/South-Africa.PNG` | |
| Date range narrowed | Cards and both charts only cover the chosen dates | `screenshots/Testing-Date-Range-South-Africa.PNG` | |
| Browser console | Logged data and no errors | `screenshots/console.png` | |
| Testing UI | Testing the UI Before Adding Functionality | `screenshots/TestingUI.PNG` | |