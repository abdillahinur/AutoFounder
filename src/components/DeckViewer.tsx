import { useRef, useState, useEffect } from 'react';
import { useTextTone } from '../hooks/useTextTone';
import { ChevronLeft, ChevronRight, Download, Edit3, Crown, Lock, FileText, Users, Eye } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';
import { useSlideHotkeys } from '../hooks/useSlideHotkeys';
import { SlideFrame } from './SlideFrame';
import type { SlideFormat } from '../constants/slide';
import type { Deck } from '../../utils/generateDeckJSON';
import { encodeDeckForUrl } from '../hooks/useGenerateDeck';

interface PPTViewerProps {
  deck?: Deck;
  isProUser?: boolean;
  initialPresent?: boolean;
}

async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to fetch image as data URL', e);
    return null;
  }
}

export default function PPTViewer({ deck, isProUser = false, initialPresent = false }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, enter, exit } = useFullscreen<HTMLDivElement>();
  const [presenting, setPresenting] = useState(false);
  const [blackout, setBlackout] = useState(false);

  if (!deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Deck Available</h1>
          <p className="text-gray-600 mb-6">
            It looks like no pitch deck has been generated yet. Please go back to the main page and create your deck first.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Main Page
          </button>
        </div>
      </div>
    );
  }

  const slides = deck.slides || [];
  const currentSlideData = slides[currentSlide];

  // Vite env option for forcing free downloads removed (not used here)
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goTo = (i: number) => setCurrentSlide(Math.max(0, Math.min(i, slides.length - 1)));
  const startPresent = async () => {
    setPresenting(true);
    try {
      // If the element doesn't support the Fullscreen API, open a new window as a presenter.
      if (!('requestFullscreen' in (stageRef.current || {}))) {
        const w = window.open('about:blank', '_blank', 'noopener');
        if (w) {
          const id = (deck as any)?.id;
          try { w.location.href = `${location.origin}/#deck=${encodeURIComponent(String(id))}&present=1`; } catch (e) { /* ignore */ }
          return;
        }
      }
      await enter(stageRef.current);
    } catch {}
    // if fullscreen fails (blocked), we still switch to presenting layout
  };
  const stopPresent = async () => { setPresenting(false); setBlackout(false); try { await exit(); } catch {} };

  useSlideHotkeys(presenting || isFullscreen, {
    next: () => goTo((currentSlide + 1) % slides.length),
    prev: () => goTo((currentSlide - 1 + slides.length) % slides.length),
    first: () => goTo(0),
    last: () => goTo(slides.length - 1),
    exit: stopPresent,
    toggleBlackout: () => setBlackout(b => !b),
  });

  // if we were opened with initialPresent (via hash), auto-start presenting
  useEffect(() => {
    if (initialPresent) {
      // kick off the present flow after mount
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      startPresent();
    }
  }, [initialPresent]);

  const handleEdit = () => {
    if (!isProUser) {
      setShowUpgrade(true);
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleMatchInvestors = async () => {
    if (!deck) return;
    
    // Create URL with deck data for investors page
    const deckData = encodeDeckForUrl(deck as any);
    const investorsUrl = `${window.location.origin}/#investors=${deckData}`;
    
    // Open new tab with proper URL
    const newTab = window.open(investorsUrl, '_blank');
    if (!newTab) {
      alert('Please allow popups to open investor matches in a new tab');
      return;
    }
  };


  const handleDownload = async () => {
    if (!isProUser) {
      setShowUpgrade(true);
      return;
    }
    
    if (!deck) return;
    
    setPreparing(true);
    try {
      const PPTXModule = await import('pptxgenjs');
      const PPTX = (PPTXModule && (PPTXModule.default || PPTXModule)) as any;
      const pres = new PPTX();
      // Apply layout based on deck meta slideFormat
      try {
        const fmt: SlideFormat = (deck as any)?.meta?.slideFormat ?? 'w16x9';
        pres.layout = fmt === 'w4x3' ? 'LAYOUT_4x3' : 'LAYOUT_16x9';
      } catch (e) { /* ignore */ }

  // slide dimensions not required when not watermarking

      const assets = (deck as any)?.meta?.themeAssets as { coverBg?: string; contentBg?: string } | undefined;
      const textTone = (deck as any)?.meta?.textTone || (assets && (assets as any).defaultText) || 'dark';
      const textColor = textTone === 'light' ? 'FFFFFF' : '000000';

  // isPaidDeck not required when not watermarking; use `isPaid` directly where needed

      for (let idx = 0; idx < deck.slides.length; idx++) {
        const s = deck.slides[idx] as any;
        const slide = pres.addSlide();

        // Set slide background from theme assets when available
        if (assets) {
          if (idx === 0 && assets.coverBg) {
            try { slide.background = { path: assets.coverBg }; } catch (e) { console.warn('pptx background set failed', e); }
          } else if (assets.contentBg) {
            try { slide.background = { path: assets.contentBg }; } catch (e) { console.warn('pptx background set failed', e); }
          }
        } else {
          // fallback solid white background
          try { slide.background = { color: 'FFFFFF' }; } catch (e) { /* ignore */ }
        }

  // (no watermark added for exported slides)

        const heading = s.title ?? s.heading ?? '';
        if (heading) {
          slide.addText(heading, { x: 0.5, y: 0.4, w: '90%', h: 0.8, fontSize: 26, bold: true, color: textColor });
        }

        const bullets = Array.isArray(s.bullets) ? s.bullets : [];
        if (bullets.length) {
          slide.addText(bullets.join('\n'), { x: 0.5, y: 1.4, w: '90%', h: 3.5, fontSize: 14, color: textColor });
        }

        const imageUrl = s.imageUrl ?? s.image;
        if (imageUrl) {
          const dataUrl = await fetchImageAsDataUrl(imageUrl);
          if (dataUrl) {
            try { slide.addImage({ data: dataUrl, x: 6.0, y: 1.0, w: 3.0 }); } catch (e) { console.warn('pptx addImage failed', e); }
          }
        }

  // (watermarking handled earlier with tiled watermark)
      }

      const title = (deck as any)?.metadata?.startupName || deck.slug || deck.id;
      const filenameSafe = `${String(title).replace(/[^a-z0-9\.\-_]/gi, '_')}-${deck.id}`;
      await pres.writeFile({ fileName: `${filenameSafe}.pptx` });
    } catch (e) {
      console.error('Failed to generate PPTX', e);
      try { alert('Failed to generate PPTX'); } catch (e) {}
    } finally {
      setPreparing(false);
    }
  };

  const assets = (deck as any)?.meta?.themeAssets as { coverBg?: string; contentBg?: string; defaultText?: 'light'|'dark' } | undefined;
  
  // Compute the inline background URL for the currently visible slide (null when a foreground image is present)
  const imageUrlForCurrent = (currentSlideData as any)?.imageUrl || (currentSlideData as any)?.image;
  let currentBgUrl: string | null = null;
  try {
    if (!imageUrlForCurrent) {
      if (assets) {
        const bg = currentSlide === 0 ? (assets.coverBg || assets.contentBg) : (assets.contentBg || assets.coverBg);
        if (bg) currentBgUrl = bg;
      }
    }
  } catch (e) {
    console.warn('Failed to compute currentBgUrl', e);
    currentBgUrl = null;
  }

  // Determine per-slide background URL to sample tone from: prefer slide image if present, else theme asset
  const slideMeta = currentSlideData as any;
  const bgUrlForTone = (slideMeta?.imageUrl || slideMeta?.image) ? String(slideMeta?.imageUrl || slideMeta?.image) : currentBgUrl;
  const fallbackTone = (deck as any)?.meta?.textTone ?? (assets && assets.defaultText) ?? 'dark';
  const tone = useTextTone({ imageUrl: bgUrlForTone ?? undefined, fallback: fallbackTone });
  const toneClass = tone === 'light' ? 'text-white' : 'text-black';
  const toneHex = tone === 'light' ? '#FFFFFF' : '#000000';
  // store the tone back onto the slide object in-memory so exporters can read it
  try { if (slideMeta) (slideMeta as any).textTone = tone; } catch (e) { /* ignore */ }

  // Slide sizing/format for the viewer surface
  const slideFormat: SlideFormat = (deck as any)?.meta?.slideFormat ?? 'w16x9';
  const mode: 'fit' | 'actual' = (deck as any)?.meta?.viewerMode ?? 'fit';

  return (
    <div className={presenting ? 'presenting' : ''}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b app-chrome">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AutoFounder</h1>
            </div>
            <div className="flex items-center space-x-3">
                <button
                  onClick={handleEdit}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700`}
                >
                  <Edit3 className="w-4 h-4 text-current" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowScript(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Script</span>
                </button>
                <button
                  onClick={handleMatchInvestors}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Match with Investors</span>
                </button>
                <button
                  onClick={startPresent}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  <Eye className="w-4 h-4 text-current" />
                  <span>Present</span>
                </button>
                <button
                  onClick={handleDownload}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isProUser ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!isProUser && <Lock className="w-4 h-4 text-current" />}
                  <Download className="w-4 h-4 text-current" />
                  <span>{preparing ? 'Preparing...' : 'Download'}</span>
                </button>
              {!isProUser && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Crown className="w-4 h-4 text-current" />
                  <span>Upgrade</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slide Thumbnails */}
          <div className="lg:col-span-1 sidebar">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slides</h3>
            <div className="space-y-3">
              {slides.map((slideItem, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    index === currentSlide
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {index + 1}. {(slideItem as any).title || (slideItem as any).heading || `Slide ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    content
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Slide Display */}
          <div className="lg:col-span-3">
            <div className="relative">
              {/* Slide Container - stageRef enables fullscreen presentation */}
              <div ref={stageRef} className={presenting ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : ''}>
                <SlideFrame
                  format={slideFormat}
                  mode={presenting ? 'fit' : mode}
                  className={`mx-auto bg-white rounded-xl shadow-lg border border-gray-200 ${presenting ? 'max-w-[90vw] max-h-[90vh]' : ''}`}
                >
                  {/* Watermarks for free users */}
                  {!isProUser && (
                    <>
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-20 text-white px-2 py-1 rounded text-sm font-medium">
                          PREVIEW
                        </div>
                        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-20 text-white px-2 py-1 rounded text-sm font-medium">
                          AUTOFOUNDER
                        </div>
                        <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-20 text-white px-2 py-1 rounded text-sm font-medium">
                          UPGRADE TO REMOVE
                        </div>
                        <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-20 text-white px-2 py-1 rounded text-sm font-medium">
                          WATERMARKS
                        </div>
                      </div>
                    </>
                  )}

                  {/* Slide Content - themed rendering: apply background when no slide image present */}
                  <div className="h-full p-12 flex flex-col justify-center">
                    {currentSlideData && (
                      <article className="h-full w-full rounded-2xl p-6 shadow border relative overflow-hidden">
                        {/* background layer (only when no foreground image) */}
                        {!imageUrlForCurrent && currentBgUrl && (
                          <div className="absolute inset-0">
                            <div
                              style={{ backgroundImage: `url(${currentBgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                              className="absolute inset-0"
                            />
                            {/* scrim: stronger on the left where text sits */}
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.6)_0%,rgba(0,0,0,.2)_45%,rgba(0,0,0,0)_70%)] pointer-events-none" />
                          </div>
                        )}

                        <div className={`relative p-6 ${toneClass} drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]`} style={{ color: toneHex }}>
                        {/* Cover slide: centered layout */}
                        {currentSlide === 0 ? (
                          <div className="h-full w-full flex flex-col items-center justify-center text-center px-8">
                            {/* If an explicit image exists, show it above the title */}
                            {((currentSlideData as any).imageUrl || (currentSlideData as any).image) && (
                              <div className="mb-6">
                                <img
                                  src={(currentSlideData as any).imageUrl || (currentSlideData as any).image}
                                  alt={(currentSlideData as any).title || ''}
                                  className="max-h-36 object-contain rounded mx-auto"
                                />
                              </div>
                            )}

                            <h1 className={`text-5xl font-extrabold leading-tight mb-4 ${toneClass}`}>
                              {(currentSlideData as any).title || (currentSlideData as any).heading || `Slide ${currentSlide + 1}`}
                            </h1>
                            <p className={`text-xl max-w-2xl ${toneClass} opacity-90`}>
                              {Array.isArray((currentSlideData as any).bullets) ? ((currentSlideData as any).bullets[0] || '') : ''}
                            </p>
                          </div>
                        ) : (
                          <div>
                            {/* If a slide image is provided, show it and don't treat it as background */}
                            {((currentSlideData as any).imageUrl || (currentSlideData as any).image) ? (
                              <div className="mb-6 text-center">
                                <img
                                  src={(currentSlideData as any).imageUrl || (currentSlideData as any).image}
                                  alt={(currentSlideData as any).title || ''}
                                  className="max-h-40 object-contain rounded mx-auto"
                                />
                              </div>
                            ) : null}

                            {/* Title uses the theme text color */}
                            <h1 className={`text-4xl font-bold mb-6 ${toneClass}`}>
                              {(currentSlideData as any).title || (currentSlideData as any).heading || `Slide ${currentSlide + 1}`}
                            </h1>

                            {/* Bullets - use themed text color */}
                            {Array.isArray((currentSlideData as any).bullets) && (
                              <ul className="space-y-4 list-disc marker:text-current">
                                {(currentSlideData as any).bullets.map((bullet: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <div className="w-2 h-2 rounded-full mt-2 mr-4 flex-shrink-0 bg-current" />
                                    <span className="text-lg">{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                        </div>
                      </article>
                    )}
                  </div>

                  {blackout && <div className="absolute inset-0 bg-black" />}
                </SlideFrame>

                {presenting && (
                  <div className="absolute top-3 right-4 flex items-center gap-2 text-white/85">
                    <span className="text-xs hidden md:block">Esc to exit • ←/→ to navigate • B to black</span>
                    <button onClick={stopPresent} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20">Exit</button>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-current" />
                  <span>Previous</span>
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Slide {currentSlide + 1} of {slides.length}
                  </span>
                </div>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === slides.length - 1}
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 text-current" />
                </button>
              </div>
            </div>

            {/* Upgrade Prompt for Free Users */}
            {!isProUser && (
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Unlock Full Editing Power
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Remove watermarks, edit content, download your presentation, and access premium templates.
                    </p>
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upgrade to Pro
              </h2>
              <p className="text-gray-600 mb-6">
                Get unlimited access to editing, downloading, and premium features.
              </p>
              <div className="space-y-4 text-left mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Remove all watermarks</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Edit and customize content</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Download in multiple formats</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="text-gray-700">Access premium templates</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Later
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Script Modal */}
      {showScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Presentation Script</h2>
                <button
                  onClick={() => setShowScript(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(deck.meta as any)?.presentationScript ? (
                <div className="space-y-6">
                  {(deck.meta as any).presentationScript.map((section: any, index: number) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {index + 1}. {section.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Duration: {section.duration}
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-800 whitespace-pre-wrap">{section.script}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M7 7h6v6H7z" />
                    <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M5 3h10l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Script Available</h3>
                  <p className="text-gray-600">
                    The presentation script wasn't generated for this deck. Try regenerating the deck to create a script.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowScript(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {(deck.meta as any)?.presentationScript && (
                  <button
                    onClick={() => {
                      const scriptText = (deck.meta as any).presentationScript
                        .map((section: any, index: number) => 
                          `${index + 1}. ${section.title}\nDuration: ${section.duration}\n\n${section.script}\n\n---\n`
                        )
                        .join('\n');
                      navigator.clipboard.writeText(scriptText);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Copy Script
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}