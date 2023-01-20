import logo from './logo.svg';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { ClickButton } from './components/ClickButton';
import './App.css';

function App() {
  function handleRequest() {
    //let navigate = useNavigate();
    //navigate('/test/v1');
  }
  return (
    <>
      <ClickButton />
    </>
  );
}

export default App;
