import React, { useState } from 'react';
import LLMChatbot from '../components/LLMChatbot';
import AuthScreen from '../components/AuthScreen';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username, password })
    });
    const data = await response.json();
    if (data.isAuthenticated) {
      setIsAuthenticated(true);
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen">
      {isAuthenticated ? (
        <LLMChatbot />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </main>
  );
}

// import React, { useState } from 'react';
// import { trpc } from '../utils/trpc';
// import LLMChatbot from '../components/LLMChatbot';
// import AuthScreen from '../components/AuthScreen';

// export default function Home() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const handleLogin = (email: string, password: string) => {
//     // Here you would typically validate the credentials against your backend
//     // For now, we'll just set isAuthenticated to true
//     console.log('Login attempted with:', email, password);
//     setIsAuthenticated(true);
//   };

//   // Fetch LLM configurations using tRPC
//   const llmConfigs = trpc.llm.getConfigs.useQuery();

//   // Chat mutation for sending messages to the selected LLM
//   const chatMutation = trpc.llm.chat.useMutation();

//   const handleSendMessage = async (llmName: string, message: string) => {
//     try {
//       const response = await chatMutation.mutateAsync({
//         llmName,
//         message,
//       });
//       return response;
//     } catch (error) {
//       console.error('Failed to get response:', error);
//       return 'Sorry, I encountered an error.';
//     }
//   };

//   if (llmConfigs.isLoading) {
//     return <div>Loading LLM configurations...</div>;
//   }

//   if (llmConfigs.isError) {
//     return <div>Error loading LLM configurations: {llmConfigs.error.message}</div>;
//   }

//   return (
//     <main className="min-h-screen">
//       {isAuthenticated ? (
//         <LLMChatbot
//         />
//       ) : (
//         <AuthScreen onLogin={handleLogin} />
//       )}
//     </main>
//   );
// }