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
  args: (args: {[id: string]: any}, reqArgs: string[]) => {
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
    const ref = db.doc(path);
    const doc = await ref.get();

    if (!doc.exists)
      throw error.failed('Missing doc: '+path);
    
    return {ref, doc};
  },
  game: (id: string) =>
    req.doc('games/'+id)
      .then(({ref, doc}) => ({
        gameRef: ref,
        game: doc.data() as TicTacToe
      })),
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

export const joinGame = onCall(async (args, context) => {
  const uid = req.auth(context);
  const {gameId} = req.args(args, ['gameId']);
  const {gameRef, game} = await req.game(gameId);

  if (!game.userO)
    await gameRef.update({userO: uid});
});

export const playMove = onCall(async (args, context) => {
  const uid = req.auth(context);
  const {gameId, pos} = req.args(args, ['gameId', 'pos']);
  const {gameRef, game} = await req.game(gameId);

  const player
    = uid === game.userX ? 'X'
    : uid === game.userO ? 'O'
    : '';
  if (!player)
    throw error.auth();
  
  const numX = game?.board.filter(mark => mark === 'X').length;
  const numO = game?.board.filter(mark => mark === 'O').length;
  const turn = (numX === numO) ? 'X' : 'O';
  if (turn !== player)
    throw error.failed('Not your turn');
  if (pos < 0 || 8 < pos)
    throw error.arg('Position '+pos+' is out of bounds');

  const board = game.board;
  board[pos] = player;
  await gameRef.update({board});
});

