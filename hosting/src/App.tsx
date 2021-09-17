import {useEffect, useState} from 'react';
import {CircularProgress, Typography} from '@mui/material'
import {createTheme, ThemeProvider} from '@mui/material/styles';
import './App.css';
import {User} from './firebase';
import Game from './Game';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const board = ['', 'X', '', '', 'O', '', '', '', 'X'];

const App = () => {

  const [user, setUser] = useState<User|null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = new User('user');
      await u.authInit;
      setUser(u);
    }

    if (!user)
      loadUser();

  }, [user])

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="root">
        <div className="app-page">
          {!user ? 
            <CircularProgress />
           : <>
            <Game user={user}/>
            <Typography className="user-id">UserID: {user?.u?.uid}</Typography>
           </>}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
