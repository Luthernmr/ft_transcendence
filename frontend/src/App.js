import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { PlayPongButton } from './pong/components/PlayPongButton';
import './App.css';

function App() {
  function handleRequest() {
    //let navigate = useNavigate();
    //navigate('/test/v1');
  }
  return (
    <div className="App">
      <header className="App-header">
        You are in the App function;
      </header>
    </div>
  );
}

export default App;
