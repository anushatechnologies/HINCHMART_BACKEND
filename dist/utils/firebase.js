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
const fs_1 = __importDefault(require("fs"));
// Path to the service account key JSON file
const serviceAccountPath = path_1.default.resolve(__dirname, '../../serviceAccountKey.json');
// Initialize Firebase Admin SDK
let isInitialized = false;
if (!(0, app_1.getApps)().length) {
    try {
        if (fs_1.default.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            // Basic validation to prevent crashing on empty JSON objects from bad echoing
            if (serviceAccount.project_id) {
                (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)(serviceAccount),
                    databaseURL: "https://anushabazaar-2288e-default-rtdb.firebaseio.com"
                });
                console.log('Firebase Admin SDK initialized successfully');
                isInitialized = true;
            }
            else {
                console.warn('Firebase serviceAccountKey.json is invalid (missing project_id).');
            }
        }
        else {
            console.warn('Firebase serviceAccountKey.json not found. Firebase Admin SDK not initialized.');
        }
    }
    catch (error) {
        console.error('Error initializing Firebase Admin SDK:', error);
    }
}
else {
    isInitialized = true;
}
exports.auth = isInitialized ? (0, auth_1.getAuth)() : null;
exports.db = isInitialized ? (0, firestore_1.getFirestore)() : null;
//# sourceMappingURL=firebase.js.map