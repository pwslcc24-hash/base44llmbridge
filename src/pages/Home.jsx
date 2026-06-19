import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Send, Copy, Check, Code, Zap, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const MODELS = [
  { value: 'automatic', label: 'Automatic (Fast)' },
  { value: 'gemini_3_flash', label: 'Gemini 3 Flash' },
  { value: 'gemini_3_1_pro', label: 'Gemini 3.1 Pro' },
  { value: 'gpt_5_mini', label: 'GPT-5 Mini' },
  { value: 'gpt_5_4', label: 'GPT-5.4' },
  { value: 'claude_sonnet_4_6', label: 'Claude Sonnet 4.6' },
  { value: 'claude_opus_4_6', label: 'Claude Opus 4.6' },
];

const EXAMPLE_CURL = `curl -X POST \\
  https://YOUR_APP_URL/llmProxy \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Explain quantum computing in one sentence",
    "model": "automatic"
  }'`;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('automatic');
  const [webSearch, setWebSearch] = useState(false);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await base44.functions.invoke('llmProxy', {
        prompt,
        model,
        add_context_from_internet: webSearch,
      });
      const data = res.data;
      setResponse(data.success ? data.result : `Error: ${data.error}`);
      setHistory((prev) => [
        { prompt, model, response: data.success ? data.result : `Error: ${data.error}`, success: data.success },
        ...prev,
      ]);
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Base44 LLM
          </div>
          <h1 className="font-heading text-5xl sm:text-6xl font-bold tracking-tight text-zinc-900 mb-4">
            LLM Playground
          </h1>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto">
            Test prompts and access Base44's AI models through a simple API endpoint your Cursor project can call.
          </p>
        </motion.div>

        {/* Chat Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 p-6 mb-8"
        >
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-[200px] bg-zinc-50 border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={webSearch}
                onChange={(e) => setWebSearch(e.target.checked)}
                className="rounded border-zinc-300"
              />
              Web search
            </label>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask anything... you can also call this from your Cursor project via the API"
            className="min-h-[120px] bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 resize-none mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{prompt.length} characters</span>
            <Button
              onClick={handleSubmit}
              disabled={loading || !prompt.trim()}
              className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 px-6"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Thinking...' : 'Send'}
            </Button>
          </div>
        </motion.div>

        {/* Response */}
        <AnimatePresence>
          {(response || loading) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-zinc-500">Response</span>
                {response && !loading && (
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(response)} className="text-zinc-400 hover:text-zinc-700">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              {loading ? (
                <div className="flex items-center gap-3 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Generating response...</span>
                </div>
              ) : (
                <div className="prose prose-zinc prose-sm max-w-none">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* API Docs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden mb-8"
        >
          <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <Code className="w-5 h-5 text-zinc-700" />
            <h2 className="font-heading text-lg font-semibold text-zinc-900">API Endpoint</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                POST /llmProxy
              </h3>
              <div className="bg-zinc-900 rounded-xl p-5 overflow-x-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500 font-mono">cURL Example</span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(EXAMPLE_CURL)} className="text-zinc-500 hover:text-zinc-300 h-6">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <pre className="text-sm text-zinc-300 font-mono leading-relaxed">{EXAMPLE_CURL}</pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-3">Parameters</h3>
              <div className="space-y-3">
                {[
                  { name: 'prompt', type: 'string', required: true, desc: 'The prompt to send to the LLM' },
                  { name: 'model', type: 'string', required: false, desc: 'automatic, gemini_3_flash, gemini_3_1_pro, gpt_5_mini, gpt_5_4, claude_sonnet_4_6, claude_opus_4_6' },
                  { name: 'add_context_from_internet', type: 'boolean', required: false, desc: 'Enable web search (Gemini models only)' },
                  { name: 'response_json_schema', type: 'object', required: false, desc: 'JSON schema for structured output' },
                  { name: 'file_urls', type: 'string[]', required: false, desc: 'File URLs to attach as context' },
                ].map((param) => (
                  <div key={param.name} className="flex items-start gap-3 text-sm">
                    <code className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded text-xs font-mono shrink-0">
                      {param.name}
                    </code>
                    <span className="text-zinc-500 text-xs">{param.type}</span>
                    {param.required && <span className="text-red-400 text-xs font-medium">required</span>}
                    <span className="text-zinc-400 text-xs flex-1">{param.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-zinc-200/80 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
              <ArrowRight className="w-5 h-5 text-zinc-700" />
              <h2 className="font-heading text-lg font-semibold text-zinc-900">History</h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {history.map((item, i) => (
                <div key={i} className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">{item.model}</span>
                  </div>
                  <p className="text-sm text-zinc-800 font-medium mb-2">{item.prompt}</p>
                  <p className="text-sm text-zinc-500 line-clamp-3">
                    {typeof item.response === 'string' ? item.response : JSON.stringify(item.response)}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}