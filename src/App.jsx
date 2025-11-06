import React, { useState } from 'react';
import UploadChat from './components/UploadChat.jsx';
import ChatView from './components/ChatView.jsx';
import InsightsView from './components/InsightsView.jsx';
import AgentView from './components/AgentView.jsx';
import './styles/app.css';

export default function App() {
  const [chatData, setChatData] = useState(null);
  const [activeView, setActiveView] = useState('chat');

  if (!chatData) return <UploadChat onUpload={setChatData} />;

  return (
    <div className="app">
      <header>
        <h1>Whatsapp Chat Sentiment 🧠</h1>
        <nav>
          <button onClick={() => setActiveView('chat')}>Chat</button>
          <button onClick={() => setActiveView('insights')}>Insights</button>
          <button onClick={() => setActiveView('agent')}>Agent</button>
        </nav>
      </header>

      {activeView === 'chat' && <ChatView chat={chatData} />}
      {activeView === 'insights' && <InsightsView chat={chatData} />}
      {activeView === 'agent' && <AgentView chat={chatData} />}
    </div>
  );
}