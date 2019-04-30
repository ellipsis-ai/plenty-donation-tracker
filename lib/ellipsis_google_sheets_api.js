/*
@exportId CPtJcOohSUKM-yetL-hvuQ
*/
module.exports = (function() {
return (ellipsis) => {
  const {google} = ellipsis.require('googleapis@38.0.0');
  const client = new google.auth.JWT({
    email: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/drive'],
    subject: ellipsis.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  });
  const sheets = google.sheets({
    version: 'v4',
    auth: client
  });
  return {
    client: client,
    sheets: sheets
  };
};
})()
     