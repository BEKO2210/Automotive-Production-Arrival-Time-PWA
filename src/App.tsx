import { Home } from '@/pages/Home';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Home />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
    </div>
  );
}

export default App;
