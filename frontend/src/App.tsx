import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Root from './routes/root'
import Auth from './account/Auth'
import Chat from './chat/Chat'
import Pong from './pong/Pong'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Root />} />
        <Route path="/account" element={<Auth />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/pong" element={<Pong />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
