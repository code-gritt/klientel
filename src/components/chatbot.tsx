'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatbotStore } from '@/store/chatbot-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, X } from 'lucide-react';
import { LoaderFour } from './ui/loader';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages } = useChatbotStore();
  const [input, setInput] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              className="bg-primary/80 hover:bg-primary backdrop-blur-lg border border-border/80 rounded-full p-3"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-background/50 backdrop-blur-lg border border-border/80 rounded-lg shadow-lg w-80 md:w-96 h-[500px] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-border/80">
              <h3 className="text-lg font-semibold text-foreground/80">
                KlientelBot
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  clearMessages();
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Ask me about Klientel or your recent activities!
                </p>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-primary/80 text-foreground'
                        : 'bg-background/80 text-foreground/80'
                    }`}
                  >
                    <p>{message.content}</p>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-center">
                  <LoaderFour />
                </div>
              )}
            </div>
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-border/80 flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask KlientelBot..."
                className="flex-1 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:border-primary"
              />
              <Button type="submit" disabled={isLoading} className="p-2">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
