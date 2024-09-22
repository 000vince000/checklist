const ghpages = require('gh-pages');
const path = require('path');

ghpages.publish(
  path.join(__dirname, '..', 'dist'),
  {
    branch: 'master', // Changed to 'master'
    repo: 'git@github-000vince000:000vince000/checklist.git',
    message: 'Auto-generated commit',
    force: true,  // Add this line to force push
    silent: false,  // Add this line for more verbose output
  },
  function(err) {
    if (err) {
      console.error('Deployment error:', err);
    } else {
      console.log('Deployment successful!');
    }
  }
);