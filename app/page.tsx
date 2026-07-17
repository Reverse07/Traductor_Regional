// app/page.tsx
import Translator from '@/components/Translator';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4">
      <div className="w-full max-w-4xl">
        <Translator />
      </div>
    </main>
  );
}