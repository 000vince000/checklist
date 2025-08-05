const ghpages = require('gh-pages');
const path = require('path');

ghpages.publish(
  path.join(__dirname, '..', 'dist'),
  {
    branch: 'github-pages',
    repo: 'git@github.com:000vince000/checklist.git',
    message: 'Auto-generated commit from script/deploy.js',
    silent: false,
    add: true, // This option ensures that the deployment adds to the existing branch
  },
  function(err) {
    if (err) {
      console.error('Deployment error:', err);
    } else {
      console.log('Deployment successful!');
    }
  }
);