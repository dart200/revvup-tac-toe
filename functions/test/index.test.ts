import * as fs from 'fs';
import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, getAuth, connectAuthEmulator, signInAnonymously} from 'firebase/auth';
import {Functions, getFunctions, connectFunctionsEmulator, httpsCallable} from 'firebase/functions';
import {Firestore, getFirestore, connectFirestoreEmulator, doc} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbv6Xl3kCnzeFJ_CFPU0Ckx2D5HcBZTQc",
  authDomain: "revvup-tac-toe.firebaseapp.com",
  projectId: "revvup-tac-toe",
  storageBucket: "revvup-tac-toe.appspot.com",
  messagingSenderId: "464714590276",
  appId: "1:464714590276:web:5e7118c46e788843973411",
  measurementId: "G-8LT446PTNB"
};

// test user
class User {
  app: FirebaseApp;
  db: Firestore;
  functions: Functions;

  auth: Auth;
  get u() {return this.auth.currentUser};
  authInit: Promise<any>;

  constructor(name:string, emulator = true) {
    this.app = initializeApp(firebaseConfig, name);
    this.db = getFirestore(this.app);
    this.functions = getFunctions(this.app);
    this.auth = getAuth(this.app);
  
    if (emulator) {
      connectFirestoreEmulator(this.db, '0.0.0.0', 5053);
      connectFunctionsEmulator(this.functions, '0.0.0.0', 5052);
      connectAuthEmulator(this.auth, 'http://0.0.0.0:5051', {disableWarnings: true});  
    };

    this.authInit = new Promise(resolve => {
      this.auth.onAuthStateChanged(async user => {
        if (!user) await signInAnonymously(this.auth)
          .catch(err => resolve(false));
        
        resolve(true);
      });
    });
  };

  loadGame = (id?: string) => {

  }

  cloudFunc = (name:string, args?:{}) => 
    httpsCallable(this.functions, name)(args)
      .then(res => res.data as any)
  checkAuth = () => this.cloudFunc('checkAuth');
  newGame = () => this.cloudFunc('newGame').then(data => data?.gameId as string);
  placeMove = () => this.cloudFunc('placeMove');
}

class Game {
  id: string;
  db: Firestore;
  
  static async create(user: User, id?: string) {
    const gameId = id || await user.newGame();
    return new Game(user, gameId);
  }

  private constructor(user: User, gameId: string) {
    this.id = gameId;
    this.db = user.db;

    // const gameId = id || await 
  }
}

const userA = new User('userA');


describe('user auth works', () => {
  it ('should login', async () => {
    await userA.authInit;
  });
  it ('checkAuth return uid', async () => {
    await expect(userA.checkAuth()).resolves.toBeDefined();
  });
});

describe('creates a new game', () => {
  it('does a thing', () => {});
});

describe('does a move', () => {
  it('does a thing', () => {});
});