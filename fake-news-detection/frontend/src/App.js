import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/news";

function App() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("analyze");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      if (res.data.success) {
        setHistory(res.data.data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const analyzeNews = async () => {
    if (!text.trim() && !url.trim()) {
      setError("Please enter some text or a URL to analyze");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await axios.post(`${API_URL}/detect`, {
        text: text.trim(),
        url: url.trim()
      });

      if (res.data.success) {
        setResult(res.data.data);
        fetchStats();
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error.response?.data?.error ||
        "Error analyzing news. Make sure both backend and ML service are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setText("");
    setUrl("");
    setResult(null);
    setError("");
  };

  const deleteHistory = async (id) => {
    try {
      await axios.delete(`${API_URL}/history/${id}`);
      fetchHistory();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  const clearAllHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      try {
        await axios.delete(`${API_URL}/history`);
        setHistory([]);
        fetchStats();
      } catch (error) {
        console.error("Failed to clear history:", error);
      }
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === "history") fetchHistory();
    if (tab === "stats") fetchStats();
  };

  const getResultColor = (finalResult) => {
    switch (finalResult) {
      case 'REAL':
      case 'VERIFIED REAL':
      case 'VERIFIED': return 'bg-green-500/10 border-green-500/50 text-green-400';
      case 'FAKE':
      case 'LIKELY FAKE':
      case 'FALSE': return 'bg-red-500/10 border-red-500/50 text-red-400';
      default: return 'bg-slate-800/50 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <header className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Advanced Fact-Checking AI v3.0
          </div>
          <h1 className="text-6xl font-black text-white tracking-tight">
            Fake News <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Detector</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Deep analysis using multi-weighted heuristics: ML Tensors + Live Fact-Check + Source Credibility + Red Flag Detection.
          </p>
        </header>

        {/* Main Interface Tab container */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10">
          <div className="flex border-b border-slate-700/50">
            {['analyze', 'history', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition-all duration-300 ${activeTab === tab
                  ? "bg-indigo-500/10 text-indigo-400 border-b-2 border-indigo-500"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-700/30"
                  }`}
              >
                {tab === 'analyze' && '🔍 Analysis Engine'}
                {tab === 'history' && '📜 Audit History'}
                {tab === 'stats' && '📊 Global Trends'}
              </button>
            ))}
          </div>

          <div className="p-8 lg:p-12">
            {activeTab === "analyze" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column: Input */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Article Content</label>
                      <textarea
                        rows="8"
                        placeholder="Paste news headline or full article text here..."
                        value={text}
                        onChange={(e) => { setText(e.target.value); setError(""); }}
                        className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-200 placeholder:text-slate-600 resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Article URL (Optional)</label>
                      <input
                        type="url"
                        placeholder="https://example.com/news-article"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); setError(""); }}
                        className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-slate-200 placeholder:text-slate-600"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={analyzeNews}
                        disabled={loading}
                        className="flex-[2] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-4 px-8 rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:transform-none"
                      >
                        {loading ? 'RUNNING HEURISTICS...' : 'START ANALYSIS'}
                      </button>
                      <button
                        onClick={clearAll}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white py-4 px-6 rounded-2xl font-bold transition-all"
                      >
                        CLEAR
                      </button>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Result Display */}
                  <div className="relative">
                    {!result && !loading && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-700/50 rounded-3xl bg-slate-900/20">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl">🤖</div>
                        <h3 className="text-xl font-bold text-slate-300">Awaiting Input</h3>
                        <p className="text-slate-500 mt-2">Enter data to initiate the detection pipeline</p>
                      </div>
                    )}

                    {loading && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-slate-900/40">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-6"></div>
                        <h3 className="text-xl font-bold text-slate-300 font-mono tracking-tighter animate-pulse">Processing Tensors...</h3>
                        <p className="text-slate-500 mt-2">Querying external verification sources</p>
                      </div>
                    )}

                    {result && (
                      <div className={`h-full p-8 rounded-3xl border-2 transition-all duration-500 ${getResultColor(result.finalResult)}`}>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Engine Verdict</span>
                            <h2 className="text-4xl font-black mt-1 leading-tight">{result.finalResult}</h2>
                          </div>
                          <div className="text-5xl">
                            {result.finalResult === 'REAL' ? '🛡️' : '🚫'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-black/20 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Confidence</span>
                            <div className="text-xl font-black">{result.confidenceLevel || 'Low'}</div>
                          </div>
                          <div className="p-4 bg-black/20 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1">Score</span>
                            <div className="text-xl font-black">{result.confidence}%</div>
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Reason:</h4>
                          <p className="text-sm font-medium leading-relaxed">{result.reason}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Red Flags:</h4>
                          <div className="space-y-2">
                            {result.redFlags && result.redFlags.length > 0 ? (
                              result.redFlags.map((flag, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-400">
                                  <span>🚩</span> {flag}
                                </div>
                              ))
                            ) : (
                              <div className="text-xs font-bold text-green-400/60 italic">None detected</div>
                            )}
                          </div>
                        </div>

                        <div className="mb-6 p-4 bg-indigo-500/5 border-l-4 border-indigo-500 rounded-r-xl">
                          <span className="text-[10px] font-black uppercase text-indigo-400/80 tracking-widest block mb-1">Extracted Claim</span>
                          <p className="text-sm font-medium italic">"{result.extractedClaim}"</p>
                        </div>

                        <div className="space-y-4">
                          <span className="text-xs font-black uppercase tracking-widest block opacity-60">Verification Sources</span>
                          {result.sources && result.sources.length > 0 ? (
                            <div className="space-y-2">
                              {result.sources.map((s, idx) => (
                                <div key={idx} className="p-2 bg-white/5 rounded-lg text-xs font-bold flex justify-between items-center">
                                  <span>{s}</span>
                                  <span className="opacity-50">Verified</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs opacity-60 italic">No direct matches in fact-check databases.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black">Audit History</h2>
                  <button onClick={clearAllHistory} className="text-red-400 hover:text-red-300 text-sm font-bold">PURGE RECORDS</button>
                </div>
                <div className="grid gap-4">
                  {history.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No records found. Initiating scan...</div>
                  ) : (
                    history.map(item => (
                      <div key={item._id} className="p-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${getResultColor(item.finalResult)}`}>
                              {item.finalResult}
                            </span>
                            <span className="text-xs text-slate-500">{new Date(item.analyzedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 text-sm line-clamp-1 italic">"{item.text}"</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Confidence</div>
                            <div className="text-lg font-black text-indigo-400">{item.confidence}%</div>
                          </div>
                          <button onClick={() => deleteHistory(item._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-all">🗑️</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="animate-in fade-in duration-500 space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-8 bg-slate-900/50 rounded-3xl border border-slate-700/50">
                    <div className="text-4xl font-black text-white mb-2">{stats?.total || 0}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Scan Volume</div>
                  </div>
                  <div className="p-8 bg-green-500/10 rounded-3xl border border-green-500/20">
                    <div className="text-4xl font-black text-green-400 mb-2">{stats?.real || 0}</div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-widest">Real Articles</div>
                  </div>
                  <div className="p-8 bg-red-500/10 rounded-3xl border border-red-500/20">
                    <div className="text-4xl font-black text-red-400 mb-2">{stats?.fake || 0}</div>
                    <div className="text-xs font-bold text-red-600 uppercase tracking-widest">Fake Articles</div>
                  </div>
                  <div className="p-8 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                    <div className="text-4xl font-black text-indigo-400 mb-2">{(stats?.real / stats?.total * 100 || 0).toFixed(1)}%</div>
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Trust Index</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-4">
          <div className="flex justify-center gap-8 opacity-40">
            <span className="font-bold tracking-tighter">FastAPI Core</span>
            <span className="font-bold tracking-tighter">BERT Evolution</span>
            <span className="font-bold tracking-tighter">Neural Verification</span>
          </div>
          <p className="text-slate-600 text-sm">
            © 2026 Fake News Guardian. Developed for high-integrity news verification.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
