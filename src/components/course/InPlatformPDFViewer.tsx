import React, { useState } from 'react';
import { CoursePDF, PDFChapter } from '../../types';
import { 
  FileText, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Search, 
  Download, 
  Printer, 
  Bookmark, 
  Building2, 
  ShieldCheck, 
  Check, 
  Info,
  BookOpen
} from 'lucide-react';

interface InPlatformPDFViewerProps {
  pdf: CoursePDF;
  onClose: () => void;
}

export const InPlatformPDFViewer: React.FC<InPlatformPDFViewerProps> = ({ pdf, onClose }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOutline, setShowOutline] = useState(false);

  const totalPages = Math.max(pdf.chapters.length, pdf.pageCount || 1);
  const currentChapter: PDFChapter | undefined = pdf.chapters[currentPageIndex] || pdf.chapters[0];

  const handleNextPage = () => {
    if (currentPageIndex < pdf.chapters.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(160, prev + 15));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(75, prev - 15));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden w-full transition-all ${
        isFullscreen ? 'h-full rounded-none border-none' : 'max-w-5xl h-[92vh]'
      }`}>
        {/* Top Control Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {pdf.title}
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 hidden sm:inline">
                  In-Platform PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {pdf.department} • {pdf.filename}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Outline toggle */}
            <button
              onClick={() => setShowOutline(!showOutline)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                showOutline ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Table of Contents"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Chapters</span>
            </button>

            {/* Print action */}
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition cursor-pointer"
              title="Close Reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar (Navigation & Zoom) */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-slate-200">
              Page {currentPageIndex + 1} of {pdf.chapters.length}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPageIndex >= pdf.chapters.length - 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search inside Document */}
          <div className="relative max-w-xs w-full hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-slate-950 rounded-lg text-xs text-slate-200 border border-slate-700 focus:outline-hidden focus:border-indigo-500 placeholder:text-slate-500"
            />
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-mono text-[11px] transition cursor-pointer"
              title="Reset Zoom"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Chapter Outline Sidebar */}
          {showOutline && (
            <div className="w-64 bg-slate-950 border-r border-slate-800 p-3 overflow-y-auto space-y-1 shrink-0 animate-in slide-in-from-left duration-150">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Document Contents
              </p>
              {pdf.chapters.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setShowOutline(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl text-xs transition cursor-pointer ${
                    currentPageIndex === idx
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold truncate">{ch.title}</div>
                  <div className="text-[10px] opacity-70">Page {ch.page}</div>
                </button>
              ))}
            </div>
          )}

          {/* Document Render Canvas */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex justify-center">
            <div 
              className="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-12 max-w-3xl w-full border border-slate-200 transition-all duration-200 my-auto"
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            >
              {/* Document Header Seal */}
              <div className="border-b-2 border-indigo-900 pb-4 mb-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-950 font-bold text-sm tracking-wide uppercase">
                    <Building2 className="w-5 h-5 text-indigo-700" />
                    <span>National Council for Cooperative Training (NCCT)</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ministry of Cooperation, Government of India • Technical Directorate
                  </p>
                </div>

                <div className="text-right">
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-bold px-2 py-1 rounded-md">
                    OFFICIAL MANUAL
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    SEC-DOC-{pdf.id.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="mb-6">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {pdf.department}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {pdf.title}
                </h1>
                <p className="text-xs text-slate-500 mt-1 italic">
                  Prepared by {pdf.author}
                </p>
              </div>

              {/* Current Chapter Content */}
              {currentChapter ? (
                <div className="space-y-6">
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5">
                    <h2 className="text-sm font-bold text-indigo-950">
                      {currentChapter.title}
                    </h2>
                  </div>

                  <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
                    <p>{currentChapter.content}</p>
                  </div>

                  {/* Highlights Callout */}
                  {currentChapter.highlights && currentChapter.highlights.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-900">
                        <Bookmark className="w-4 h-4 text-amber-600" />
                        <span>Statutory Rules & Critical Parameters</span>
                      </div>
                      <ul className="space-y-1.5 pl-2">
                        {currentChapter.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-amber-900 flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Definitions Table */}
                  {currentChapter.keyTerms && currentChapter.keyTerms.length > 0 && (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                      <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 border-b border-slate-200">
                        Glossary & Technical Definitions
                      </div>
                      <div className="divide-y divide-slate-100">
                        {currentChapter.keyTerms.map((term, i) => (
                          <div key={i} className="p-3 bg-white flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                            <span className="font-bold text-indigo-900 sm:w-40 shrink-0">{term.term}</span>
                            <span className="text-slate-600">{term.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagram / Schematic Note */}
                  {currentChapter.diagramDescription && (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-xs text-slate-600 flex items-start space-x-3">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-800 block">Engineering Schematic Representation:</span>
                        <span>{currentChapter.diagramDescription}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Document page ready for viewing.</p>
                </div>
              )}

              {/* Document Footer */}
              <div className="mt-10 pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NCCT Official Curriculum Asset</span>
                </div>
                <div>
                  Page {currentPageIndex + 1} of {pdf.chapters.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
