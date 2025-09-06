import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit3, Crown, Lock, Eye } from 'lucide-react';
import type { Deck } from '../../utils/generateDeckJSON';

interface PPTViewerProps {
  deck?: Deck;
  isProUser?: boolean;
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

export default function PPTViewer({ deck, isProUser = false }: PPTViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [preparing, setPreparing] = useState(false);

  // Debug: Log what we received
  console.log('🔍 PPTViewer received deck:', deck);
  console.log('🔍 Deck type:', typeof deck);
  console.log('🔍 Deck keys:', deck ? Object.keys(deck) : 'No deck');

  // Safety check - if no deck
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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleEdit = () => {
    if (!isProUser) {
      setShowUpgrade(true);
      return;
    }
    setIsEditing(!isEditing);
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

      for (const s of deck.slides) {
        const slide = pres.addSlide();
        const heading = (s as any).title ?? (s as any).heading ?? '';
        if (heading) {
          slide.addText(heading, { x: 0.5, y: 0.4, w: '90%', h: 0.8, fontSize: 26, bold: true });
        }

        const bullets = Array.isArray((s as any).bullets) ? (s as any).bullets : [];
        if (bullets.length) {
          slide.addText(bullets.join('\n'), { x: 0.5, y: 1.4, w: '90%', h: 3.5, fontSize: 14 });
        }

        const imageUrl = (s as any).imageUrl ?? (s as any).image;
        if (imageUrl) {
          const dataUrl = await fetchImageAsDataUrl(imageUrl);
          if (dataUrl) {
            slide.addImage({ data: dataUrl, x: 6.0, y: 1.0, w: 3.0 });
          }
        }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">AutoFounder</h1>
            </div>
            <div className="flex items-center space-x-3">
              {!isProUser && (
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Eye className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Preview Mode</span>
                </div>
              )}
              <button
                onClick={handleEdit}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isProUser ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!isProUser && <Lock className="w-4 h-4" />}
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDownload}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isProUser ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!isProUser && <Lock className="w-4 h-4" />}
                <Download className="w-4 h-4" />
                <span>{preparing ? 'Preparing...' : 'Download'}</span>
              </button>
              {!isProUser && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <Crown className="w-4 h-4" />
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
          <div className="lg:col-span-1">
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
              {/* Slide Container */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 aspect-video relative overflow-hidden">
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

                {/* Slide Content - Using EXACT same rendering as original DeckViewer */}
                <div className="h-full p-12 flex flex-col justify-center">
                  {currentSlideData && (
                    <div>
                      {/* Show image if available - EXACT same logic as original */}
                      {((currentSlideData as any).imageUrl || (currentSlideData as any).image) && (
                        <div className="mb-6 text-center">
                          <img 
                            src={(currentSlideData as any).imageUrl || (currentSlideData as any).image} 
                            alt={(currentSlideData as any).title || ''} 
                            className="max-h-40 object-contain rounded mx-auto" 
                          />
                        </div>
                      )}
                      
                      {/* Title - EXACT same logic as original */}
                      <h1 className="text-4xl font-bold text-gray-900 mb-6">
                        {(currentSlideData as any).title || (currentSlideData as any).heading || `Slide ${currentSlide + 1}`}
                      </h1>
                      
                      {/* Bullets - EXACT same logic as original */}
                      {Array.isArray((currentSlideData as any).bullets) && (
                        <ul className="space-y-4">
                          {(currentSlideData as any).bullets.map((bullet: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                              <span className="text-lg text-gray-700">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
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
                  <ChevronRight className="w-4 h-4" />
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
    </div>
  );
}