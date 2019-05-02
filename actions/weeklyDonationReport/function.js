function(ellipsis) {
  const greeting = require('ellipsis-random-response').greetingForTimeZone(ellipsis.team.timeZone);
const moment = require('moment-timezone');
const today = moment.tz(ellipsis.team.timeZone).format("M/D/YYYY");
const {client, sheets} = require('ellipsis_google_sheets_api')(ellipsis);

const SPREADSHEET_ID = "1xXGQThvw7fHtqzlagWh0JMXPH43emYeeYrCDXKK1TqM";
const TAB_NAME = "Bot";
const DATE_COLUMN_INDEX = 0;
const SEEDLING_TOTAL_INDEX = 2;
const PRODUCE_TOTAL_INDEX = 4;
const TOTAL_TRAYS_INDEX = 5;
const TOTAL_SEEDLINGS_INDEX = 6;
const TOTAL_PRODUCE_INDEX = 8;
let resultText = "";

client.authorize().then(() => {
  return sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: TAB_NAME
  });
}).then((result) => {
  const rows = result.data.values;
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
    const lastRow = rowsWithData[rowsWithData.length - 1];
    const date = rowToDate(lastRow).format("MMMM D, YYYY");
    const dates = rowsWithData.map((row) => row[DATE_COLUMN_INDEX]);
    const produceData = rowsWithData.map((row) => Number.parseFloat(row[PRODUCE_TOTAL_INDEX]));
    const seedlingData = rowsWithData.map((row) => Number.parseFloat(row[SEEDLING_TOTAL_INDEX]));
    const chartData = getChartData(dates, produceData, seedlingData);
    const chartUrl = encodeURI(`https://quickchart.io/chart?c=${JSON.stringify(chartData)}&backgroundColor=white&width=500&height=300`);
    ellipsis.success(`
${greeting}

Here is the donation report for the week of ${date}.

_This week’s totals:_
Seedlings donated: **${lastRow[SEEDLING_TOTAL_INDEX] || "(unknown)"}**
Produce donated: **${lastRow[PRODUCE_TOTAL_INDEX] || "(unknown)"} lb**

_All-time total donated so far:_
Total trays: **${firstRow[TOTAL_TRAYS_INDEX] || "(unknown)"}**
Total seedlings: **${firstRow[TOTAL_SEEDLINGS_INDEX] || "(unknown)"}**
Total produce: **${firstRow[TOTAL_PRODUCE_INDEX] || "(unknown)"} lb**

[Donation tracker as of ${today}](${chartUrl})
`);
  }
});

function rowToDate(row) {
  const dateCol = row[DATE_COLUMN_INDEX];
  const date = dateCol ? moment(dateCol, ["M/D/YY", "M/D/YYYY", "MM/DD/YYYY"]) : null;
  return date;
}

function getChartData(dates, produceData, seedlingData) {
  return {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        type: 'line',
        lineTension: 0.2,
        fill: false,
        label: 'Produce',
        borderWidth: 2,
        data: produceData,
        borderColor: 'hsl(231, 50%, 58%)',
        backgroundColor: 'hsl(231, 50%, 58%)',
        yAxisID: 'produce'
      }, {
        label: 'Seedlings', 
        data: seedlingData,
        backgroundColor: 'hsl(127, 75%, 48%)',
        yAxisID: 'seedlings'
      }]
    },
    options: {
      title: {
        display: true,
        text: "Donations all-time"
      },
      scales: {
        yAxes: [{
          id: 'seedlings',
          type: 'linear',
          position: 'right',
          scaleLabel: {
            display: true,
            labelString: 'Number of Seedlings'
          }
        }, {
          id: 'produce',
          type: 'linear',
          position: 'left',
          scaleLabel: {
            display: true,
            labelString: "lb of Produce"
          }
        }]
      }
    }
  };
}
}
