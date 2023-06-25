import {Dropbox} from "dropbox";
import {authDB} from "@/storage_manager/index_db/db";

export class AuthManager {
  static instance;

  constructor() {
    if (AuthManager.instance) {
      return AuthManager.instance;
    }

    AuthManager.instance = this;
  }

  onAuthChange(callback) {
    const url = process.env.NEXT_PUBLIC_ENV === 'development' ? 'https://tomato-todo.vercel.app' : 'http://localhost:3000';
    if(AuthManager.$isAuthenticated()) {
      const time = new Date().getTime() + AuthManager.$getExpireInFromUrl()*1000;
      authDB.auth.get('user').then(async authData => {
        if(authData) {
          authDB.auth.put({
            id: 'user',
            token: AuthManager.$getAccessTokenFromUrl(),
            expiresIn: time,
          }).then(() => {
            callback(true);
            window.open(url, '_self');
          });
        }else {
          authDB.auth.add({
            id: 'user',
            token: AuthManager.$getAccessTokenFromUrl(),
            expiresIn: time,
          }).then(() => {
            callback(true);
            window.open(url, '_self');
          });
        }
      });
    }else {
      authDB.auth.get('user').then(authData => {
        if(authData?.expiresIn > new Date().getTime()) {
          callback(true);
        }else {
          callback(false);
        }
      });
    }

  }

  async signIn() {
    const url = process.env.NEXT_PUBLIC_ENV === 'development' ? 'https://tomato-todo.vercel.app' : 'http://localhost:3000';
    const dbx = new Dropbox({ clientId: process.env.NEXT_PUBLIC_DROPBOX_CLIENT_ID });
    dbx.auth.getAuthenticationUrl(url).then(url => {
      window.open(url, '_self');
    })
  }

  static $parseQueryString(str) {
    const ret = Object.create(null);

    if (typeof str !== 'string') {
      return ret;
    }

    str = str.trim().replace(/^(\?|#|&)/, '');

    if (!str) {
      return ret;
    }

    str.split('&').forEach((param) => {
      const parts = param.replace(/\+/g, ' ').split('=');
      // Firefox (pre 40) decodes `%3D` to `=`
      // https://github.com/sindresorhus/query-string/pull/37
      let key = parts.shift();
      let val = parts.length > 0 ? parts.join('=') : undefined;

      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (ret[key] === undefined) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
    });

    return ret;
  }

  static $getAccessTokenFromUrl() {
    return AuthManager.$parseQueryString(window.location.hash).access_token;
  }

  static $getExpireInFromUrl() {
    const expiresIn = AuthManager.$parseQueryString(window.location.hash).expires_in;
    if(expiresIn) return parseInt(expiresIn);
    return null;
  }


  static $isAuthenticated() {
    return !!AuthManager.$getAccessTokenFromUrl();
  }
}
