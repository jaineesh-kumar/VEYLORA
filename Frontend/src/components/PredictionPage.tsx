import React, { useState } from 'react';
import {
    Terminal, Clipboard, Search, Zap, Shield, Lock,
    AlertCircle, Hourglass, Key, Cpu, History, BarChart3, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterEffect } from './ui/typewriter-effect';
import { toast } from 'react-hot-toast';
import axios from 'axios';


const algorithmDetails: Record<string, {
    name: string;
    description: string;
    useCases: string[];
    strengths: string[];
    weaknesses: string[];
    keySizes?: number[];
    type: string;
}> = {
    aes: {
        name: 'AES',
        description: 'Advanced Encryption Standard (AES) is a symmetric encryption algorithm using block cipher methodology',
        useCases: ['Data-at-rest encryption', 'SSL/TLS', 'Wireless security'],
        strengths: ['High performance', 'Hardware acceleration', 'NIST certified'],
        weaknesses: ['Key management complexity', 'IV misuse vulnerabilities'],
        keySizes: [128, 192, 256],
        type: 'Symmetric Block Cipher'
    },
    des: {
        name: 'DES',
        description: 'Data Encryption Standard (DES) is a legacy symmetric-key algorithm using Feistel network structure',
        useCases: ['Legacy systems', 'ATM PIN validation', 'Retrocompatibility'],
        strengths: ['Simple implementation', 'Historical significance'],
        weaknesses: ['56-bit key vulnerability', 'Brute-force susceptible'],
        keySizes: [56],
        type: 'Symmetric Block Cipher'
    },
    '3des': {
        name: '3DES (Triple DES)',
        description: 'Triple Data Encryption Standard applies DES three times to each data block for increased security, but is slower than AES.',
        useCases: ['Legacy financial systems', 'Backward compatibility'],
        strengths: ['Higher security than single DES', 'Well-understood'],
        weaknesses: ['Lower performance', 'Block size still 64 bits'],
        keySizes: [168],
        type: 'Symmetric Block Cipher'
    },
    blowfish: {
        name: "Blowfish",
        type: "Symmetric Block Cipher",
        useCases: ["Password hashing", "File and disk encryption", "Embedded systems"],
        strengths: ["Variable key length up to 448 bits", "Fast implementation on 32-bit CPUs", "No known practical attacks", "Public domain algorithm"],
        weaknesses: ["Small block size (64 bits)", "Slow key schedule generation", "Not recommended for modern applications"],
        description: "Blowfish is a symmetric block cipher designed by Bruce Schneier. While still secure, it's largely been superseded by newer algorithms like AES."
    },
    rc4: {
        name: "RC4 (Rivest Cipher 4)",
        type: "Stream Cipher",
        useCases: ["Legacy SSL/TLS protocols", "WEP encryption (historical)", "Real-time streaming encryption"],
        strengths: ["Very fast and simple implementation", "Variable key size", "Stream cipher (no block size limitations)"],
        weaknesses: ["Multiple known vulnerabilities", "Weak initialization vectors", "Not recommended for new applications"],
        description: "RC4 is a stream cipher that was once widely used in protocols like SSL/TLS and WEP. Due to various vulnerabilities, it's no longer recommended for secure communications."
    },
    chacha20: {
        name: "ChaCha20",
        type: "Stream Cipher",
        useCases: ["TLS connections", "Mobile device encryption", "High-performance applications"],
        strengths: ["Excellent performance in software", "No specialized hardware required", "Strong security margin", "Resistance to timing attacks"],
        weaknesses: ["Less hardware support than AES", "Relatively new compared to other algorithms", "Limited adoption in legacy systems"],
        description: "ChaCha20 is a modern stream cipher designed as an alternative to AES, offering excellent performance in software implementations."
    },
    rsa: {
        name: "RSA (Rivest-Shamir-Adleman)",
        type: "Asymmetric Cipher",
        useCases: ["Digital signatures", "Key exchange", "Secure communications", "Certificate authorities"],
        strengths: ["Well-studied and widely deployed", "Suitable for both encryption and signatures", "Mathematical foundation based on factoring", "Public key infrastructure support"],
        weaknesses: ["Slow compared to symmetric algorithms", "Large key sizes required", "Vulnerable to quantum computing attacks", "Complex implementation requirements"],
        description: "RSA is one of the first practical public-key cryptosystems, widely used for secure data transmission and digital signatures."
    },
    dsa: {
        name: "Digital Signature Algorithm (DSA)",
        type: "Digital Signature",
        useCases: ["Digital document signing", "Certificate signing", "Authentication systems"],
        strengths: ["Smaller signatures than RSA", "Fast signature generation", "FIPS standardized", "No encryption patent issues"],
        weaknesses: ["Slower signature verification than RSA", "Random number generation critical", "Only useful for signatures, not encryption"],
        description: "DSA is a Federal Information Processing Standard for digital signatures, specifically designed for signature operations."
    },
    ecdsa: {
        name: "Elliptic Curve Digital Signature Algorithm (ECDSA)",
        type: "Digital Signature",
        useCases: ["Blockchain transactions", "Mobile security", "IoT device authentication", "Smart cards"],
        strengths: ["Shorter key lengths than RSA/DSA", "Fast operations", "Low computational overhead", "Ideal for constrained devices"],
        weaknesses: ["Complex implementation", "Requires quality random numbers", "Some curves potentially weak", "Quantum computer vulnerable"],
        description: "ECDSA provides the security of DSA while using much shorter keys through elliptic curve cryptography."
    },
    'diffie-hellman': {
        name: "Diffie-Hellman Key Exchange",
        type: "Key Exchange Protocol",
        useCases: ["Secure key establishment", "VPN tunneling", "Session key generation", "Forward secrecy in TLS"],
        strengths: ["No pre-shared secrets needed", "Perfect forward secrecy", "Fundamental to many protocols", "Mathematically proven security"],
        weaknesses: ["Vulnerable to man-in-the-middle attacks without authentication", "Computationally intensive", "Requires careful parameter selection"],
        description: "The Diffie-Hellman key exchange protocol allows two parties to establish a shared secret over an insecure channel."
    },
    ecdh: {
        name: "Elliptic Curve Diffie-Hellman (ECDH)",
        type: "Key Exchange Protocol",
        useCases: ["TLS handshakes", "Secure messaging apps", "IoT communication", "Mobile applications"],
        strengths: ["More efficient than classical DH", "Smaller key sizes", "Strong security guarantees", "Ideal for mobile/embedded systems"],
        weaknesses: ["Implementation complexity", "Specific curve selection important", "Potential quantum computing threats"],
        description: "ECDH is a variant of the Diffie-Hellman key exchange protocol using elliptic curve cryptography for key agreement."
    },
    md5: {
        name: 'MD5',
        description: 'MD5 is a cryptographic hash function producing 128-bit digests; now considered broken for collision resistance.',
        useCases: ['Data integrity checks (legacy)'],
        strengths: ['Fast computation'],
        weaknesses: ['Collision vulnerabilities'],
        keySizes: [],
        type: 'Hash Function'
    },
    'sha-1': {
        name: 'SHA-1',
        description: 'SHA-1 is a 160-bit hash function, once widely used but now deprecated due to practical collision attacks.',
        useCases: ['Legacy TLS', 'Version control identifiers'],
        strengths: ['Simple design'],
        weaknesses: ['Collision attacks'],
        keySizes: [],
        type: 'Hash Function'
    },
    'sha-256': {
        name: 'SHA-256',
        description: 'SHA-256 is part of the SHA-2 family, producing 256-bit digests; widely used for integrity and digital signatures.',
        useCases: ['Blockchain', 'TLS certificates', 'File integrity'],
        strengths: ['Strong collision resistance'],
        weaknesses: ['Slower on constrained devices'],
        keySizes: [],
        type: 'Hash Function'
    },
    'sha3-256': {
        name: 'SHA3-256',
        description: 'SHA3-256 is a Keccak-based hash function, offering a different internal structure from SHA-2 for additional diversity.',
        useCases: ['Next-generation hashing', 'Post-quantum prep'],
        strengths: ['Different design from SHA-2'],
        weaknesses: ['Less hardware optimization'],
        keySizes: [],
        type: 'Hash Function'
    }
};

