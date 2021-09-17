import {useState, useEffect} from 'react';
import Button from '@mui/lab/LoadingButton';
import AddCircle from '@mui/icons-material/AddCircle';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';

import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {User, TicTacToe} from './firebase';

const Game = (args: {user: User}) => {
  const {user} = args;

  const [loadingNew, setLoadingNew] = useState(false);
  const [gameId, setGameId] = useState('');
  const [gameData, setGameData] = useState<TicTacToe|null>(null);

  const [joinId, setJoinId] = useState('');
  const [loadingJoin, setLoadingJoin] = useState(false);

  const onNewGame = async () => {
    if (loadingNew || loadingJoin) return;

    setLoadingNew(true);

    const {gameId} = await user.newGame();
    console.log('gameId', gameId);
    setGameId(gameId);

    user.subGame(gameId, (g: TicTacToe) => {
      console.log('on snapshot', g);
      setGameData(g);
      setLoadingNew(false);
    });
  };

  const onChangeJoinId = (evt: any) => {
    setJoinId(evt.target.value);
  }

  const onJoinGame = () => {
    if (loadingNew || loadingJoin) return;
    if (!joinId) return;

    setLoadingJoin(true);
    user.subGame(joinId, async (g: TicTacToe) => {
      console.log('on join snap', g);
      if (!g) {
        setJoinId('');
        setLoadingJoin(false);
        return;
      };

      if (user.u?.uid !== g.userX && !g.userO) {
        user.joinGame(joinId);
      } else {
        setGameData(g);
        setGameId(joinId);
        setLoadingJoin(false);
        setJoinId('');
      }
    })
  }

  // minor game logic
  const [end, setEnd] = useState(false);
  const [full, setFull] = useState(false);
  const [turnOf, setTurnOf] = useState<'X'|'O'|''>('');
  const [playingAs, setPlayingAs] = useState<'X'|'O'|''>('')
  useEffect(() => {
    if (!user || !gameData) return;

    const uid = user.u?.uid;
    if (gameData?.userX === uid)
      setPlayingAs('X');
    else if (gameData?.userO === uid)
      setPlayingAs('O');
    
    const numX = gameData?.board.filter(mark => mark === 'X').length;
    const numO = gameData?.board.filter(mark => mark === 'O').length;

    if (numX === numO)
      setTurnOf('X');
    else
      setTurnOf('O');
    const won = false;
    const full = gameData && !gameData.board.some(mark => !mark); 
    const end = full || won;
  }, [user, gameData])

  return <>
    {gameData && <>
      <div className="info-div">
        <Typography>GameID: {gameId}</Typography>
        <Typography>{(
          playingAs === 'X' ? 'Playing as X'
          : playingAs === 'O' || !gameData.userO ? 'Playing as O'
          : 'Watching')
        + (
          playingAs === turnOf ? ', your move.'
          : playingAs || !gameData.userO ? ', waiting on opponent.'
          : ''
        )}</Typography>
        {playingAs === 'X' && !gameData.userO &&
          <Typography>Give your friend the GameID to join!</Typography>
        }
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
      <Button
        variant="contained"
        onClick={onNewGame}
        loading={loadingNew}
        loadingPosition="start"
        startIcon={<AddCircle />}
        disabled={false}>
        New Game
      </Button>
      <div className="gameid-div">
        <Button 
          variant="contained"
          onClick={onJoinGame}
          loading={loadingJoin}
          loadingPosition="start"
          startIcon={<VideogameAssetIcon />}
          disabled={false}>
          Join
        </Button>
        <div className="gameid-text-div">
          <TextField 
            fullWidth
            id="standard-basic"
            placeholder="Game ID"
            variant="standard"
            value={joinId}
            onChange={onChangeJoinId}/>
        </div>
      </div>
    </div>
  </>;
};

export default Game;