function(ellipsis) {
  const greeting = require('ellipsis-random-response').greetingForTimeZone(ellipsis.team.timeZone);
const moment = require('moment-timezone');
const now = moment.tz(ellipsis.team.timeZone);
const today = now.format("M/D/YYYY");
const Sheet = ellipsis.require('ellipsis-gsheets@^0.0.1').Sheet;
const SPREADSHEET_ID = "1xXGQThvw7fHtqzlagWh0JMXPH43emYeeYrCDXKK1TqM";
const TAB_NAME = "Bot";
const DATE_COLUMN_INDEX = 0;
const PRODUCTION_DONATIONS_INDEX = 1;
const NON_PRODUCTION_DONATIONS_INDEX = 2;
const PRODUCE_TOTAL_INDEX = 3;
const SEEDLING_TOTAL_INDEX = 5;
const TOTAL_TRAYS_INDEX = 6;
const TOTAL_SEEDLINGS_INDEX = 7;
const TOTAL_PRODUCE_INDEX = 9;

const doc = new Sheet(ellipsis, SPREADSHEET_ID);
doc.get(TAB_NAME).then((rows) => {
  const rowsWithData = rows.filter((ea) => {
    const date = rowToDate(ea);
    return date && date.isValid();
  });
  if (!rowsWithData.length) {
    ellipsis.error("No valid data found in the spreadsheet", {
      userMessage: "I was unable to find any valid data in the donation tracker data source."
    });
  } else {
    const firstRow = rowsWithData[0];
    const lastRowIndex = rowsWithData.length - 1;
    const lastRow = rowsWithData[lastRowIndex];
    const date = rowToDate(lastRow).format("MMMM D, YYYY");
    const dates = rowsWithData.map((row) => row[DATE_COLUMN_INDEX]);
    const productionDonations = rowsWithData.map((row) => strToFloat(row[PRODUCTION_DONATIONS_INDEX]));
    const nonProductionDonations = rowsWithData.map((row) => strToFloat(row[NON_PRODUCTION_DONATIONS_INDEX]));
    const produceData = rowsWithData.map((row) => strToFloat(row[PRODUCE_TOTAL_INDEX]));
    const seedlingData = rowsWithData.map((row) => strToFloat(row[SEEDLING_TOTAL_INDEX]));
    const chartData = getChartData(dates, productionDonations, nonProductionDonations);
    const chartUrl = `https://quickchart.io/chart?backgroundColor=white&width=500&height=300&c=${encodeURIComponent(JSON.stringify(chartData))}`;
    return ellipsis.uploadFromUrl(chartUrl, {
      filename: `donation-tracking-chart-${now.format("YYYY-MM-DD-HHmmss")}.png`
    }).catch((err) => {
      console.log(err);
      return Promise.resolve(null);
    }).then((uploadedUrl) => {
      const thisWeekProductionDonations = productionDonations[lastRowIndex];
      const thisWeekNonProductionDonations = nonProductionDonations[lastRowIndex];
      const totalDonations = thisWeekProductionDonations + thisWeekNonProductionDonations;
      const productionPctg = thisWeekProductionDonations === 0 ? 0 : thisWeekProductionDonations / totalDonations * 100;
      const nonProductionPctg = thisWeekNonProductionDonations === 0 ? 0 : thisWeekNonProductionDonations / totalDonations * 100;
      let resultText = `
${greeting}

Here is the donation report for the week of ${date}.

_This week’s totals:_
Seedlings donated: **${lastRow[SEEDLING_TOTAL_INDEX] || "(unknown)"}**
Produce donated: **${lastRow[PRODUCE_TOTAL_INDEX] || "(unknown)"} lb**
${Math.round(productionPctg)}% production / ${Math.round(nonProductionPctg)}% non-production

_All-time total donated so far:_
Total trays: **${firstRow[TOTAL_TRAYS_INDEX] || "(unknown)"}**
Total seedlings: **${firstRow[TOTAL_SEEDLINGS_INDEX] || "(unknown)"}**
Total produce: **${firstRow[TOTAL_PRODUCE_INDEX] || "(unknown)"} lb**

`;
      if (uploadedUrl) {
        resultText += `[Donation tracker as of ${today}](${uploadedUrl})`;
      } else {
        resultText += `(An error occurred while trying to create the chart.)`;
      }
      ellipsis.success(resultText);
    });
  }
});
function rowToDate(row) {
  const dateCol = row[DATE_COLUMN_INDEX];
  const date = dateCol ? moment(dateCol, ["M/D/YY", "M/D/YYYY", "MM/DD/YYYY"]) : null;
  return date;
}

function getChartData(dates, productionDonations, nonProductionDonations) {
  return {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Production',
        data: productionDonations,
        borderColor: 'hsl(103, 38%, 75%)',
        backgroundColor: 'hsl(103, 38%, 75%)',
      }, {
        label: 'Non-Production', 
        data: nonProductionDonations,
        borderColor: 'hsl(255, 37%, 62%)',
        backgroundColor: 'hsl(255, 37%, 62%)',
      }]
    },
    options: {
      title: {
        display: true,
        text: "Donations all-time"
      },
      scales: {
        xAxes: [{
          stacked: true
        }],
        yAxes: [{
          type: 'linear',
          position: 'left',
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: "lb of Donations"
          }
        }]
      }
    }
  };
}

function strToFloat(cell) {
  const asFloat = cell ? Number.parseFloat(cell) : 0;
  return Number.isNaN(asFloat) ? 0 : asFloat;
}
}
