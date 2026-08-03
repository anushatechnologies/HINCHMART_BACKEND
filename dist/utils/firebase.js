"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const path_1 = __importDefault(require("path"));
// Path to the service account key JSON file
const serviceAccountPath = path_1.default.resolve(__dirname, '../../serviceAccountKey.json');
// Initialize Firebase Admin SDK
if (!(0, app_1.getApps)().length) {
    try {
        const serviceAccount = require(serviceAccountPath);
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)(serviceAccount),
            databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com"
        });
        console.log('Firebase Admin SDK initialized successfully');
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
    }
}
exports.auth = (0, auth_1.getAuth)();
exports.db = (0, firestore_1.getFirestore)(); // If you use Firestore
//# sourceMappingURL=firebase.js.map