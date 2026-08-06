import React, { useCallback, useEffect, useState } from 'react';
import {
  createConversationApi,
  deleteConversationApi,
  exportConversationApi,
  getConversationByIdApi,
  getConversationsApi,
  renameConversationApi,
  sendMessageApi,
  streamConversationApi,
} from '../api/conversations';
import { getModelsApi, getProvidersApi } from '../api/ai';
import { Conversation, ModelInfo, ProviderInfo } from '../types';
import { ConversationSidebar } from '../components/chat/ConversationSidebar';
import { ChatWindow } from '../components/chat/ChatWindow';

export const ConversationsPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('llama3');

  const [loading, setLoading] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [streamedText, setStreamedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const selectConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setError(null);
    try {
      const details = await getConversationByIdApi(id);
      setActiveConversation(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation details.');
    }
  }, []);

  const loadProvidersAndModels = useCallback(async () => {
    try {
      const pList = await getProvidersApi();
      setProviders(pList);
      const defP = pList.find((p) => p.is_default) || pList[0];
      if (defP) setSelectedProvider(defP.name);

      const mList = await getModelsApi();
      setModels(mList);
      if (mList.length > 0) {
        const defM = mList.find((m) => m.is_default) || mList[0];
        setSelectedModel(defM.id);
      }
    } catch (err: any) {
      setProviders([
        {
          name: 'ollama',
          is_default: true,
          available: true,
          models: [
            { id: 'llama3', name: 'Llama 3 (8B)', provider: 'ollama', is_default: true },
          ],
        },
      ]);
    }
  }, []);

  const loadConversations = useCallback(
    async (selectDefault = false) => {
      try {
        const list = await getConversationsApi();
        setConversations(list);

        if (selectDefault && list.length > 0) {
          selectConversation(list[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load conversations.');
      }
    },
    [selectConversation]
  );

  useEffect(() => {
    loadProvidersAndModels();
    loadConversations(true);
  }, [loadProvidersAndModels, loadConversations]);

  const handleCreate = async () => {
    setError(null);
    try {
      const newConv = await createConversationApi();
      const initializedConv: Conversation = {
        ...newConv,
        messages: newConv.messages || [],
      };
      setConversations((prev) => [initializedConv, ...prev]);
      setActiveId(initializedConv.id);
      setActiveConversation(initializedConv);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to create conversation.');
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    try {
      const updated = await renameConversationApi(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: updated.title } : c))
      );
      if (activeConversation?.id === id) {
        setActiveConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rename conversation.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversationApi(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          setActiveId(null);
          setActiveConversation(null);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete conversation.');
    }
  };

  const handleExport = async (format: 'markdown' | 'json') => {
    if (!activeId) return;
    try {
      const exp = await exportConversationApi(activeId, format);
      const blob = new Blob([exp.export_data], {
        type: format === 'json' ? 'application/json' : 'text/markdown',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exp.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${
        format === 'json' ? 'json' : 'md'
      }`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export conversation.');
    }
  };

  const handleSendMessage = async (
    prompt: string,
    systemPrompt: string,
    ragEnabled: boolean,
    isStream: boolean
  ) => {
    let convId = activeId;
    if (!convId) {
      try {
        const newConv = await createConversationApi();
        convId = newConv.id;
        setActiveId(newConv.id);
        setConversations((prev) => [newConv, ...prev]);
        setActiveConversation({ ...newConv, messages: [] });
      } catch (err: any) {
        setError('Failed to auto-create conversation.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (isStream) {
        setStreaming(true);
        setStreamedText('');

        await streamConversationApi(
          convId,
          {
            prompt,
            system_prompt: systemPrompt,
            provider: selectedProvider,
            model: selectedModel,
            rag_enabled: ragEnabled,
          },
          (_token, text) => {
            setStreamedText(text);
          },
          async () => {
            setStreaming(false);
            setStreamedText('');
            await selectConversation(convId!);
            await loadConversations();
          },
          (errMessage) => {
            setStreaming(false);
            setStreamedText('');
            setError(errMessage);
          }
        );
      } else {
        const res = await sendMessageApi(convId, {
          prompt,
          system_prompt: systemPrompt,
          provider: selectedProvider,
          model: selectedModel,
          rag_enabled: ragEnabled,
        });

        await selectConversation(res.conversation_id);
        await loadConversations();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden -m-6">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={selectConversation}
        onCreate={handleCreate}
        onRename={handleRename}
        onDelete={handleDelete}
        onExport={(id, fmt) => {
          setActiveId(id);
          handleExport(fmt);
        }}
      />
      <ChatWindow
        conversation={activeConversation}
        providers={providers}
        models={models}
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        onSendMessage={handleSendMessage}
        onExport={handleExport}
        loading={loading}
        streaming={streaming}
        streamedText={streamedText}
        error={error}
      />
    </div>
  );
};