// Maps the raw model prediction labels to our algorithmDetails keys
const predictionToKeyMap: Record<string, keyof typeof algorithmDetails> = {
    'aes-128': 'aes', 'aes-192': 'aes', 'aes-256': 'aes', 'aes': 'aes',
    'des': 'des', '3des': '3des', 'blowfish': 'blowfish',
    'rc4': 'rc4', 'chacha20': 'chacha20',
    'rsa': 'rsa', 'dsa': 'dsa', 'ecdsa': 'ecdsa',
    'diffie-hellman': 'diffie-hellman', 'ecdh': 'ecdh',
    'md5': 'md5', 'sha-1': 'sha-1', 'sha-256': 'sha-256',
    'sha3-256': 'sha3-256', 'sha-3-256': 'sha3-256',
};

const normalizeKey = (raw: string): keyof typeof algorithmDetails | null => {
    const lower = raw.toLowerCase().trim();
    return predictionToKeyMap[lower] ?? null;
};

const API_BASE = import.meta?.env?.REACT_APP_API_BASE || 'http://localhost:8080';

// Types for the new structured prediction response
interface AlgorithmPrediction {
    algorithm: string;
    confidence: number;
}

interface AnalysisMetadata {
    length: number;
    entropy: number;
    mean: number;
    std: number;
    blockAligned8: boolean;
    blockAligned16: boolean;
    isDerEncoded: boolean;
    startsWith0x30: boolean;
    chi2PValue: number;
    classificationMethod: string;
    isAmbiguous?: boolean;
    insights?: string[];
}

