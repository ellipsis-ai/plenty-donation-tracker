function(channel, recurrence, ellipsis) {
  const moment = require('moment-timezone');
const EllipsisApi = require('ellipsis-api');
const api = new EllipsisApi(ellipsis);
api.actions.unschedule({
  channel: channel,
  actionName: "weeklyDonationReport"
}).then(() => api.actions.schedule({
  channel: channel,
  actionName: "weeklyDonationReport",
  recurrence: recurrence
})).then((result) => {
  ellipsis.success(`
OK, I will run the donation tracker in the channel ${channel} ${result.scheduled.recurrence}.

The first run will be ${moment.tz(result.scheduled.firstRecurrence, ellipsis.team.timeZone).format("LLLL z")}.
`);
}).catch((err) => {
  ellipsis.error(err, {
    userMessage: "An error occurred while trying to schedule the donation tracker. Make sure you provide a valid channel name and a valid schedule."
  });
});
}
