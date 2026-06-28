// WIP Task Daily Notifier
// Reads wip_tasks.json from Google Drive and sends a daily SMS summary.
//
// Setup:
//   1. Go to script.google.com and create a new project
//   2. Paste this file's contents in
//   3. Set PHONE_GATEWAY below to your number@carrier-gateway
//   4. Run findWipFile() once to confirm it locates the right file (check the log)
//   5. Add a time-based trigger: Triggers → Add Trigger → sendDailyWipSummary → Time-driven → Day timer

var PHONE_GATEWAY = '9173853869@msg.fi.google.com';

// Folder path to the prod copy of wip_tasks.json
var ROOT_FOLDER = 'Collaborative Checklist App';
var DOMAIN_FOLDER = '000vince000.github.io';
var USER_FOLDER = '00vince00@gmail.com';

function getChildFolder(parent, name) {
  var folders = parent.getFoldersByName(name);
  if (!folders.hasNext()) {
    throw new Error('Folder not found: ' + name);
  }
  return folders.next();
}

function getWipFile() {
  var root = getChildFolder(DriveApp.getRootFolder(), ROOT_FOLDER);
  var domain = getChildFolder(root, DOMAIN_FOLDER);
  var user = getChildFolder(domain, USER_FOLDER);

  var files = user.getFilesByName('wip_tasks.json');
  if (!files.hasNext()) {
    throw new Error('wip_tasks.json not found under ' + DOMAIN_FOLDER + '/' + USER_FOLDER);
  }
  return files.next();
}

function findWipFile() {
  var file = getWipFile();
  Logger.log('Found: ' + file.getName() + ' | ID: ' + file.getId() +
             ' | Path: ' + file.getParents().next().getName());
}

function sendDailyWipSummary() {
  var file = getWipFile();
  var content = file.getBlob().getDataAsString();
  var tasks = JSON.parse(content);

  if (!tasks || tasks.length === 0) {
    Logger.log('No WIP tasks found, skipping notification.');
    return;
  }

  var taskNames = tasks.map(function(t) { return '• ' + t.name; }).join('\n');
  var message = taskNames;

  MailApp.sendEmail({
    to: PHONE_GATEWAY,
    subject: 'Checklist WIP Tasks',
    body: message,
    name: 'Checklist',
  });

  Logger.log('Sent: ' + message);
}
