import React, { useState, useRef } from 'react';
import { X, Upload, Check, AlertCircle, ArrowRight } from 'lucide-react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Language } from './types';

interface ProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (products: Product[]) => void;
  lang: Language;
}

const PRODUCT_FIELDS = [
  { key: 'id', label: 'ID' },
  { key: 'name_en', label: 'Name (EN)' },
  { key: 'name_zh', label: 'Name (ZH)' },
  { key: 'subName_en', label: 'Sub-product Name (EN)' },
  { key: 'subName_zh', label: 'Sub-product Name (ZH)' },
  { key: 'description_en', label: 'Description (EN)' },
  { key: 'description_zh', label: 'Description (ZH)' },
  { key: 'details_en', label: 'Details (EN)' },
  { key: 'details_zh', label: 'Details (ZH)' },
  { key: 'price', label: 'Price' },
  { key: 'salePrice', label: 'Sale Price' },
  { key: 'category_en', label: 'Category (EN)' },
  { key: 'category_zh', label: 'Category (ZH)' },
  { key: 'weight', label: 'Legacy Weight' },
  { key: 'netWeight', label: 'Net Weight' },
  { key: 'grossWeight', label: 'Gross Weight' },
  { key: 'type_en', label: 'Type (EN)' },
  { key: 'type_zh', label: 'Type (ZH)' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'parts', label: 'Parts' },
  { key: 'youtubeId', label: 'YouTube ID' },
  { key: 'images', label: 'Images (Comma separated)' }
];

export const ProductImportModal: React.FC<ProductImportModalProps> = ({ isOpen, onClose, onImport, lang }) => {
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResults, setImportResults] = useState<Product[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        if (results.meta.fields) {
          setHeaders(results.meta.fields);
          // Auto-mapping
          const newMapping: Record<string, string> = {};
          PRODUCT_FIELDS.forEach(field => {
            const match = results.meta.fields?.find(h => 
              h.toLowerCase() === field.key.toLowerCase() || 
              h.toLowerCase() === field.label.toLowerCase()
            );
            if (match) newMapping[field.key] = match;
          });
          setMapping(newMapping);
        }
        setStep('map');
      }
    });
  };

  const handleImport = () => {
    const products: Product[] = csvData.map((row, index) => {
      const getVal = (key: string) => row[mapping[key]] || '';
      
      return {
        id: getVal('id') || `zp-import-${Date.now()}-${index}`,
        name: { en: getVal('name_en'), zh: getVal('name_zh') },
        description: { en: getVal('description_en'), zh: getVal('description_zh') },
        details: { en: getVal('details_en'), zh: getVal('details_zh') },
        price: Number(getVal('price')) || 0,
        salePrice: getVal('salePrice') ? Number(getVal('salePrice')) : undefined,
        category: { en: getVal('category_en'), zh: getVal('category_zh') },
        images: getVal('images') ? getVal('images').split(',').map((s: string) => s.trim()) : ['https://picsum.photos/seed/product/800/800'],
        weight: getVal('weight'),
        netWeight: getVal('netWeight'),
        grossWeight: getVal('grossWeight'),
        type: { en: getVal('type_en'), zh: getVal('type_zh') },
        subName: { en: getVal('subName_en'), zh: getVal('subName_zh') },
        dimensions: getVal('dimensions'),
        parts: getVal('parts') ? Number(getVal('parts')) : undefined,
        youtubeId: getVal('youtubeId'),
        createdAt: new Date().toISOString()
      };
    });

    setImportResults(products);
    setStep('preview');
  };

  const confirmImport = () => {
    onImport(importResults);
    onClose();
    setStep('upload');
    setCsvData([]);
    setMapping({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-cyber-gray border border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-display text-cyber-blue uppercase tracking-widest">Import Products</h2>
            <p className="text-xs text-white/40 mt-1">Upload CSV and map fields to import bulk data</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div className="h-64 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-4 hover:border-cyber-blue/50 transition-colors cursor-pointer"
                 onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} className="text-cyber-blue" />
              <div className="text-center">
                <p className="text-white font-medium">Click to upload CSV file</p>
                <p className="text-xs text-white/40 mt-1">Make sure your file has a header row</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".csv" 
                className="hidden" 
              />
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {PRODUCT_FIELDS.map(field => (
                  <div key={field.key} className="bg-black/30 p-3 border border-white/5 rounded">
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">{field.label}</label>
                    <select 
                      value={mapping[field.key] || ''} 
                      onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full bg-black/50 border border-white/10 p-2 text-sm text-white focus:border-cyber-blue outline-none"
                    >
                      <option value="">-- Skip Field --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button 
                  onClick={() => setStep('upload')}
                  className="px-6 py-2 border border-white/10 text-white text-xs uppercase tracking-widest hover:bg-white/5"
                >
                  Back
                </button>
                <button 
                  onClick={handleImport}
                  className="px-6 py-2 bg-cyber-blue text-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                >
                  Preview Import <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="bg-cyber-blue/10 border border-cyber-blue/20 p-4 rounded flex items-center gap-3">
                <Check size={20} className="text-cyber-blue" />
                <p className="text-sm text-cyber-blue">Ready to import {importResults.length} products. Please review below.</p>
              </div>
              
              <div className="space-y-2">
                {importResults.slice(0, 5).map((p, i) => (
                  <div key={i} className="bg-black/30 p-3 border border-white/5 text-xs flex justify-between items-center">
                    <div>
                      <span className="text-white/40 mr-2">#{p.id}</span>
                      <span className="text-white font-medium">{p.name.zh || p.name.en}</span>
                    </div>
                    <span className="text-white/40">{p.category.zh || p.category.en}</span>
                  </div>
                ))}
                {importResults.length > 5 && (
                  <p className="text-center text-[10px] text-white/20 pt-2">... and {importResults.length - 5} more products</p>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <button 
                  onClick={() => setStep('map')}
                  className="px-6 py-2 border border-white/10 text-white text-xs uppercase tracking-widest hover:bg-white/5"
                >
                  Back to Mapping
                </button>
                <button 
                  onClick={confirmImport}
                  className="px-6 py-2 bg-cyber-yellow text-black text-xs uppercase tracking-widest hover:bg-white transition-all"
                >
                  Confirm & Import All
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
