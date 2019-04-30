function(ellipsis) {
  const greeting = require('ellipsis-random-response').greetingForTimeZone(ellipsis.team.timeZone);
const moment = require('moment-timezone');
const api = require('ellipsis_google_sheets_api')(ellipsis);
const client = api.client;
const sheets = api.sheets;

const SPREADSHEET_ID = "1xXGQThvw7fHtqzlagWh0JMXPH43emYeeYrCDXKK1TqM";
const TAB_NAME = "Bot";
const DATE_COLUMN_INDEX = 0;
const SEEDLING_TOTAL_INDEX = 2;
const PRODUCE_TOTAL_INDEX = 4;
const TOTAL_TRAYS_INDEX = 5;
const TOTAL_SEEDLINGS_INDEX = 6;
const TOTAL_PRODUCE_INDEX = 8;

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
  const firstRow = rowsWithData[0];
  const lastRow = rowsWithData[rowsWithData.length - 1];
  ellipsis.success(`
${greeting}

Here is the donation report for the week of ${rowToDate(lastRow).format("MMMM D, YYYY")}.

This week's totals:
Seedlings donated: ${lastRow[SEEDLING_TOTAL_INDEX]}
Produce donated: ${lastRow[PRODUCE_TOTAL_INDEX]} lb

All-time total donated so far:
Total trays: ${firstRow[TOTAL_TRAYS_INDEX]}
Total seedlings: ${firstRow[TOTAL_SEEDLINGS_INDEX]}
Total produce: ${firstRow[TOTAL_PRODUCE_INDEX]} lb
`
  );
});

function rowToDate(row) {
  const dateCol = row[DATE_COLUMN_INDEX];
  const date = dateCol ? moment(dateCol, ["M/D/YY", "M/D/YYYY", "MM/DD/YYYY"]) : null;
  return date;
}
}
