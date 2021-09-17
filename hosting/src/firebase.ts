import {FirebaseApp, initializeApp} from 'firebase/app';
import {Auth, getAuth, connectAuthEmulator, signInAnonymously} from 'firebase/auth';
import {Functions, getFunctions, connectFunctionsEmulator, httpsCallable} from 'firebase/functions';
import {Firestore, getFirestore, connectFirestoreEmulator, doc, onSnapshot} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbv6Xl3kCnzeFJ_CFPU0Ckx2D5HcBZTQc",
  authDomain: "revvup-tac-toe.firebaseapp.com",
  projectId: "revvup-tac-toe",
  storageBucket: "revvup-tac-toe.appspot.com",
  messagingSenderId: "464714590276",
  appId: "1:464714590276:web:5e7118c46e788843973411",
  measurementId: "G-8LT446PTNB"
};

export interface TicTacToe {
  userX?: string,
  userO?: string,
  board: string[],
};

// test user
export class User {
  app: FirebaseApp;
  db: Firestore;
  functions: Functions;

  auth: Auth;
  get u() {return this.auth.currentUser};
  authInit: Promise<any>;

  unsubGame?: () => any;

  constructor(name:string, emulator = process.env.NODE_ENV === 'development') {
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

  subGame = (id: string, func: (game: TicTacToe) => any) => {
    if (this.unsubGame)
      this.unsubGame();

    const gameDoc = doc(this.db, 'games/'+id);
    this.unsubGame = onSnapshot(gameDoc, doc => {
      const data = doc.data();
      func(data as TicTacToe);
    });
  };

  cloudFunc = (name:string, args?:{}) => 
    httpsCallable(this.functions, name)(args)
      .then(res => res.data as any);

  checkAuth = () => this.cloudFunc('checkAuth');
  newGame = () => this.cloudFunc('newGame').then(data => data as {gameId: string});
  joinGame = (gameId: string) => this.cloudFunc('joinGame', {gameId});
  playMove = (gameId: string, pos: number) => this.cloudFunc('playMove', {gameId, pos});

};