// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  googleMapsApiKey: 'YOUR_API_KEY_HERE',
  firebase: {
    apiKey: 'AIzaSyCmT9kGRE9Eghi3jdSc_piQWMz4ln2fqSM',
    authDomain: 'skyxportal-b78d6.firebaseapp.com',
    projectId: 'skyxportal-b78d6',
    storageBucket: 'skyxportal-b78d6.appspot.com',
    messagingSenderId: '1021426634922',
    appId: '1:1021426634922:web:21df9518a813e01d7080d3',
    measurementId: 'G-112C79630F',
  },
};

// Initialize Firebase
// const app = initializeApp(firebase);
// const analytics = getAnalytics(app);

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
