import React, { useEffect, useState } from 'react';
import { getModelsApi, getProvidersApi, sendChatApi } from '../api/ai';
import { ChatResponse, ModelInfo, ProviderInfo } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  Bot,
  Zap,
  Sliders,
  Send,
  Clock,
  Cpu,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const Playground: React.FC = () => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [selectedModel, setSelectedModel] = useState<string>('llama3');
  const [systemPrompt, setSystemPrompt] = useState<string>(
    'You are CortexAI, an enterprise intelligent assistant designed to assist users with precision and structured reasoning.'
  );
  const [userPrompt, setUserPrompt] = useState<string>(
    'Explain the benefits of a provider abstraction layer in an AI enterprise SaaS application.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingMeta, setFetchingMeta] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chatResponse, setChatResponse] = useState<ChatResponse | null>(null);
  const [streamedText, setStreamedText] = useState<string>('');

  // Initial load of providers and models
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    setFetchingMeta(true);
    setError(null);
    try {
      const providerData = await getProvidersApi();
      setProviders(providerData);

      const defaultProv = providerData.find((p) => p.is_default) || providerData[0];
      if (defaultProv) {
        setSelectedProvider(defaultProv.name);
      }

      const modelData = await getModelsApi();
      setModels(modelData);
      if (modelData.length > 0) {
        const defaultMod = modelData.find((m) => m.is_default) || modelData[0];
        setSelectedModel(defaultMod.id);
      }
    } catch (err: any) {
      // Fallback local defaults if backend API is initializing
      setProviders([
        {
          name: 'ollama',
          is_default: true,
          available: true,
          models: [
            { id: 'llama3', name: 'Llama 3 (8B)', provider: 'ollama', is_default: true },
            { id: 'mistral', name: 'Mistral 7B', provider: 'ollama', is_default: false },
          ],
        },
        {
          name: 'openai',
          is_default: false,
          available: false,
          models: [
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', is_default: true },
            { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', is_default: false },
          ],
        },
      ]);
    } finally {
      setFetchingMeta(false);
    }
  };

  // Update available models when selected provider changes
  useEffect(() => {
    if (selectedProvider) {
      getModelsApi(selectedProvider)
        .then((mList) => {
          setModels(mList);
          if (mList.length > 0) {
            setSelectedModel(mList[0].id);
          }
        })
        .catch(() => {
          const matchingProvider = providers.find((p) => p.name === selectedProvider);
          if (matchingProvider && matchingProvider.models.length > 0) {
            setModels(matchingProvider.models);
            setSelectedModel(matchingProvider.models[0].id);
          }
        });
    }
  }, [selectedProvider, providers]);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setChatResponse(null);
    setStreamedText('');

    try {
      if (isStreaming) {
        // Simple streaming delegation preview
        const response = await sendChatApi({
          prompt: userPrompt,
          system_prompt: systemPrompt,
          provider: selectedProvider,
          model: selectedModel,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        });

        // Simulate streaming token output in UI panel
        const words = response.response.split(' ');
        let accumulated = '';
        for (let i = 0; i < words.length; i++) {
          accumulated += (i === 0 ? '' : ' ') + words[i];
          setStreamedText(accumulated);
          await new Promise((resolve) => setTimeout(resolve, 30));
        }

        setChatResponse(response);
      } else {
        const response = await sendChatApi({
          prompt: userPrompt,
          system_prompt: systemPrompt,
          provider: selectedProvider,
          model: selectedModel,
          temperature,
          max_tokens: maxTokens,
          stream: false,
        });
        setChatResponse(response);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate response from AI provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Provider Runtime v0.4</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Playground</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Test and evaluate prompt completions across unified AI providers and models.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMetadata}
          isLoading={fetchingMeta}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Metadata</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Controls & Parameters */}
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Runtime Configuration
              </h2>
            </div>

            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              >
                {providers.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name.toUpperCase()} {p.is_default ? '(Default)' : ''} {!p.available ? '(Key Missing)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Model ID
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:border-indigo-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>Temperature</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.5"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.0 (Precise)</span>
                <span>1.5 (Creative)</span>
              </div>
            </div>

            {/* Max Tokens Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Max Tokens
              </label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 500)}
                placeholder="1000"
              />
            </div>

            {/* Streaming Toggle */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white">
                  Streaming Mode
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Simulate SSE chunked output
                </div>
              </div>
              <input
                type="checkbox"
                checked={isStreaming}
                onChange={(e) => setIsStreaming(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
          </Card>
        </div>

        {/* Right Column - Prompt Construction & Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompts Input */}
          <Card className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                System Prompt
              </label>
              <textarea
                rows={2}
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                placeholder="Enter system instructions..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                User Prompt
              </label>
              <textarea
                rows={4}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Enter user prompt query..."
              />
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                isLoading={loading}
                disabled={!userPrompt.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="w-4 h-4" />
                <span>Generate Completion</span>
              </Button>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Completion Output Panel */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Model Output Response
                </h2>
              </div>
              {chatResponse && (
                <div className="flex items-center space-x-2">
                  <Badge variant="indigo" size="sm">
                    {chatResponse.provider.toUpperCase()}
                  </Badge>
                  <Badge variant="emerald" size="sm">
                    {chatResponse.model}
                  </Badge>
                </div>
              )}
            </div>

            <div className="min-h-[160px] p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto border border-slate-800">
              {loading && !streamedText ? (
                <div className="flex items-center space-x-2 text-slate-500 animate-pulse">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Delegating request to unified AI service...</span>
                </div>
              ) : streamedText ? (
                <span>{streamedText}</span>
              ) : chatResponse ? (
                <span>{chatResponse.response}</span>
              ) : (
                <span className="text-slate-600">
                  // Provider output will appear here after generation...
                </span>
              )}
            </div>

            {/* Performance & Token Metrics Footer */}
            {chatResponse && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Latency: <strong>{chatResponse.latency_ms} ms</strong></span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Request ID: <strong className="font-mono">{chatResponse.request_id}</strong></span>
                  </div>
                </div>

                {chatResponse.usage && (
                  <div className="flex items-center space-x-2 font-mono text-[10px] bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg">
                    <span>Prompt: {chatResponse.usage.prompt_tokens}</span>
                    <span>•</span>
                    <span>Completion: {chatResponse.usage.completion_tokens}</span>
                    <span>•</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      Total: {chatResponse.usage.total_tokens} tokens
                    </span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
