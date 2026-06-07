import { Sun, Zap, AlertTriangle } from 'lucide-react';

const examples = [
  '"Explain quantum computing in simple terms" →',
  '"Got any creative ideas for a 10 year old\'s birthday?" →',
  '"How do I make an HTTP request in Javascript?" →',
];

const capabilities = [
  'Remembers what user said earlier in the conversation',
  'Allows user to provide follow-up corrections',
  'Trained to decline inappropriate requests',
];

const limitations = [
  'May occasionally generate incorrect information',
  'May occasionally produce harmful instructions or biased content',
  'Limited knowledge of world and events after 2021',
];

export default function LandingScreen() {
  return (
    <div className="landing-screen">
      <h1 className="landing-title">ChatGPT</h1>

      <div className="landing-columns">
        {/* Examples */}
        <div className="landing-column">
          <div className="landing-column-header">
            <Sun size={20} className="landing-icon" />
            <h2 className="landing-column-title">Examples</h2>
          </div>
          <div className="landing-cards">
            {examples.map((text, i) => (
              <div key={i} className="landing-card">
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="landing-column">
          <div className="landing-column-header">
            <Zap size={20} className="landing-icon" />
            <h2 className="landing-column-title">Capabilities</h2>
          </div>
          <div className="landing-cards">
            {capabilities.map((text, i) => (
              <div key={i} className="landing-card">
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="landing-column">
          <div className="landing-column-header">
            <AlertTriangle size={20} className="landing-icon" />
            <h2 className="landing-column-title">Limitations</h2>
          </div>
          <div className="landing-cards">
            {limitations.map((text, i) => (
              <div key={i} className="landing-card">
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
