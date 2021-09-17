import {useState} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {User, TicTacToe} from './firebase';


const Game = (args: {user: User}) => {
  const {user} = args;
  const [gameId, setGameId] = useState('');
  const [gameData, setGameData] = useState<TicTacToe|null>(null);

  const onNewGame = async () => {
    const {gameId} = await user.newGame();
    console.log('gameId', gameId);
    setGameId(gameId);
    user.subGame(gameId, (g: TicTacToe) => {
      console.log('on snapshot', g);
      setGameData(g);
    });
  };

  return <>
    {gameData && <>
      <div className="info-div">
        <Typography>GameID: {gameId}</Typography>
        <Typography>Playing as X</Typography>
        <Typography>Give your friend the GameID to start!</Typography>
      </div>
      <div className="game-div">
        {gameData.board.map((mark, i) =>
          <div key={mark+i} className="cell" onClick={() => console.log(mark)}>
            {mark &&<div className="mark">{mark}</div>}
          </div>
        )}
      </div>
    </>}
    <div className="btns">
      <Button variant="contained" onClick={onNewGame}>New Game</Button>
      <div className="gameid-div">
        <Button variant="contained">Join</Button>
        <div className="gameid-text-div">
          <TextField fullWidth id="standard-basic" placeholder="Game ID" variant="standard" />
        </div>
      </div>
    </div>
  </>;
};

export default Game;