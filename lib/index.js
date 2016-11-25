import _ from 'lodash';
import Promise from 'bluebird';

const SCRIPT_ID = 'facebook-jssdk'
    , ROOT_ID = 'fb-root';

var init = function(options) {
  window.fbAsyncInit = function() {
    window.FB.init({ 
      appId : options.appId 
    , xfbml: true
    , version: options.version
    });
  };
}

var inject = function(options, done) {
  var script = document.getElementById(SCRIPT_ID);

  if (script) return done();

  script = document.createElement('script');
  
  script.id = SCRIPT_ID;
  script.src = 'https://connect.facebook.net/' + options.locale + '/sdk.js'
  script.async = true;
  script.onload = done;

  document.getElementsByTagName('head')[0].appendChild(script);
};

var addRoot = function() {
  var root = document.getElementById(ROOT_ID);

  if (root) return root;

  root = document.createElement('div');

  root.id = ROOT_ID;
  document.body.insertBefore(root, document.body.childNodes[0]);

  return root;
};

export default class Facebook {
  constructor(config) {
    this.options = _.assign({ version: 'v2.5', locale: 'en_US' }, config);

    this.isReady = false;

    inject(this.options, function() {
      this.isReady = true;
    }.bind(this));
    
    init(this.options);

    addRoot();
  }

  set isReady(value) {
    this._ready = value;
  }

  get isReady() {
    return this._ready === true;
  }

  loginStatus() {
    return new Promise(function(resolve) {
      if (this.isReady === false) return reject(new Error('facebook.not_ready'));

      window.FB.getLoginStatus(resolve);
    }.bind(this));
  }

  login() {
    return new Promise(function(resolve, reject) {
      var scope = this.options.scope;

      if (this.isReady === false) return reject(new Error('facebook.not_ready'));
    
      return this.loginStatus().then(function(response) {
        if (response.status === 'connected') return resolve(response.authResponse);

        window.FB.login(function(response) {
          if (response.status !== 'connected') return reject(new Error('facebook.not_connected'));
          resolve(response.authResponse);
        }, { scope });

      });
    }.bind(this));
  }
};
