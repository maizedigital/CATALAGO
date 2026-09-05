import { useEffect, useState, useCallback, useRef } from 'react';
import { Send, RefreshCw, QrCode, Phone, MessageCircle, User, Search, ArrowLeft } from 'lucide-react';
import { adminApi, whatsappApi } from '@/lib/adminApi';
import { AdminLayout } from '@/components/AdminLayout';

interface Conversation {
  id: string;
  phone: string;
  contact_name: string | null;
  customer_id: string | null;
  lead_id: string | null;
  last_message: string | null;
  last_message_at: string;
  last_direction: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  phone: string;
  direction: 'in' | 'out';
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  status: string;
  created_at: string;
}

interface ConnectionStatus {
  status: string;
  qr?: string;
  phone?: string;
  updated_at?: string;
}

type OpenWAState = 'connected' | 'disconnected' | 'loading' | 'error' | 'not_configured';

export default function AdminWhatsApp() {
  const [connection, setConnection] = useState<OpenWAState>('loading');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionStatus | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerInfo, setCustomerInfo] = useState<Record<string, unknown> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkConnection = useCallback(async () => {
    try {
      const res = await whatsappApi.get<{ status: string; qr?: string; phone?: string } | { error: string }>('status');
      if ('error' in res) {
        setConnection('not_configured');
        setError(res.error);
        return;
      }
      setConnectionInfo(res);
      if (res.status === 'connected' || res.status === 'ready' || res.status === 'authenticated') {
        setConnection('connected');
        setQrCode(null);
      } else if (res.status === 'qr' || res.status === 'qr_code' || res.qr) {
        setConnection('disconnected');
        setQrCode(res.qr || null);
      } else if (res.status === 'disconnected' || res.status === 'offline') {
        setConnection('disconnected');
        setQrCode(null);
      } else {
        setConnection('loading');
      }
    } catch {
      setConnection('not_configured');
      setError('OpenWA não configurado ou inacessível');
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const data = await whatsappApi.get<Conversation[]>('conversations');
      setConversations(data || []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMsgs(true);
    try {
      const data = await whatsappApi.get<Message[]>(`conversations/${convId}/messages`);
      setMessages(data || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  const loadCustomerInfo = useCallback(async (conv: Conversation) => {
    if (conv.customer_id) {
      try {
        const data = await adminApi.get<Record<string, unknown>>(`customers/${conv.customer_id}`);
        setCustomerInfo(data);
      } catch {
        setCustomerInfo(null);
      }
    } else {
      setCustomerInfo(null);
    }
  }, []);

  const selectConversation = useCallback((conv: Conversation) => {
    setSelectedConv(conv);
    loadMessages(conv.id);
    loadCustomerInfo(conv);
    if (conv.unread_count > 0) {
      whatsappApi.put(`conversations/${conv.id}`, { unread_count: 0 }).catch(() => {});
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
      );
    }
  }, [loadMessages, loadCustomerInfo]);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      await whatsappApi.post('sessions/mb/start', {});
      setTimeout(() => checkConnection(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar sessão');
    }
  }, [checkConnection]);

  const disconnectSession = useCallback(async () => {
    try {
      setError(null);
      await whatsappApi.post('sessions/mb/stop', {});
      setTimeout(() => checkConnection(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desconectar sessão');
    }
  }, [checkConnection]);

  const sendMessage = useCallback(async () => {
    if (!selectedConv || !messageText.trim() || sending) return;
    setSending(true);
    try {
      await whatsappApi.post('send', {
        chatId: `${selectedConv.phone}@c.us`,
        text: messageText.trim(),
      });
      const newMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: selectedConv.id,
        phone: selectedConv.phone,
        direction: 'out',
        body: messageText.trim(),
        media_url: null,
        media_type: null,
        status: 'sent',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: messageText.trim().slice(0, 200), last_message_at: newMsg.created_at, last_direction: 'out' }
            : c
        )
      );
      setMessageText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }, [selectedConv, messageText, sending]);

  useEffect(() => {
    checkConnection();
    loadConversations();
    pollRef.current = setInterval(() => {
      checkConnection();
      loadConversations();
      if (selectedConv) loadMessages(selectedConv.id);
    }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const filteredConvs = searchQuery
    ? conversations.filter((c) =>
        c.phone.includes(searchQuery) ||
        (c.contact_name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">WhatsApp</h1>
        <p className="mt-1 text-sm text-neutral-500">Central de mensagens via OpenWA</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-sm text-amber-800">{error}</p>
        </div>
      )}

      {/* Connection Status Bar */}
      <div className="mb-4 flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${
            connection === 'connected' ? 'bg-green-500' :
            connection === 'disconnected' ? 'bg-red-500' :
            connection === 'loading' ? 'bg-amber-400 animate-pulse' :
            'bg-neutral-400'
          }`} />
          <div>
            <p className="text-sm font-medium text-neutral-900">
              {connection === 'connected' && 'Conectado'}
              {connection === 'disconnected' && 'Desconectado'}
              {connection === 'loading' && 'Verificando conexão...'}
              {connection === 'error' && 'Erro de conexão'}
              {connection === 'not_configured' && 'OpenWA não configurado'}
            </p>
            <p className="text-xs text-neutral-500">
              {connection === 'connected' && connectionInfo?.phone
                ? `Número: ${connectionInfo.phone}`
                : 'Serviço OpenWA'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connection === 'connected' ? (
            <button
              onClick={disconnectSession}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 transition-colors hover:bg-red-100"
            >
              <Phone size={14} />
              Desconectar
            </button>
          ) : (
            <button
              onClick={startSession}
              disabled={connection === 'not_configured'}
              className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
            >
              <QrCode size={14} />
              Conectar
            </button>
          )}
          <button
            onClick={checkConnection}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCode && connection === 'disconnected' && (
        <div className="mb-4 flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-8">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
            Escaneie o QR Code
          </h3>
          <img src={qrCode} alt="QR Code" className="h-64 w-64" />
          <p className="mt-4 text-xs text-neutral-500">
            Abra o WhatsApp no celular, vá em Configurações {'>'} Aparelhos conectados {'>'} Conectar aparelho
          </p>
        </div>
      )}

      {/* Not configured warning */}
      {connection === 'not_configured' && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <MessageCircle size={48} className="text-neutral-300" />
          <h3 className="mt-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
            OpenWA não configurado
          </h3>
          <p className="mt-2 max-w-md text-xs text-neutral-500">
            Para usar a integração com WhatsApp, configure as variáveis de ambiente OPENWA_API_URL e OPENWA_API_KEY
            no servidor. O OpenWA deve estar rodando como um serviço separado.
          </p>
        </div>
      )}

      {/* Inbox Layout */}
      {connection !== 'not_configured' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_300px]" style={{ height: 'calc(100vh - 280px)' }}>
          {/* Conversation List */}
          <div className="flex flex-col rounded-lg border border-neutral-200 bg-white">
            <div className="border-b border-neutral-200 p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full border border-neutral-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-center">
                  <p className="text-xs text-neutral-400">Nenhuma conversa</p>
                </div>
              ) : (
                filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`flex w-full items-start gap-3 border-b border-neutral-100 px-3 py-3 text-left transition-colors hover:bg-neutral-50 ${
                      selectedConv?.id === conv.id ? 'bg-neutral-100' : ''
                    }`}
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                      <User size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {conv.contact_name || conv.phone}
                        </p>
                        <span className="ml-2 flex-shrink-0 text-xs text-neutral-400">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="truncate text-xs text-neutral-500">
                        {conv.last_direction === 'out' && 'Voce: '}
                        {conv.last_message || 'Sem mensagens'}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1.5 text-xs font-bold text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex flex-col rounded-lg border border-neutral-200 bg-white">
            {!selectedConv ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageCircle size={48} className="text-neutral-300" />
                <p className="mt-4 text-sm text-neutral-400">Selecione uma conversa para ver as mensagens</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {selectedConv.contact_name || selectedConv.phone}
                    </p>
                    <p className="text-xs text-neutral-500">{selectedConv.phone}</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-xs text-neutral-400">Nenhuma mensagem</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                            msg.direction === 'out'
                              ? 'bg-neutral-900 text-white'
                              : 'bg-neutral-100 text-neutral-900'
                          }`}
                        >
                          {msg.media_url && msg.media_type === 'image' && (
                            <img src={msg.media_url} alt="Media" className="mb-2 max-h-48 rounded" />
                          )}
                          {msg.body && <p className="whitespace-pre-wrap">{msg.body}</p>}
                          <p className={`mt-1 text-xs ${msg.direction === 'out' ? 'text-neutral-400' : 'text-neutral-400'}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-neutral-200 p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                      placeholder="Digite uma mensagem..."
                      disabled={sending}
                      className="flex-1 border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-900 disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageText.trim() || sending}
                      className="flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer/CRM Panel */}
          <div className="hidden flex-col rounded-lg border border-neutral-200 bg-white overflow-y-auto lg:flex">
            {selectedConv ? (
              <div className="p-4">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
                  Informacoes do Cliente
                </h3>

                {customerInfo ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Nome</p>
                      <p className="text-sm text-neutral-900">{(customerInfo.name as string) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">WhatsApp</p>
                      <p className="text-sm text-neutral-900">{(customerInfo.whatsapp as string) || selectedConv.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Status</p>
                      <p className="text-sm text-neutral-900">{(customerInfo.status as string) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Cidade</p>
                      <p className="text-sm text-neutral-900">{(customerInfo.city as string) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Total Gasto</p>
                      <p className="text-sm text-neutral-900">
                        R$ {Number(customerInfo.total_spent || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Pedidos</p>
                      <p className="text-sm text-neutral-900">{(customerInfo.orders_count as number) || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">Ultima Compra</p>
                      <p className="text-sm text-neutral-900">
                        {customerInfo.last_purchase
                          ? new Date(customerInfo.last_purchase as string).toLocaleDateString('pt-BR')
                          : '-'}
                      </p>
                    </div>
                    <a
                      href={selectedConv.customer_id ? `/admin/clientes/${selectedConv.customer_id}` : '#'}
                      className={`mt-4 flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                        selectedConv.customer_id
                          ? 'text-neutral-900 hover:bg-neutral-50'
                          : 'text-neutral-300 pointer-events-none'
                      }`}
                    >
                      <ArrowLeft size={14} />
                      Ver no CRM
                    </a>
                  </div>
                ) : selectedConv.lead_id ? (
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 px-3 py-2">
                      <p className="text-xs font-medium text-blue-800">Lead capturado via WhatsApp</p>
                    </div>
                    <a
                      href={`/admin/leads`}
                      className="flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                      <ArrowLeft size={14} />
                      Ver Leads
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">Sem dados de cliente vinculados.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-xs text-neutral-400">Selecione uma conversa</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
