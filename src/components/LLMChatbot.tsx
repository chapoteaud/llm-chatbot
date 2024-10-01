import React, { useState, useRef } from 'react';
import { trpc } from '../utils/trpc';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Paperclip } from 'lucide-react'

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const facebookBlueStyle = {
  backgroundColor: '#1877F2',
  color: 'white',
  ':hover': {
    backgroundColor: '#1664D9', // A slightly darker shade for hover state
  }
};

const LLMChatbot: React.FC = () => {
  const [selectedLLM, setSelectedLLM] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [firewallEnabled, setFirewallEnabled] = useState(false);
  const [url, setUrl] = useState('');
  const [jsonTemplate, setJsonTemplate] = useState('');
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  const [documentContent, setDocumentContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const llmProviders = trpc.llm.getProviders.useQuery();
  const chatMutation = trpc.llm.chat.useMutation();

  const handleSendMessage = async () => {
    if (inputMessage.trim() && selectedLLM) {
      setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
      
      try {
        const response = await chatMutation.mutateAsync({
          provider: selectedLLM as any, // TODO: Improve type safety
          message: inputMessage,
        });
        
        setMessages(prev => [...prev, { role: 'assistant', content: response.content }]);
      } catch (error) {
        console.error('Failed to get response:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
      }
      
      setInputMessage('');
    }
  };

  const handleSetUrl = () => {
    console.log(`URL set to: ${url}`);
  };

  const handleTestConnection = async () => {
    if (!url) {
      console.error("No URL set");
      return;
    }
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log("Connection successful");
      } else {
        console.error("Connection failed");
      }
    } catch (error) {
      console.error("Error testing connection:", error);
    }
  };

  const handleSetJsonTemplate = () => {
    try {
      JSON.parse(jsonTemplate);
      console.log("JSON template is valid and set");
    } catch (error) {
      console.error("Invalid JSON template");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedDocument(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveDocument = () => {
    setUploadedDocument(null);
    setDocumentContent('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="w-1/4 p-4 bg-gray-100 flex flex-col">
        <Card className="mb-4 flex-grow">
          <CardHeader>
            <CardTitle>Chat Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="mb-4">
              <Label htmlFor="llm-select" className="mb-2 block">Select LLM</Label>
              <Select onValueChange={setSelectedLLM}>
                <SelectTrigger id="llm-select">
                  <SelectValue placeholder="Select LLM" />
                </SelectTrigger>
                <SelectContent>
                  {llmProviders.data?.map(provider => (
                    <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <Label htmlFor="url-input" className="mb-2 block">Enter URL</Label>
              <div className="flex mb-2">
                <Input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button onClick={handleSetUrl} size="sm" style={facebookBlueStyle}>Set</Button>
              </div>
              <Button onClick={handleTestConnection} size="sm" style={facebookBlueStyle} className="w-full">Test Connection</Button>
            </div>
            <div className="mb-4 flex-grow">
              <Label htmlFor="json-template" className="mb-2 block">JSON Endpoint Template</Label>
              <Textarea
                id="json-template"
                placeholder="Enter JSON template here"
                value={jsonTemplate}
                onChange={(e) => setJsonTemplate(e.target.value)}
                className="min-h-[200px] mb-2"
              />
              <Button onClick={handleSetJsonTemplate} size="sm" style={facebookBlueStyle} className="w-full">Set JSON Template</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center space-x-2 p-4 bg-gray-200 rounded-lg">
          <Switch
            id="firewall-mode"
            checked={firewallEnabled}
            onCheckedChange={setFirewallEnabled}
          />
          <Label htmlFor="firewall-mode">Enable Firewall</Label>
        </div>
      </div>

      {/* Right Panel - Chatbot */}
      <div className="w-3/4 p-4 flex flex-col">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>
              Chat with {selectedLLM || 'No LLM selected'} 
              {firewallEnabled && ' (Firewall Enabled)'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {message.content}
                  </span>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            {uploadedDocument && (
              <div className="w-full flex items-center justify-between bg-gray-200 p-2 rounded mb-2">
                <span className="text-sm truncate">{uploadedDocument.name}</span>
                <Button onClick={handleRemoveDocument} variant="destructive" size="sm">Remove</Button>
              </div>
            )}
            <div className="flex w-full">
              <div className="flex-grow flex items-center border rounded-l-md bg-white">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow border-none"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <label htmlFor="file-upload" className="cursor-pointer p-2">
                        <Paperclip className="h-5 w-5 text-gray-500" />
                      </label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
              <Button onClick={handleSendMessage} style={facebookBlueStyle} className="rounded-l-none">Send</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LLMChatbot;