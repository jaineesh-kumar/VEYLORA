import { useState } from 'react';
import axios from 'axios';
import {
  Lock, Key, Hash, Clipboard,
  RefreshCw, Settings, Shield, Zap, Rocket
} from 'lucide-react';
import { BackgroundBeams } from './ui/background-beams';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Map algorithm names to backend endpoint paths
const endpointMap: Record<string, string> = {
  AES: 'aes',
  DES: 'des',
  '3DES': '3des',
  Blowfish: 'blowfish',
  RC4: 'rc4',
  ChaCha20: 'chacha20',
  RSA: 'rsa',
  DSA: 'dsa',
  ECDSA: 'ecdsa',
  'Diffie-Hellman': 'diffe',
  ECDH: 'ecdh',
  MD5: 'md5',
  'SHA-1': 'sha1',
  'SHA-256': 'sha256',
  'SHA3-256': 'sha3-256',
};

const algorithms = [
  { name: 'AES', type: 'Symmetric', keySize: 256, icon: Lock },
  { name: 'DES', type: 'Symmetric', keySize: 56, icon: Lock },
  { name: '3DES', type: 'Symmetric', keySize: 168, icon: Lock },
  { name: 'Blowfish', type: 'Symmetric', keySize: 448, icon: Lock },
  { name: 'RC4', type: 'Stream', keySize: 2048, icon: Zap },
  { name: 'ChaCha20', type: 'Stream', keySize: 256, icon: Zap },
  { name: 'RSA', type: 'Asymmetric', keySize: 4096, icon: Key },
  { name: 'DSA', type: 'Signature', keySize: 3072, icon: Shield },
  { name: 'ECDSA', type: 'Signature', keySize: 384, icon: Shield },
  { name: 'Diffie-Hellman', type: 'Key Exchange', keySize: 4096, icon: Rocket },
  { name: 'ECDH', type: 'Key Exchange', keySize: 384, icon: Rocket },
  { name: 'MD5', type: 'Hash', keySize: 128, icon: Hash },
  { name: 'SHA-1', type: 'Hash', keySize: 160, icon: Hash },
  { name: 'SHA-256', type: 'Hash', keySize: 256, icon: Hash },
  { name: 'SHA3-256', type: 'Hash', keySize: 256, icon: Hash },
];

const API_BASE = import.meta?.env?.REACT_APP_API_BASE || 'http://localhost:8080';
type EncryptionHistoryItem = { algorithm: string; input: string; result: string };

const EncryptionPage = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<EncryptionHistoryItem[]>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Generate random 32-char plaintext (for display only)
      const randomText = Array(32)
        .fill(null)
        .map(() => Math.random().toString(36)[2])
        .join('');
      setInputText(randomText);
      toast.success('Random text generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEncrypt = async () => {
    setLoading(true);
    try {
      const endpoint = endpointMap[selectedAlgorithm.name];
      if (!endpoint) {
        throw new Error('Unsupported algorithm');
      }

      const resp = await axios.get(`${API_BASE}/api/encryption/${endpoint}`);
      const result = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
  
      setEncryptedText(result);
      setHistory(prev => [
        { algorithm: selectedAlgorithm.name, input: inputText, result },
        ...prev.slice(0, 4)
      ]);

      toast.success('Encryption successful!');
    } catch (err) {
      console.error(err);
      toast.error('Encryption failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = ({ text, message }: { text: string; message: string }) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="relative min-h-screen bg-black text-white">
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="veylora-page-kicker">Veylora / Encrypt</p>
          <h1 className="veylora-page-title font-bold mb-4">
            Transform with intent.
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A focused workspace for secure data transformations using industry-standard algorithms.
            {selectedAlgorithm && ` Selected: ${selectedAlgorithm.name}-${selectedAlgorithm.keySize}`}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Algorithm Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-xl border border-gray-800 bg-black/50 backdrop-blur-md p-6 transform-gpu [will-change:transform]">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-400" />
                Algorithm Configuration
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {algorithms.map(algo => (
                  <motion.button
                    key={algo.name}
                    onClick={() => setSelectedAlgorithm(algo)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedAlgorithm.name === algo.name
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-800 hover:border-purple-400'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <algo.icon className="w-5 h-5 text-purple-400" />
                      <span className="text-sm">{algo.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Encryption Workspace */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-800 bg-black/50 backdrop-blur-md p-6 transform-gpu [will-change:transform]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Input Text</h3>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Generate Random
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      className="w-full h-32 bg-gray-900 rounded-lg p-4 border border-gray-800 focus:ring-purple-500 resize-none"
                      placeholder="Enter text or generate random"
                    />
                    {inputText && (
                      <button
                        onClick={() => copyToClipboard({ text: inputText, message: 'Input copied!' })}
                        className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <Clipboard className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mt-2">Encrypted Output</h3>
                  <div className="relative">
                    <textarea
                      value={encryptedText}
                      readOnly
                      className="w-full h-32 bg-gray-900 rounded-lg p-4 border border-gray-800 resize-none"
                      placeholder="Encrypted result will appear here"
                    />
                    {encryptedText && (
                      <button
                        onClick={() => copyToClipboard({ text: encryptedText, message: 'Encrypted text copied!' })}
                        className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-lg"
                      >
                        <Clipboard className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Encrypt Button */}
              <button
                onClick={handleEncrypt}
                disabled={loading}
                className="w-full mt-6 border-2 border-purple-500 hover:bg-purple-600/20 text-white px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] [will-change:transform,box-shadow]"
              >
                <Shield className="w-5 h-5" />
                {loading ? 'Encrypting...' : 'Perform Encryption'}
              </button>
            </div>

            {/* History */}
            <div className="rounded-xl border border-gray-800 bg-black/50 backdrop-blur-md p-6 [content-visibility:auto] [contain-intrinsic-size:500px] transform-gpu [will-change:transform]">
              <h3 className="text-lg font-semibold mb-4">Recent Operations</h3>
              <div className="space-y-3">
                {history.length > 0 ? history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-800 [contain:layout_paint_style]">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-purple-400" />
                      <span className="font-mono text-sm">{item.algorithm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">{item.input.slice(0, 15)}...</span>
                      <span className="text-purple-400">→</span>
                      <span className="text-gray-400 text-sm">{item.result.slice(0, 15)}...</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-500 py-4">No recent operations</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionPage;
