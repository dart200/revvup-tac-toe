import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import onCall = functions.https.onCall;

const adminApp = admin.initializeApp();
const db       = adminApp.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const error = {
  auth: () => {throw new functions.https.HttpsError('permission-denied', 'Invalid Authentication')}, 
  failed: (msg: string) => {throw new functions.https.HttpsError('failed-precondition', msg)},
  arg: (msg: string) => {throw new functions.https.HttpsError('invalid-argument', msg)},
};

const req = {
  args: (args: {[id: string]: any}, ...reqArgs: string[]) => {
    for (const argName of reqArgs) {
      if (typeof args[argName] === 'undefined')
        throw error.arg('Missing arg: '+argName);
    }
    return args;
  },
  auth: (context: functions.https.CallableContext) => {
    if (!context.auth)
      throw error.auth();

    return context.auth.uid;
  },
  doc: async (path: string) => {
    const doc = await db.doc(path).get();

    if (!doc.exists)
      throw error.failed('Missing doc: '+path);
    
    return doc.data();
  },
  game: (id: string) => {
    return req.doc('games/'+id).then(data => data as TicTacToe);
  },
};

// document structure
interface TicTacToe {
  userX?: string,
  userO?: string,
  board: string[],
};

export const checkAuth = onCall(async (args, context) => {
  const uid = req.auth(context);
  return {uid};
});

export const newGame = onCall(async (args, context) => {
  const uid = req.auth(context);
  const gameData: TicTacToe = {
    userX: uid,
    board: ['', '', '', '', '', '', '', '', ''],
  }
  const gameDoc = await db.collection('games').add(gameData);
  return {gameId: gameDoc.id};
});

export const placeMove = onCall(async (args, context) => {

});

