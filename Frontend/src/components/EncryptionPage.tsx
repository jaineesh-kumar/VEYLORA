import { useState } from 'react';
import axios from 'axios';
import {
  Lock, Key, Hash, Clipboard,
  RefreshCw, Settings, Shield, Zap, Rocket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// Map algorithm names to backend endpoint paths
const endpointMap = {
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

const EncryptionPage = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(algorithms[0]);
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ algorithm: string; input: string; result: any }[]>([]);

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
      const endpoint = endpointMap[selectedAlgorithm.name as keyof typeof endpointMap];
      if (!endpoint) {
        throw new Error('Unsupported algorithm');
      }

      const resp = await axios.get(`${API_BASE}/api/encryption/${endpoint}`);
      const result = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data, null, 2);
  
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen text-ink overflow-hidden pt-24 pb-12">
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <h1 className="text-5xl font-semibold mb-4 font-headline text-ink">
            Cryptographic Operations
          </h1>
          <p className="text-ink-dim max-w-2xl mx-auto font-body text-lg">
            Secure data transformations powered by industry-standard algorithms.
            {selectedAlgorithm && <span className="text-accent-violet font-medium block mt-2">Selected: {selectedAlgorithm.name}-{selectedAlgorithm.keySize}</span>}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Algorithm Selection */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-surface p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-headline">
                <Settings className="w-6 h-6 text-accent-violet" />
                Algorithm Configuration
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {algorithms.map(algo => (
                  <motion.button
                    key={algo.name}
                    onClick={() => setSelectedAlgorithm(algo)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedAlgorithm.name === algo.name
                        ? 'border-accent-violet bg-accent-violet/10'
                        : 'border-ink-dim/10 hover:border-accent-violet/30 hover:bg-white/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-2">
                      <algo.icon className={`w-5 h-5 ${selectedAlgorithm.name === algo.name ? 'text-accent-blue' : 'text-accent-violet'}`} />
                      <span className="text-sm font-mono">{algo.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Encryption Workspace */}
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
            <div className="glass-surface p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold font-headline">Input Text</h3>
                    <button
                      onClick={handleGenerate}
                      disabled={loading}
                      className="flex items-center gap-2 text-sm bg-accent-violet/10 hover:bg-accent-violet/20 border border-accent-violet/20 text-accent-violet px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Generate Random
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      className="w-full h-32 bg-white/30 rounded-lg p-4 border border-ink-dim/20 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue resize-none font-mono text-sm text-ink transition-all placeholder:text-ink-dim/60 outline-none"
                      placeholder="Enter text or generate random"
                      spellCheck="false"
                    />
                    {inputText && (
                      <button
                        onClick={() => copyToClipboard({ text: inputText, message: 'Input copied!' })}
                        className="absolute top-2 right-2 p-2 hover:bg-dusk/50 rounded-lg"
                      >
                        <Clipboard className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Output */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mt-2 font-headline">Encrypted Output</h3>
                  <div className="relative">
                    <textarea
                      value={encryptedText}
                      readOnly
                      className="w-full h-32 bg-white/30 rounded-lg p-4 border border-ink-dim/20 resize-none font-mono text-sm text-ink outline-none"
                      placeholder="Encrypted result will appear here"
                      spellCheck="false"
                    />
                    {encryptedText && (
                      <button
                        onClick={() => copyToClipboard({ text: encryptedText, message: 'Encrypted text copied!' })}
                        className="absolute top-2 right-2 p-2 hover:bg-dusk/50 rounded-lg"
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
                className="w-full mt-6 bg-pill-dark text-white hover:opacity-90 px-6 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 hover:-translate-y-[1px]"
              >
                <Shield className="w-5 h-5" />
                {loading ? 'Encrypting...' : 'Perform Encryption'}
              </button>
            </div>

            {/* History */}
            <div className="glass-surface p-6">
              <h3 className="text-lg font-semibold mb-4 font-headline">Recent Operations</h3>
              <div className="space-y-3">
                {history.length > 0 ? history.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/30 rounded-lg border border-ink-dim/10 hover:border-accent-violet/30 transition-all">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-accent-violet" />
                      <span className="font-mono text-sm text-accent-blue">{item.algorithm}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-ink-dim text-sm">{item.input.slice(0, 15)}...</span>
                      <span className="text-accent-violet">→</span>
                      <span className="text-ink-dim text-sm">{item.result.slice(0, 15)}...</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-ink-dim/70 py-4">No recent operations</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default EncryptionPage;
