import { Suspense } from 'react';
import BrowseCaterersContent from './BrowseCaterersContent';

export default function BrowseCaterersPage() {
  return (
    <Suspense fallback={
      <section className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-semibold text-gray-900 mb-10">Browse Caterers</h1>
          <div className="text-center py-20">
            <p className="text-gray-500">Loading caterers...</p>
          </div>
        </div>
      </section>
    }>
      <BrowseCaterersContent />
    </Suspense>
  );
}
