import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, Phone, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useStore } from '../context/StoreContext';

export default function ChatAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual da C Store Angola. Como posso ajudar com os nossos produtos hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { products, knowledge } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
      
      const productsContext = products.map(p => 
        `Produto: ${p.name}\nPreço: ${p.price}\nDescrição Curta: ${p.shortDesc}\nDescrição Completa: ${p.fullDesc}`
      ).join('\n\n');

      const systemInstruction = `Você é um assistente virtual amigável e prestativo da loja "C Store Angola" (GRUPO CASSAMINHA - COMÉRCIO & PRESTAÇÃO DE SERVIÇOS, (SU), LDA). Você ajuda os clientes a tirar dúvidas sobre os produtos da loja. Seja conciso, educado e focado em ajudar na venda. O número do WhatsApp da loja é +244 921 167 980.

Você tem conhecimento sobre tudo que está listado na loja oficial, incluindo os preços dos produtos.
O caso de entrega tem que ser sob consulta de um atendente humano.
Quando alguém enviar a sua primeira mensagem, pergunte o nome e trate-lhe pelo nome.
Caso o usuário queira fazer uma encomenda, ensine-o a fazer a compra (clicando em "Adicionar ao Carrinho" ou "Comprar Agora" na página do produto).

Informações adicionais da loja (Base de Conhecimento):
${knowledge}

Aqui estão as informações detalhadas de todos os produtos disponíveis na loja:
${productsContext}

Regra muito importante: Se o cliente perguntar sobre algo que não está nas informações acima ou se você não tiver a resposta, você DEVE dizer "Desculpe, não tenho essa informação no momento. Por favor, entre em contacto com o nosso suporte para que possamos ajudar melhor:" e adicionar a tag exata [CONTACT_SUPPORT] no final da sua resposta.`;

      const contents = newMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents,
        config: {
          systemInstruction,
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente ou contacte-nos pelo WhatsApp. [CONTACT_SUPPORT]' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageText = (text: string = '') => {
    const hasContactSupport = text?.includes('[CONTACT_SUPPORT]');
    const cleanText = text?.replace('[CONTACT_SUPPORT]', '').trim();

    return (
      <div className="flex flex-col gap-3">
        <span className="whitespace-pre-wrap">{cleanText}</span>
        {hasContactSupport && (
          <div className="flex flex-col gap-2 mt-2">
            <a 
              href="https://wa.me/244921167980" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Ir direto no WhatsApp
            </a>
            <a 
              href="tel:+244921167980" 
              className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
            >
              <Phone className="w-4 h-4" />
              Ligar direto
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-full shadow-lg shadow-blue-900/30 transition-transform hover:scale-105 flex items-center justify-center"
          aria-label="Abrir chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-[320px] sm:w-[380px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Assistente C Store</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/50">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-bl-sm'
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border-t border-black/10 dark:border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-full px-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors shadow-sm dark:shadow-none"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white p-2 rounded-full transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
