import { useRef, useState } from 'react';
import type { AppData } from '../types';
import { useDispatch, useStore } from '../store/StoreContext';
import { parseImport, serializeExport } from '../lib/storage';
import { ConfirmDialog } from './ConfirmDialog';

export function ImportExport({ onDialogOpenChange }: { onDialogOpenChange: (open: boolean) => void }) {
  const { scrambles, solves } = useStore();
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPending = (data: AppData | null) => {
    setPendingImport(data);
    onDialogOpenChange(data !== null);
  };

  const handleExport = () => {
    const json = serializeExport({ scrambles, solves });
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rubik-timer-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setError(null);
    try {
      setPending(parseImport(await file.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    }
  };

  return (
    <div className="border-t border-neutral-800 p-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 rounded-md border border-neutral-700 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 rounded-md border border-neutral-700 px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Import JSON
        </button>
      </div>
      {error !== null && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {pendingImport !== null && (
        <ConfirmDialog
          title="Import data?"
          message={`This replaces everything currently stored (${scrambles.length} scrambles, ${solves.length} solves) with the imported file (${pendingImport.scrambles.length} scrambles, ${pendingImport.solves.length} solves).`}
          confirmLabel="Import"
          destructive
          onConfirm={() => {
            dispatch({ type: 'IMPORT_DATA', data: pendingImport });
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
