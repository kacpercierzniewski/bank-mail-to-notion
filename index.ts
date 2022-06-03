
import * as fs from 'fs';
import * as readline from 'readline';
import {google, gmail_v1} from 'googleapis'
import { OAuth2Client } from 'google-auth-library';
import { GaxiosResponse } from 'gaxios';
import { BANK_MAIL } from './consts';
import { getDataFromHtml } from './getDataFromHtml';
import { addEntriesToNotionDatabase } from './addEntriesToNotionDatabase';
require('dotenv').config();

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
  authorize(JSON.parse(content.toString()), start);
});


function authorize(credentials: Record<string,{client_secret: string, client_id: string, redirect_uris: string}>, callback: (auth: OAuth2Client) => any) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    //@ts-ignore
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    //@ts-ignore
    callback(oAuth2Client);
  });
}

function getNewToken(oAuth2Client: OAuth2Client, callback: (auth: OAuth2Client | string) => void) {
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


const getLastMessagesFromGivenSender = async (gmailService: gmail_v1.Gmail, sender: string, preferedDate?: string) => {
  const beforeDate = preferedDate ? new Date(preferedDate)  : new Date();
  const afterDate = preferedDate ? new Date(preferedDate)  : new Date();
  afterDate.setDate(preferedDate ? afterDate.getDate() + 1 : afterDate.getDate() - 1);
  beforeDate.setDate(preferedDate ? beforeDate.getDate() + 2 : beforeDate.getDate());
  console.log(afterDate)
  console.log(beforeDate)
    return gmailService.users.messages.list({
  userId: 'me',
  q: `from:${sender} has:attachment filename:htm after:${afterDate.toLocaleDateString()} before:${beforeDate.toLocaleDateString()}`,
})

}

const getLastMessage = <T>(messages: Array<T>):T => {
  return   messages.slice(-1)[0];
}

const getMessageDetails = async (gmailService: gmail_v1.Gmail, message:gmail_v1.Schema$Message) =>  {
  return gmailService.users.messages.get({id: message.id, userId: 'me'})
}

const getHtmAttachmentDetails  = (message: any ) => {
  //@ts-ignore
  const element = message.data.payload.parts[0].parts.find(el => el.filename.includes('.htm'));
  return {
    attachmentId: element.body.attachmentId,
    filename: element.filename,
  }
}

const getAttachment = async (gmailService: gmail_v1.Gmail, messageId: string, id: string) => {
  console.log(id);
  return gmailService.users.messages.attachments.get({
    messageId,
    id,
    userId:'me',
  })
}

const saveBankFile = async (auth: string | OAuth2Client) => {
    //@ts-ignore
  const gmailService = google.gmail({ version: "v1",auth: auth});
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() -1);
  const bankMessages = await getLastMessagesFromGivenSender(gmailService, BANK_MAIL, yesterday.toDateString())
  const latestMessages = bankMessages.data.messages;
  const lastMessage = getLastMessage(latestMessages);
  const lastMessageDetails = await getMessageDetails(gmailService, lastMessage); 
  const {attachmentId, filename} = getHtmAttachmentDetails(lastMessageDetails)
  const attachment = await getAttachment(gmailService, lastMessageDetails.data.id, attachmentId);

  fs.writeFileSync(`output/${filename}`, attachment.data.data, {encoding: 'base64url'})

  return {filename};
}

const start = async (auth: string | OAuth2Client) =>  {
  const {filename} = await saveBankFile(auth);
  fs.readFile(`output/${filename}`, (err,data) => {
  const parsedEntries = getDataFromHtml(data.toString(),filename)
  addEntriesToNotionDatabase(parsedEntries);
  })
}