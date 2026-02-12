import { Smartphone, Wifi, Shield } from 'lucide-react';
import BrandHeader from './BrandHeader';

interface LandingScreenProps {
  onStartAsSender: () => void;
  onStartAsReceiver: () => void;
}

export default function LandingScreen({ onStartAsSender, onStartAsReceiver }: LandingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <BrandHeader />
      
      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Image */}
          <div className="flex justify-center mb-8">
            <img
              src="/assets/generated/file-transfer-hero.dim_1600x900.png"
              alt="File Transfer"
              className="w-full max-w-sm rounded-2xl shadow-lg"
            />
          </div>

          {/* Title */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Share Files Instantly
            </h1>
            <p className="text-muted-foreground text-lg">
              Transfer files directly between devices using Wi-Fi
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <button
              onClick={onStartAsSender}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-5 text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              <Smartphone className="h-6 w-6" />
              Send Files
            </button>

            <button
              onClick={onStartAsReceiver}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-accent px-6 py-5 text-accent-foreground font-semibold text-lg hover:bg-accent/90 transition-all border-2 border-border active:scale-[0.98]"
            >
              <Wifi className="h-6 w-6" />
              Receive Files
            </button>
          </div>

          {/* Features */}
          <div className="pt-8 space-y-3 text-center text-sm text-muted-foreground">
            <p>✓ No internet required</p>
            <p>✓ Direct peer-to-peer transfer</p>
            <p>✓ Fast and secure</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6 px-6 text-center text-sm text-muted-foreground space-y-2">
        <p>
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            <Shield className="h-3 w-3" />
            Privacy Policy
          </a>
        </p>
        <p className="text-xs">© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
