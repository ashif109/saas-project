"use client"

import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  BrainCircuit
} from 'lucide-react';
import { suggestDoubtResponses } from '@/ai/flows/ai-doubt-response-suggestion';

interface Message {
  id: string;
  sender: 'student' | 'faculty';
  text: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: '1-1', sender: 'student', text: "Hello professor, I'm having trouble with the Dijkstra's algorithm optimization part.", timestamp: '10:30 AM' },
    { id: '1-2', sender: 'faculty', text: "Hello Alex! Are you using a priority queue for your implementation?", timestamp: '10:32 AM' },
    { id: '1-3', sender: 'student', text: "Yes, but I'm unsure how to handle the update of distances when a shorter path is found. Should I re-insert into the priority queue or use a decrease-key operation?", timestamp: '10:35 AM' },
  ]
};

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      setMessages(INITIAL_MESSAGES[id] || []);
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text = inputText) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'faculty',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    setSuggestions([]);
  };

  const generateAISuggestions = async () => {
    if (messages.length === 0) return;
    
    setLoadingAI(true);
    try {
      const studentMessages = messages.filter(m => m.sender === 'student');
      const lastStudentQuery = studentMessages[studentMessages.length - 1]?.text || "";
      
      const response = await suggestDoubtResponses({
        doubtQuery: lastStudentQuery,
        chatHistory: messages.map(m => ({
          sender: m.sender,
          text: m.text
        }))
      });
      
      setSuggestions(response.suggestedResponses);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const studentName = id === '1' ? 'Alex Johnson' : 'Student';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://picsum.photos/seed/${id}/100/100`} />
              <AvatarFallback>{studentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-bold text-lg">{studentName}</h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Doubt Session Active
              </p>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
          <Card className="flex-1 border-none shadow-sm flex flex-col min-h-0">
            <CardContent className="flex-1 p-4 flex flex-col min-h-0">
              <ScrollArea className="flex-1 pr-4" viewportRef={scrollRef}>
                <div className="space-y-4 py-4">
                  <div className="text-center">
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-1 rounded-full uppercase tracking-wider font-bold">Today</span>
                  </div>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender === 'student' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[80%] md:max-w-[70%] ${
                        msg.sender === 'student' 
                          ? 'bg-secondary text-foreground rounded-tr-2xl rounded-br-2xl rounded-bl-2xl' 
                          : 'bg-primary text-primary-foreground rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                      } p-3 shadow-sm`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'student' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-4 space-y-4">
                {suggestions.length > 0 && (
                  <div className="space-y-2 animate-in slide-in-from-bottom-2">
                    <p className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" /> AI Suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, i) => (
                        <Button 
                          key={i} 
                          variant="secondary" 
                          size="sm" 
                          className="h-auto py-2 text-xs text-left max-w-xs whitespace-normal border border-primary/10 hover:border-primary/30"
                          onClick={() => handleSendMessage(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-10 w-10 shrink-0 text-primary hover:bg-primary/5 border-primary/20"
                    onClick={generateAISuggestions}
                    disabled={loadingAI}
                  >
                    {loadingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  </Button>
                  <Input 
                    placeholder="Type your response..." 
                    className="h-10 bg-secondary/50 border-none"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    className="h-10 w-10 shrink-0 rounded-full shadow-lg" 
                    size="icon"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="hidden lg:flex w-80 flex-col gap-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Doubt Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Subject</p>
                  <p className="text-sm font-semibold">Algorithms & Data Structures</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Department</p>
                  <p className="text-sm">Computer Science</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Faculty</p>
                  <p className="text-sm">Dr. Alan Turing</p>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Student Performance</p>
                  <div className="flex items-center justify-between text-xs">
                    <span>GPA</span>
                    <span className="font-bold">3.8 / 4.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-accent/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Smart Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Student is asking about optimization. Consider mentioning Binary Heaps or Fibonacci Heaps as advanced topics for their Dijkstra implementation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