interface PredictionResponse {
    topPredictions: AlgorithmPrediction[];
    family: string;
    analysis: AnalysisMetadata;
}

const PredictionPage = () => {
    const [inputHex, setInputHex] = useState('');
    const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<{ input: string; result: PredictionResponse }[]>([]);
    const [showDetails, setShowDetails] = useState(true);

    const handlePredict = async () => {
        // Allow space-separated hex now (A4 23 69 9F ...) as well as continuous hex
        const cleaned = inputHex.replace(/\s+/g, '');
        if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length === 0) {
            toast.error('Invalid HEX format. Use continuous hex (a42369) or space-separated (A4 23 69).');
            return;
        }
        if (cleaned.length % 2 !== 0) {
            toast.error('Invalid HEX: odd number of hex characters');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const resp = await axios.post<PredictionResponse>(
                `${API_BASE}/api/ml/predict`,
                { input_hex: inputHex },
                { headers }
            );

            const data = resp.data;
            console.log('Prediction response:', data);

            if (!data.topPredictions || data.topPredictions.length === 0) {
                toast.error('No predictions returned');
                return;
            }

            setPrediction(data);
            setHistory(prev => [{ input: inputHex, result: data }, ...prev.slice(0, 5)]);
            setShowDetails(true);
            toast.success('Analysis complete!');
        } catch (err: any) {
            console.error('Prediction error:', err);
            const msg = err?.response?.data?.error || 'Prediction failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string): void => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    // Get the top algorithm's key for showing detailed info
    const topAlgoKey = prediction?.topPredictions?.[0]
        ? normalizeKey(prediction.topPredictions[0].algorithm)
        : null;

    const topAlgoDetails = topAlgoKey ? algorithmDetails[topAlgoKey] : null;

    const ConfidenceBar: React.FC<{ algorithm: string; confidence: number; isTop?: boolean }> = ({ algorithm, confidence, isTop }) => {
        const pct = Math.round(confidence * 100);
        const key = normalizeKey(algorithm);
        const displayName = key && algorithmDetails[key] ? algorithmDetails[key].name : algorithm;

        return (
            <div className={`p-3 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${isTop ? 'border-accent-violet bg-accent-violet/10 shadow-sm' : 'border-ink-dim/20 bg-white/10'}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium font-headline ${isTop ? 'text-accent-violet' : 'text-ink-dim'}`}>
                        {displayName}
                    </span>
                    <span className={`text-sm font-mono ${isTop ? 'text-accent-blue' : 'text-ink-dim/70'}`}>
                        {pct}%
                    </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden border border-ink-dim/10">
                    <motion.div
                        className={`h-2 rounded-full ${isTop ? 'bg-gradient-to-r from-accent-violet to-accent-blue shadow-sm' : 'bg-ink-dim/50'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />
                </div>
            </div>
        );
    };

    const DetailSection: React.FC<{ title: string; icon: React.ComponentType<any>; items: string[] }> = ({ title, icon: Icon, items }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-white/30 backdrop-blur-sm border border-ink-dim/10 rounded-lg hover:border-accent-violet/30 transition-colors"
        >
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-accent-violet" />
                <h3 className="font-semibold text-accent-violet/80">{title}</h3>
            </div>
            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start text-ink-dim">
                        <span className="text-accent-violet mr-2">▹</span>
                        {item}
                    </li>
                ))}
            </ul>
        </motion.div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen text-ink overflow-hidden pt-24 pb-12">
            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Header */}
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
                    <h1 className="text-5xl font-semibold mb-4 font-headline text-ink">
                        Cryptographic Analysis
                    </h1>
                    <p className="text-ink-dim max-w-2xl mx-auto font-body text-lg">
                        Identify cryptographic algorithms using AI-powered pattern recognition and statistical analysis
                    </p>
                </motion.div>

                {/* Main */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Input + Results */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-surface p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2 font-headline">
                                    <Search className="w-6 h-6 text-accent-violet" /> Analyze HEX Input
                                </h2>
                                <button onClick={() => copyToClipboard(inputHex)} className="flex items-center gap-2 text-sm text-ink-dim hover:text-ink">
                                    <Clipboard className="w-5 h-5" /> Copy
                                </button>
                            </div>
                            <textarea
                                value={inputHex}
                                onChange={e => setInputHex(e.target.value)}
                                className="w-full h-32 bg-white/30 rounded-lg p-4 border border-ink-dim/20 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue resize-none font-mono text-sm text-ink transition-all placeholder:text-ink-dim/60 outline-none"
                                placeholder="Paste HEX data — continuous (a42369...) or space-separated (A4 23 69 9F ...)"
                                spellCheck="false"
                            />
                            <button
                                onClick={handlePredict}
                                disabled={loading}
                                className="w-full mt-6 bg-pill-dark text-white hover:opacity-90 px-6 py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 hover:-translate-y-[1px]"
                            >
                                {loading ? (
                                    <><Hourglass className="w-5 h-5 animate-spin" /> Analyzing Ciphertext...</>
                                ) : (
                                    <><Terminal className="w-5 h-5" /> Detect Algorithm</>
                                )}
                            </button>
                        </motion.div>

                        {/* Results */}
                        <AnimatePresence>
                            {prediction && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6"
                                >
                                    {/* Top Predictions with Confidence Bars */}
                                    <div className="glass-surface p-6 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-violet to-accent-blue"></div>
                                        <div className="flex items-center gap-3 mb-5">
                                            <Shield className="w-8 h-8 text-accent-violet" />
                                            <div className="flex items-center gap-3">
                                                <TypewriterEffect
                                                    key={prediction.topPredictions[0].algorithm + inputHex}
                                                    text={[{
                                                        text: `Detected: ${prediction.topPredictions[0].algorithm}`,
                                                        className: "text-2xl font-bold font-headline bg-gradient-to-r from-accent-violet to-accent-blue bg-clip-text text-transparent"
                                                    }]}
                                                    cursorClassName="bg-accent-blue"
                                                />
                                                {prediction.analysis?.isAmbiguous && (
                                                    <span className="px-2 py-1 text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-md">
                                                        AMBIGUOUS
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-sm text-ink-dim">
                                                Family: <span className="text-accent-violet font-medium">{prediction.family}</span>
                                            </span>
                                        </div>

                                        {/* Confidence Bars for all predictions */}
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium text-ink-dim flex items-center gap-2 mb-3">
                                                <BarChart3 className="w-4 h-4" /> Probability Rankings
                                            </h3>
                                            {prediction.topPredictions.map((pred, idx) => (
                                                <ConfidenceBar
                                                    key={pred.algorithm}
                                                    algorithm={pred.algorithm}
                                                    confidence={pred.confidence}
                                                    isTop={idx === 0}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Analysis Metadata */}
                                    {prediction.analysis && (
                                        <div className="glass-surface p-6">
                                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-headline">
                                                <Info className="w-5 h-5 text-accent-blue" /> Statistical Analysis
                                            </h3>
                                            
                                            {/* Insights */}
                                            {prediction.analysis.insights && prediction.analysis.insights.length > 0 && (
                                                <div className="mb-6 space-y-2">
                                                    {prediction.analysis.insights.map((insight, idx) => (
                                                        <div key={idx} className={`p-3 rounded-lg border text-sm flex items-start gap-2 ${prediction.analysis.isAmbiguous ? 'border-orange-500/50 bg-orange-900/20 text-orange-200' : 'border-red-500/50 bg-red-900/20 text-red-200'}`}>
                                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                            <p>{insight}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="p-3 bg-white/30 border border-ink-dim/10 rounded-lg text-center hover:border-accent-violet/30 transition-all">
                                                    <div className="text-xs text-ink-dim/70 mb-1 font-headline">Data Length</div>
                                                    <div className="text-lg font-mono text-accent-blue">{prediction.analysis.length} bytes</div>
                                                </div>
                                                <div className="p-3 bg-white/30 border border-ink-dim/10 rounded-lg text-center hover:border-accent-violet/30 transition-all">
                                                    <div className="text-xs text-ink-dim/70 mb-1 font-headline">Entropy</div>
                                                    <div className="text-lg font-mono text-accent-blue">{prediction.analysis.entropy?.toFixed(3) ?? 'N/A'}</div>
                                                </div>
                                                <div className="p-3 bg-white/30 border border-ink-dim/10 rounded-lg text-center hover:border-accent-violet/30 transition-all">
                                                    <div className="text-xs text-ink-dim/70 mb-1 font-headline">Method</div>
                                                    <div className="text-sm font-mono text-accent-blue">{prediction.analysis.classificationMethod?.replace(/_/g, ' ')}</div>
                                                </div>
                                                <div className="p-3 bg-white/30 border border-ink-dim/10 rounded-lg text-center hover:border-accent-violet/30 transition-all">
                                                    <div className="text-xs text-ink-dim/70 mb-1 font-headline">Block Aligned</div>
                                                    <div className="text-sm font-mono text-accent-blue">
                                                        {prediction.analysis.blockAligned16 ? '16-byte ✓' : prediction.analysis.blockAligned8 ? '8-byte ✓' : 'No'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed Algorithm Info */}
                                    {showDetails && topAlgoDetails && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-4">
                                            <DetailSection title="Use Cases" icon={Zap} items={topAlgoDetails.useCases} />
                                            <DetailSection title="Strengths" icon={Lock} items={topAlgoDetails.strengths} />
                                            <DetailSection title="Weaknesses" icon={AlertCircle} items={topAlgoDetails.weaknesses} />
                                            <DetailSection title="Technical Specs" icon={Cpu} items={[
                                                `Type: ${topAlgoDetails.type}`,
                                                `Key Sizes: ${topAlgoDetails.keySizes && topAlgoDetails.keySizes.length > 0 ? topAlgoDetails.keySizes.join('bit, ') + 'bit' : 'N/A'}`
                                            ]} />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar: History & Guide */}
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-6">
                        <div className="glass-surface p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-headline">
                                <History className="w-6 h-6 text-accent-violet" /> Analysis History
                            </h3>
                            <div className="space-y-3">
                                {history.length === 0 && (
                                    <p className="text-sm text-ink-dim">No analyses yet. Paste hex data above to get started.</p>
                                )}
                                {history.map((entry, idx) => {
                                    const topAlgo = entry.result.topPredictions?.[0]?.algorithm ?? 'Unknown';
                                    const confidence = entry.result.topPredictions?.[0]?.confidence ?? 0;
                                    const key = normalizeKey(topAlgo);
                                    const displayName = key && algorithmDetails[key] ? algorithmDetails[key].name : topAlgo;

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 bg-white/30 rounded-lg border border-ink-dim/10 hover:border-accent-violet/50 cursor-pointer transition-all hover:scale-[1.02]"
                                            onClick={() => {
                                                setInputHex(entry.input);
                                                setPrediction(entry.result);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-mono text-ink-dim">
                                                    {entry.input.slice(0, 20)}...
                                                </span>
                                                <span className="text-accent-violet text-sm">
                                                    {displayName} ({Math.round(confidence * 100)}%)
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="glass-surface p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-headline">
                                <Key className="w-6 h-6 text-accent-violet" /> Supported Algorithms
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.keys(algorithmDetails).map(algo => (
                                    <div key={algo} className="p-2 text-sm bg-white/30 rounded border border-ink-dim/10 hover:border-accent-violet/50 font-mono text-center transition-colors">
                                        {algorithmDetails[algo].name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default PredictionPage;