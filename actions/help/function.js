function(ellipsis) {
  ellipsis.success("", {
  choices: [{
    allowMultipleSelections: true,
    actionName: "setup",
    label: "Setup to run on schedule"
  }, {
    allowMultipleSelections: true,
    actionName: "weeklyDonationReport",
    label: "Run the report"
  }]
});
ellipsis.team.botName
}
