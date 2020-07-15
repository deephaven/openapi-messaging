const nodemailer = require('nodemailer');
const openapiInclude = require('./openapiIncludeAsync');

const host = 'server.name';
const credentials = { username: 'username', token: 'secret', type: 'password' };
const apiFileName = 'irisapi.nocache.js';

start();
async function start() {
  try {
    await openapiInclude(`https://${host}/irisapi/${apiFileName}`, apiFileName);
    const wsUrl = `wss://${host}/socket`;

    let client = new iris.Client(wsUrl);
    client.addEventListener('connect', async () => {
      await client.login(credentials);
      console.log('Authenticated');

      // Gets a random test account from ethereal
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      new PQAlertMonitor(client, transporter);
    });
  } catch(err) {
    console.error(err);
  }
}

class PQAlertMonitor {
  constructor(client, transporter) {
    this.transporter = transporter;
    this.client = client;
    this.client.addEventListener(iris.Client.EVENT_CONFIG_UPDATED, e => this.onConfigUpdate(e));
    console.log('Monitoring...');
  }

  /**
   * Checks if the update is a failure and sends a message if it is
   */
  async onConfigUpdate(event) {
    console.log('Got config updated event', event.detail.name, event.detail.status);
    
    switch (event.detail.status) {
      case 'Disconnected':
      case 'Error':
      case 'Failed': {
        this.sendMessage(event);
        break;
      }
    }
  }

  /**
   * Sends a message for a given event
   */
  async sendMessage(event) {
    let info = await this.transporter.sendMail({
      from: 'Test Failure <test@failure.com>',
      to: 'failure@notifications.com',
      subject: `[Deephaven] PQ ${event.detail.name} ${event.detail.status}`,
      text: `Name: ${event.detail.name}\nSerial: ${event.detail.serial}\nHost: ${host}`
    });

    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
