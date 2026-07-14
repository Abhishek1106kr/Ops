import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <h2 className="text-2xl font-bold text-slate-200">404 - Page Not Found</h2>
      <p className="text-sm text-slate-500 mt-2">The requested operational view does not exist or has been archived.</p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 bg-slate-900 border border-darkBorder rounded-lg text-xs font-semibold text-slate-350 hover:text-slate-100 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
