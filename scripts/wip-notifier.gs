// WIP Task Daily Notifier
// Reads wip_tasks.json from Google Drive and sends a daily SMS summary.
//
// Setup:
//   1. Go to script.google.com and create a new project
//   2. Paste this file's contents in
//   3. Set PHONE_GATEWAY below to your number@carrier-gateway
//   4. Run findWipFile() once manually to locate your wip_tasks.json file ID,
//      then paste that ID into WIP_FILE_ID
//   5. Add a time-based trigger: Triggers → Add Trigger → sendDailyWipSummary → Time-driven → Day timer

var PHONE_GATEWAY = '9173853869@msg.fi.google.com';
var WIP_FILE_ID = ''; // paste your wip_tasks.json file ID here

function findWipFile() {
  var files = DriveApp.getFilesByName('wip_tasks.json');
  while (files.hasNext()) {
    var file = files.next();
    Logger.log('Found: ' + file.getName() + ' | ID: ' + file.getId() + ' | Path: ' + file.getParents().next().getName());
  }
}

function sendDailyWipSummary() {
  if (!WIP_FILE_ID) {
    Logger.log('WIP_FILE_ID is not set. Run findWipFile() first.');
    return;
  }

  var file = DriveApp.getFileById(WIP_FILE_ID);
  var content = file.getBlob().getDataAsString();
  var tasks = JSON.parse(content);

  if (!tasks || tasks.length === 0) {
    Logger.log('No WIP tasks found, skipping notification.');
    return;
  }

  var taskNames = tasks.map(function(t) { return t.name; }).join(', ');
  var message = 'WIP tasks: ' + taskNames;

  MailApp.sendEmail({
    to: PHONE_GATEWAY,
    subject: '',
    body: message,
  });

  Logger.log('Sent: ' + message);
}
