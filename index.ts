const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}


const getAllMessages = () => {

}

const getMessageFromBank = () => {


}

const getLatestMessageFromBank = (messages) => {

}

const getAttachment  = (messageId, attachmentId) => {

}
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  const gmail = google.gmail({version: 'v1', auth});
gmail.users.messages.attachments.get({messageId: '1811f280083de3b5', id:'ANGjdJ-gDfPw7jP6QUzzByKVtmyIf5hOVEs6bBOkoF2_2Pci7tsUqog4Qo1LiD0gSQhzDJTQX-aIPg-TjkEoxvHDV6-REzTov3oc5ViN5_qn-qjG0ZjFyQnkGxez2SZJu0tdNz41M6poLoKxMG_PTIKUxpLEde4G5N8EM47_ZlVNUKSBA4L6s0FPTROcMyiQL6wFX0nBlEYCPrc6JP7vmA4ygDxB45ibBZU897QioEbaWO7Aiu_l2p1QlAEAodbNqEaiScM0DnS15S-dmncrW8S2qCBFOFo2r5IqT5DlqsVC9uyPaHC_COx1fuxtTnMWkY2emGysJ_tQoe7Ufi0oNFIjT_HreJXo6ApB2SnNWTYeyaIDp4LpT9n-T-fKcKKg4YcjQyrjnT5J4Hx3dHIV',
userId: 'me'}).then(attachment => {
    console.log(attachment);
    fs.writeFile('output/test.txt',attachment.data.data,{encoding: 'UTF-8'}, (err) => {
        console.log('file created')
    })
})
  gmail.users.messages.get({id:'1811f280083de3b5', userId: 'me'}).then(message => {
    //   console.log(message.data.payload.body)
    //   message.data.payload.body
    //   message.data.payload.parts.forEach(part => console.log(part))
  })
  gmail.users.messages.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const messages = res.data.messages;
    if (messages.length) {
    //   console.log('Messages:');
      messages.forEach((message) => {
        //   console.log(message);
        // console.log(`- ${message.id}`);
      });
    } else {
      console.log('No messages found.');
    }
  });
}