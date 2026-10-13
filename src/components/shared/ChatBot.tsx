'use client';

import { CloseOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Input } from 'antd';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@/hooks/custom/useDraggable';
import ButtonX from '../antd/ButtonX';

// Served from root /public (public stays at the repo root even with src/). The
// transparent-background logo, so nothing boxes it in on the launcher's gradient.
const LAUNCHER_LOGO_URL = '/assets/images/logo-no-bg.png';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose, onOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: '1',
      text: 'Hi 👋 I\u2019m your Auspira AI Assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const launcher = useDraggable({ storageKey: 'auspira-chatbot-launcher-position' });
  const panel = useDraggable({ storageKey: 'auspira-chatbot-panel-position' });

  const scrollKey = `${messages.length}-${loading}`;

  useEffect(() => {
    if (!scrollKey) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [scrollKey]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: `${Date.now()}-bot`,
        text: 'âœ¨ This is an Auspira AI assistant response. Your real API integration will appear here.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div
          ref={launcher.nodeRef}
          className={`animate-in fade-in slide-in-from-bottom-5 fixed right-6 bottom-32 z-50 duration-300 ${
            launcher.isDragging ? 'cursor-grabbing' : ''
          }`}
          style={launcher.style}
        >
          <button
            type="button"
            onClick={() => {
              if (launcher.wasDragged()) return;
              onOpen();
            }}
            {...launcher.dragHandleProps}
            className={`group relative flex h-16 w-16 touch-none items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ${
              launcher.isDragging ? 'cursor-grabbing' : 'cursor-grab hover:scale-110'
            }`}
            style={{
              background:
                'linear-gradient(135deg, var(--ds-main-p) 0%, var(--theme-accent-10) 100%)',
            }}
          >
            <div
              className="absolute inset-0 rounded-full opacity-30 blur-xl transition-all duration-300 group-hover:scale-150"
              style={{ background: 'var(--ds-main-p)' }}
            />

            {/* draggable={false} + pointer-events-none: the browser's native image
                drag would otherwise cancel the pointer stream mid-drag. */}
            <Image
              src={LAUNCHER_LOGO_URL}
              alt="Auspira AI"
              width={354}
              height={93}
              draggable={false}
              className="pointer-events-none relative z-10 w-11 select-none object-contain"
            />
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div
        ref={panel.nodeRef}
        className={`fixed right-6 bottom-6 z-50 ${panel.isDragging ? '' : 'transition-all duration-300'} ${
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-10 scale-95 opacity-0'
        }`}
        style={panel.style}
      >
        <div className="flex h-155 max-h-[70vh] w-100 flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div
            {...panel.dragHandleProps}
            className={`relative touch-none overflow-hidden border-b border-white/20 px-5 py-4 text-white ${
              panel.isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              background:
                'linear-gradient(135deg, var(--ds-main-p) 0%, var(--theme-accent-10) 100%)',
            }}
          >
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                  <RobotOutlined style={{ fontSize: 24 }} />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Auspira AI Assistant</h2>

                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                    <p className="text-xs text-blue-100">Online • Ready to help</p>
                  </div>
                </div>
              </div>

              <Button
                type="text"
                icon={<CloseOutlined />}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                className="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !border-none !text-white hover:!bg-white/10"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-5 overflow-y-auto bg-gradient-to-b from-slate-50 to-white p-5">
            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <Avatar
                      size={34}
                      icon={<RobotOutlined />}
                      className="!flex !items-center !justify-center"
                      style={{ background: 'var(--ds-main-p)' }}
                    />
                  )}

                  <div
                    className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'rounded-br-md text-white'
                        : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
                    }`}
                    style={isUser ? { background: '#224C7D' } : {}}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>

                    <span
                      className={`mt-2 block text-[11px] ${
                        isUser ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {isUser && (
                    <Avatar
                      size={34}
                      icon={<UserOutlined />}
                      className="!flex !items-center !justify-center !bg-gray-800"
                    />
                  )}
                </div>
              );
            })}

            {/* Typing Loader */}
            {loading && (
              <div className="flex items-end gap-2">
                <Avatar
                  size={34}
                  icon={<RobotOutlined />}
                  style={{ background: 'var(--ds-main-p)' }}
                />

                <div className="rounded-3xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.2s' }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.4s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white/90 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
              <Input
                bordered={false}
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                className="text-sm"
              />

              <ButtonX
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || loading}
                style={{ background: 'var(--ds-main-p)' }}
              />
            </div>

            <p className="mt-3! text-center text-xs text-gray-400">
              Auspira AI Assistant can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
