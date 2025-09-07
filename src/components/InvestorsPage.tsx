import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { decodeDeckFromUrl } from '../hooks/useGenerateDeck';
import type { Deck as HookDeck } from '../hooks/useGenerateDeck';

interface InvestorMatch {
  name: string;
  type: string;
  contact: string;
  reason: string;
  outreachGuidance: string;
}

export default function InvestorsPage() {
  const [deck, setDeck] = useState<HookDeck | null>(null);
  const [investorMatches, setInvestorMatches] = useState<InvestorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get deck data from URL hash
    const hash = window.location.hash;
    const investorsMatch = hash.match(/#investors=(.+)/);
    
    if (investorsMatch) {
      try {
        const deckData = decodeDeckFromUrl(investorsMatch[1]);
        setDeck(deckData);
        findInvestors(deckData);
      } catch (err) {
        setError('Invalid deck data');
        setLoading(false);
      }
    } else {
      setError('No deck data found');
      setLoading(false);
    }
  }, []);

  const findInvestors = async (deck: HookDeck) => {
    try {
      const { findMatchingInvestors } = await import('../hooks/useGenerateDeck');
      
      const startupName = (deck.meta as any)?.startupName || (deck.meta as any)?.oneLiner || 'Your Startup';
      
      // Debug: Log what we're getting from the deck
      console.log('🔍 Deck structure:', deck);
      console.log('🔍 Deck metadata:', deck.meta);
      console.log('🔍 Deck slides:', deck.slides);
      
      // Extract comprehensive startup details with better fallbacks
      const problemSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('problem'));
      const solutionSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('solution'));
      const marketSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('market'));
      const modelSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('model'));
      const tractionSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('traction'));
      const teamSlide = deck.slides?.find(s => s.heading?.toLowerCase().includes('team'));
      
      console.log('🔍 Problem slide:', problemSlide);
      console.log('🔍 Solution slide:', solutionSlide);
      
      const enhancedInput = {
        startupName: startupName,
        problem: problemSlide?.bullets?.join(' ') || problemSlide?.heading || '',
        solution: solutionSlide?.bullets?.join(' ') || solutionSlide?.heading || '',
        market: marketSlide?.bullets?.join(' ') || marketSlide?.heading || '',
        model: modelSlide?.bullets?.join(' ') || modelSlide?.heading || '',
        traction: tractionSlide?.bullets?.join(' ') || tractionSlide?.heading || '',
        team: teamSlide?.bullets?.join(' ') || teamSlide?.heading || '',
        oneLiner: (deck.meta as any)?.oneLiner || '',
      };
      
      // If specific slides not found, try to extract from any slides
      if (!problemSlide && deck.slides && deck.slides.length > 0) {
        console.log('🔍 No problem slide found, trying alternative extraction');
        // Try to get content from first few slides as fallback
        const firstSlide = deck.slides[0];
        const secondSlide = deck.slides[1];
        const thirdSlide = deck.slides[2];
        
        enhancedInput.problem = enhancedInput.problem || firstSlide?.bullets?.join(' ') || firstSlide?.heading || '';
        enhancedInput.solution = enhancedInput.solution || secondSlide?.bullets?.join(' ') || secondSlide?.heading || '';
        enhancedInput.market = enhancedInput.market || thirdSlide?.bullets?.join(' ') || thirdSlide?.heading || '';
      }
      
      console.log('🔍 Enhanced input:', enhancedInput);
      
      const matches = await findMatchingInvestors(startupName, enhancedInput);
      setInvestorMatches(matches);
    } catch (err) {
      setError('Failed to find investors. Please check your Gemini API key.');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Matching with Investors</h1>
          <p className="text-gray-600">
            Analyzing your startup details to find the best investor matches from our database of 120+ angels and VCs...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Match Investors</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.close()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Investor Matches</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Investor Matches for {(deck?.meta as any)?.startupName || (deck?.meta as any)?.oneLiner || 'Your Startup'}
          </h2>
          <p className="text-gray-600">
            Top {investorMatches.length} investor matches based on your startup details
          </p>
        </div>

        {investorMatches.length > 0 ? (
          <div className="space-y-6">
            {investorMatches.map((match, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{match.name}</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {match.type}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-6">{match.reason}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Outreach Guidance</h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 text-sm">{match.outreachGuidance}</p>
                    </div>
                    
                    {match.contact && match.contact.includes('@') && !match.contact.startsWith('@') && (
                      <div className="flex gap-3">
                        <a
                          href={`mailto:${match.contact}`}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          <span>📧</span>
                          <span>Send Email</span>
                        </a>
                      </div>
                    )}
                    
                    {!match.contact && (
                      <div className="text-sm text-gray-500">
                        Try reaching out through their VC firm or LinkedIn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
            <p className="text-gray-600">
              Unable to find investor matches. Please try again or check your Gemini API key.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
