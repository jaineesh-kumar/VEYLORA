
import { 
  Lock, Key, Hash, Cpu, Code2, Database, 
  Binary, Network, Terminal, Fingerprint, Shield, 
  Link2, LockKeyhole, Repeat,
} from 'lucide-react';
import { BackgroundBeams } from './ui/background-beams';
import { motion } from 'framer-motion';

const algorithmData = [
  {
    name: 'AES',
    type: 'Symmetric Encryption',
    useCase: 'Disk encryption, SSL/TLS, Wireless security',
    status: 'Secure (128+ bits)',
    description: 'Block cipher using substitution-permutation network (SPN) with 128/192/256-bit keys. Implements Rijndael algorithm with 10/12/14 rounds.',
    features: ['SPN structure', 'Multiple key lengths', 'Galois Field math'],
    icon: Lock,
    keySizes: [128, 192, 256]
  },
  {
    name: 'DES',
    type: 'Symmetric Encryption',
    useCase: 'Legacy systems, ATM PIN validation',
    status: 'Deprecated',
    description: '56-bit key Feistel cipher with 16 rounds. Vulnerable to brute-force attacks. Modern implementations use TripleDES.',
    features: ['Feistel network', '16 rounds', '64-bit block size'],
    icon: LockKeyhole,
    keySizes: [56]
  },
  {
    name: '3DES',
    type: 'Symmetric Encryption',
    useCase: 'Financial services, EMV chips',
    status: 'Being phased out',
    description: 'Triple Data Encryption Standard applying DES three times with 2/3 keys. 112/168-bit effective security.',
    features: ['3x DES operations', 'Keying options', '48 rounds'],
    icon: Repeat,
    keySizes: [112, 168]
  },
  {
    name: 'Blowfish',
    type: 'Symmetric Encryption',
    useCase: 'File encryption, Password hashing',
    status: 'Legacy',
    description: 'Variable-length key (32-448 bits) Feistel cipher. Uses key-dependent S-boxes and 16 rounds.',
    features: ['Fast in software', 'Compact design', 'No patents'],
    icon: Lock,
    keySizes: [32, 448]
  },
  {
    name: 'RC4',
    type: 'Stream Cipher',
    useCase: 'Old WiFi (WEP), TLS',
    status: 'Broken',
    description: 'ARC4 algorithm with key sizes 40-2048 bits. Vulnerable to multiple attacks including Fluhrer-Mantin-Shamir.',
    features: ['Simple implementation', 'Byte-oriented', 'Fast streaming'],
    icon: Link2,
    keySizes: [40, 2048]
  },
  {
    name: 'ChaCha20',
    type: 'Stream Cipher',
    useCase: 'Modern TLS, VPNs, Disk encryption',
    status: 'Secure',
    description: '20-round cipher using ARX (Add-Rotate-XOR) operations. IETF standard with 256-bit key.',
    features: ['256-bit security', 'Constant-time', 'SSE optimized'],
    icon: Shield,
    keySizes: [256]
  },
  {
    name: 'RSA',
    type: 'Asymmetric Encryption',
    useCase: 'Key exchange, Digital signatures',
    status: 'Secure (3072+ bits)',
    description: 'Based on integer factorization problem. Key sizes 1024-4096 bits. Uses OAEP padding for encryption.',
    features: ['PKCS#1 standards', 'Modular exponentiation', 'Prime number based'],
    icon: Key,
    keySizes: [1024, 4096]
  },
  {
    name: 'DSA',
    type: 'Digital Signature',
    useCase: 'Government systems, Code signing',
    status: 'Legacy',
    description: 'FIPS 186 standard using modular exponentiation. Requires prime modulus and subgroup generator.',
    features: ['Schnorr signatures', 'SHA-2 based', 'FIPS compliant'],
    icon: Fingerprint,
    keySizes: [1024, 3072]
  },
  {
    name: 'ECDSA',
    type: 'Digital Signature',
    useCase: 'Blockchains, TLS certificates',
    status: 'Secure',
    description: 'Elliptic curve variant of DSA using secp256r1/secp384r1 curves. 256-bit ECDSA ~3072-bit RSA security.',
    features: ['Compact signatures', 'NIST curves', 'Side-channel resistant'],
    icon: Fingerprint,
    keySizes: [256, 384]
  },
  {
    name: 'Diffie-Hellman',
    type: 'Key Exchange',
    useCase: 'SSL/TLS, VPNs',
    status: 'Secure (2048+ bits)',
    description: 'First public-key protocol based on discrete logarithm problem. Uses safe primes and generator parameters.',
    features: ['Forward secrecy', 'Static/ephemeral modes', 'RFC 7919 groups'],
    icon: Network,
    keySizes: [2048, 4096]
  },
  {
    name: 'ECDH',
    type: 'Key Exchange',
    useCase: 'Wireless (ECDH-ECDSA), Messaging',
    status: 'Secure',
    description: 'Elliptic curve variant of DH using NIST curves. 256-bit ECDH ~3072-bit DH security.',
    features: ['Compact parameters', 'X25519 support', 'Perfect forward secrecy'],
    icon: Network,
    keySizes: [256, 384]
  },
  {
    name: 'MD5',
    type: 'Hash Function',
    useCase: 'Checksums, Legacy systems',
    status: 'Broken',
    description: '128-bit hash with Merkle-Damgård construction. Vulnerable to collisions (e.g., Flame malware).',
    features: ['Simple padding', '4 round functions', '32-bit operations'],
    icon: Hash,
    keySizes: [128]
  },
  {
    name: 'SHA-1',
    type: 'Hash Function',
    useCase: 'Git versioning, Old certificates',
    status: 'Deprecated',
    description: '160-bit hash with similar structure to MD5. First collision found in 2017 (SHAttered attack).',
    features: ['NSA design', '80 rounds', 'Message scheduling'],
    icon: Hash,
    keySizes: [160]
  },
  {
    name: 'SHA-256',
    type: 'Hash Function',
    useCase: 'Blockchains, TLS certificates',
    status: 'Secure',
    description: 'SHA-2 family member using Merkle-Damgård construction with 256-bit output. Resistant to length extension.',
    features: ['64 rounds', '8 initial values', 'HMAC compatible'],
    icon: Hash,
    keySizes: [256]
  },
  {
    name: 'SHA3-256',
    type: 'Hash Function',
    useCase: 'Government systems, Cryptocurrencies',
    status: 'Secure',
    description: 'Keccak-based sponge function. NIST standard with 256-bit security. Immune to length extension.',
    features: ['Sponge construction', '12 rounds', 'Arbitrary output length'],
    icon: Hash,
    keySizes: [256]
  }
];

