import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as Keycloak from 'keycloak-js';

const MIN_VALIDITY = 70;
const REFRESH_TIMEOUT = 60000; // in milliseconds

if (environment.production) {
  enableProdMode();
}

let keycloak = Keycloak('keycloak/keycloak.json');
window['_keycloak'] = keycloak;

window['_keycloak'].init(
  { onLoad: 'login-required' }
)
  .success(function (authenticated) {
    try {
    localStorage.setItem('acc_token', keycloak.token);
    localStorage.setItem('refresh_acc_token', keycloak.refreshToken);
    } catch(e){
      console.log("Failed to store token in local storage");
    }
    
    if (!authenticated) {
      window.location.reload();
    }

    // refresh login
    setInterval(function () {

      keycloak.updateToken(MIN_VALIDITY).success(function (refreshed) {
        if (refreshed) {
          console.log('Token refreshed');
        } else {
          console.log('Token not refreshed, valid for '
            + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
        }
      }).error(function () {
        console.error('Failed to refresh token');
      });

    }, REFRESH_TIMEOUT);

    console.log("Loading...");


    platformBrowserDynamic().bootstrapModule(AppModule)
      .catch(err => console.error(err));


  });
