var config = {
    apiKey: "AIzaSyAJI1mRoNKalrvI6GxgzgcL2e0FRx2bg7I",
    authDomain: "tecforever-549d2.firebaseapp.com",
    databaseURL: "https://tecforever-549d2.firebaseio.com",
    storageBucket: "tecforever-549d2.appspot.com",
};
firebase.initializeApp(config);
var inventoryRef = firebase.database().ref('inventory');
var inStockRef = firebase.database().ref('inventory/inStock');

firebase.auth().signInAnonymously().catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});