const AlgorithmCard = ({ algorithm }: { algorithm: typeof algorithmData[0] }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border border-ink-dim/10 bg-void/60 backdrop-blur-xl p-6 hover:border-signal-violet/40 hover:shadow-[0_0_30px_rgba(108,92,231,0.15)] transition-all h-full group">
    <div className="flex items-start gap-4 mb-4">
      <algorithm.icon className="w-8 h-8 text-signal-violet group-hover:text-cipher-cyan transition-colors flex-shrink-0" />
      <div>
        <h3 className="text-xl font-bold text-signal-violet font-display">{algorithm.name}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="text-xs font-mono px-2 py-1 bg-dusk/50 rounded-full">
            {algorithm.type}
          </span>
          <span className={`text-xs font-mono px-2 py-1 ${
            algorithm.status === 'Secure' ? 'bg-green-800/30' :
            algorithm.status === 'Deprecated' ? 'bg-red-800/30' : 'bg-yellow-800/30'
          } rounded-full`}>
            {algorithm.status}
          </span>
          <span className="text-xs font-mono px-2 py-1 bg-blue-800/30 rounded-full">
            Key Sizes: {algorithm.keySizes.join('/')} bits
          </span>
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-sm">
        <Key className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="font-semibold">Use Cases:</span>
          <span className="text-ink-dim ml-2">{algorithm.useCase}</span>
        </div>
      </div>
      <p className="text-ink-dim text-sm leading-relaxed">
        {algorithm.description}
      </p>
      <div className="border-t border-ink-dim/20 pt-3">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">Key Features:</h4>
        <ul className="list-disc list-inside space-y-1 text-ink-dim text-sm">
          {algorithm.features.map((feature, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-signal-violet mr-2">▹</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

const DocumentationPage = () => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen bg-void text-ink overflow-hidden">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_0%,var(--signal-violet)_0%,transparent_40%)] opacity-10 pointer-events-none blur-[120px]" />
      <BackgroundBeams className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" />
      
      {/* Hero Section */}
      <motion.section initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="container mx-auto px-4 py-20 text-center relative z-10">
        <h1 className="mb-4 text-7xl font-extrabold font-display bg-gradient-to-r from-signal-violet to-cipher-cyan bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(108,92,231,0.3)]">
          CryptML Documentation
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-lg text-ink-dim">
          Advanced cryptographic identification system leveraging entropy analysis, statistical modeling, 
          and ensemble machine learning for algorithm detection with 98.5% accuracy
        </p>
      </motion.section>

      {/* System Architecture */}
      <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="container mx-auto px-4 pb-20 relative z-10">
        <div className="rounded-xl border border-signal-violet/20 bg-void/60 backdrop-blur-xl shadow-[0_0_40px_rgba(108,92,231,0.1)] p-8 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <Cpu className="w-8 h-8 text-signal-violet" />
            <h2 className="text-3xl font-bold font-display">Detection Pipeline</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Database className="w-6 h-6 text-green-400" />
                Data Generation
              </h3>
              <p className="text-ink-dim">
                Synthetic dataset with 1M+ samples across 15 algorithms, generated using 
                cryptography libraries with randomized parameters
              </p>
              <pre className="rounded-lg bg-void/80 border border-ink-dim/10 p-4 text-sm text-cipher-cyan shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] font-mono overflow-x-auto">
                {`for _ in range(100):\n  key = os.urandom(16)\n  cipher = AES.new(key, AES.MODE_CBC)\n  dataset.append(...)`}
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code2 className="w-6 h-6 text-blue-400" />
                Feature Extraction
              </h3>
              <p className="text-ink-dim">
                7-dimensional feature vector capturing statistical properties:
              </p>
              <ul className="list-disc list-inside text-ink-dim text-sm space-y-1">
                {['Entropy', 'Byte distribution', 'Length analysis', '0x30 marker'].map((f, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-signal-violet mr-2">▸</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Network className="w-6 h-6 text-signal-violet" />
                Model Architecture
              </h3>
              <p className="text-ink-dim">
                Random Forest classifier with 500 estimators, achieving 98.5% cross-validation accuracy
              </p>
              <div className="flex items-center justify-between text-sm text-ink-dim">
                <span>Precision:</span>
                <span className="text-green-400">98.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-ink-dim">
                <span>Recall:</span>
                <span className="text-green-400">98.7%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm Grid */}
        <h2 className="text-4xl font-bold mb-8 flex items-center gap-4 font-display">
          <Terminal className="w-8 h-8 text-signal-violet" />
          Supported Algorithms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithmData.map((algorithm, index) => (
            <AlgorithmCard key={index} algorithm={algorithm} />
          ))}
        </div>

        {/* Detection Example */}
        <div className="mt-16 rounded-xl border border-signal-violet/20 bg-void/60 backdrop-blur-xl shadow-[0_0_40px_rgba(108,92,231,0.1)] p-8">
          <div className="flex items-center gap-4 mb-6">
            <Binary className="w-8 h-8 text-signal-violet" />
            <h2 className="text-3xl font-bold font-display">Sample Detection</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Feature Extraction</h3>
              <pre className="rounded-lg bg-void/80 border border-ink-dim/10 p-4 text-sm text-cipher-cyan shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] font-mono overflow-x-auto">
                {`def extract_features(data_hex):\n  # Calculate entropy, byte distribution\n  # Check 0x30 marker\n  return [entropy, mean, std, ...]`}
              </pre>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Model Prediction</h3>
              <pre className="rounded-lg bg-void/80 border border-ink-dim/10 p-4 text-sm text-cipher-cyan shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] font-mono overflow-x-auto">
                {`RandomForestClassifier(\n  n_estimators=500,\n  max_depth=30,\n  class_weight='balanced'\n)`}
              </pre>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};

export default DocumentationPage;