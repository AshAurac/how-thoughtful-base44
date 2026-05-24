import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Upload, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';

const EXAMPLE_CSV = `name,description,link,price,priority
Dyson Airwrap,The hair styling tool I've wanted forever,https://dyson.com,599,high
Kindle Paperwhite,For reading on the go,,149,medium
Yoga mat,Non-slip thick mat,,45,low
Nespresso pods,Variety pack,,30,medium`;

const PRIORITY_VALUES = ['low', 'medium', 'high'];

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = [];
    let cur = '';
    let inQuote = false;
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { vals.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    vals.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
}

function validateRow(row) {
  const errors = [];
  if (!row.name) errors.push('Missing name');
  if (row.priority && !PRIORITY_VALUES.includes(row.priority)) errors.push('Priority must be low/medium/high');
  if (row.price && isNaN(parseFloat(row.price))) errors.push('Price must be a number');
  return errors;
}

export default function BulkImportWishlist({ wishlistId, onClose }) {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const process = (text) => {
    const parsed = parseCSV(text);
    const errs = {};
    parsed.forEach((row, i) => {
      const e = validateRow(row);
      if (e.length) errs[i] = e;
    });
    setRows(parsed);
    setErrors(errs);
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => process(e.target.result);
    reader.readAsText(file);
  };

  const validRows = rows.filter((_, i) => !errors[i]);

  const handleImport = async () => {
    if (!validRows.length || !wishlistId) return;
    setImporting(true);
    try {
      // Fetch current wishlist first, then append new items
      const wishlist = await base44.entities.Wishlist.filter({ id: wishlistId });
      const current = wishlist[0];
      const existingItems = current?.items || [];
      const newItems = validRows.map(row => ({
        name: row.name,
        description: row.description || '',
        link: row.link || '',
        price: row.price ? parseFloat(row.price) : undefined,
        priority: PRIORITY_VALUES.includes(row.priority) ? row.priority : 'medium',
      }));
      await base44.entities.Wishlist.update(wishlistId, { items: [...existingItems, ...newItems] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setDone(true);
      toast.success(`${validRows.length} items added to wishlist!`);
    } catch {
      toast.error('Import failed — please try again');
    }
    setImporting(false);
  };

  const downloadExample = () => {
    const blob = new Blob([EXAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'wishlist_import_example.csv'; a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-card rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg text-foreground">Bulk Import Wishlist</h2>
            <p className="text-sm text-muted-foreground">Upload a CSV or paste data below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-all">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-moss mx-auto" />
            <h3 className="font-heading font-bold text-xl text-foreground">{validRows.length} items added!</h3>
            <p className="text-sm text-muted-foreground">Your wishlist has been updated.</p>
            <button onClick={onClose} className="bg-terracotta text-white px-6 py-3 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all">Done</button>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <button onClick={downloadExample} className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
              <Download className="w-4 h-4" /> Download example CSV template
            </button>

            <div
              onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
              onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-terracotta/40 transition-all cursor-pointer"
              onClick={() => document.getElementById('wishlist-csv').click()}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-heading font-semibold text-foreground">Drop CSV here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Columns: name, description, link, price, priority</p>
              <input id="wishlist-csv" type="file" accept=".csv" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or paste CSV text</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <textarea
              rows={5}
              placeholder={EXAMPLE_CSV}
              onChange={e => process(e.target.value)}
              className="w-full border border-border rounded-2xl px-4 py-3 text-xs font-mono text-foreground bg-muted focus:outline-none focus:ring-2 focus:ring-terracotta/50 resize-none"
            />

            {rows.length > 0 && (
              <div>
                <p className="text-sm font-heading font-semibold text-foreground mb-2">
                  Preview: {validRows.length} valid / {rows.length - validRows.length} with errors
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rows.map((row, i) => (
                    <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-sm ${errors[i] ? 'bg-destructive/5 border border-destructive/20' : 'bg-moss/5 border border-moss/20'}`}>
                      {errors[i] ? <AlertCircle className="w-4 h-4 text-destructive flex-none mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-moss flex-none mt-0.5" />}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{row.name || '—'}{row.price ? ` · $${row.price}` : ''}</p>
                        {row.description && <p className="text-xs text-muted-foreground truncate">{row.description}</p>}
                        {errors[i] && <p className="text-xs text-destructive mt-0.5">{errors[i].join(', ')}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validRows.length > 0 && (
              <button onClick={handleImport} disabled={importing} className="w-full bg-terracotta text-white py-4 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 disabled:opacity-60">
                {importing ? 'Importing...' : `Import ${validRows.length} item${validRows.length !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}