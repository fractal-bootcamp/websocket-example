import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

type Message = {
  author: string;
  message: string;
}

function App() {
  const [count, setCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [myMessage, setMyMessage] = useState('');

  useEffect(() => {
    socket.on('pong', (message) => {
      console.log('pong', message)
    })
    socket.on("count", (count) => {
      setCount(count)
    })
    socket.on("message", (message) => {
      setMessages([...messages, message])
    })
  }, [])

  const onSetCount = (count: number) => {
    socket.emit('click', { 
      authToken: 'valid_token',
      count
    })
    setCount(count)
  }

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => onSetCount(count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <input type="text" onChange={(e) => setMyMessage(e.target.value)} />
      <button onClick={() => socket.emit('message', { author: 'me-' + Math.random(), message: myMessage })}>Send</button>
      <div>
        {messages.map((message, index) => (
          <p key={index}>{message.author}: {message.message}</p>
        ))}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
