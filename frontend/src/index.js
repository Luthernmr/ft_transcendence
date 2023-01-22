import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Router, Route } from 'react-router-dom'
import './index.css';
import Root from './routes/root'
import Pong from './pong/Pong'
import Account from './account/Account'
import Chat from './chat/Chat'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
  },
  {
    path: "/account",
    element: <Account />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
  {
    path: "/pong",
    element: <Pong />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
