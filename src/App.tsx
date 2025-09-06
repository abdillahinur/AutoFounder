import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Users, 
  Mail, 
  Eye, 
  CheckCircle, 
  Star,
  Lightbulb,
  FileText,
  Send,
  Target,
  Bell,
  Sparkles,
  Rocket,
  Play
} from 'lucide-react';
import DeckFormModal, { DeckFormPayload } from './components/DeckFormModal';
import { generateDeckJSON } from '../utils/generateDeckJSON';
import { ToastProvider } from './components/ui/Toast';

function App() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleGenerate = async (payload: DeckFormPayload) => {
    // Create a deterministic deck JSON (client-side) and persist to sessionStorage for quick viewer demo
    try {
      const deck = generateDeckJSON(payload as Record<string, string>);
      const key = `deck:${deck.id}`;
      try {
        sessionStorage.setItem(key, JSON.stringify(deck));
      } catch (e) {
        console.warn('Failed to write deck to sessionStorage', e);
      }
      // Open the viewer in a new tab using a hash route
      window.open(`${window.location.origin}/#deck=${deck.id}`, '_blank');
      console.log('Generated deck and opened viewer for', deck.id);
    } catch (err) {
      console.error('Error generating deck JSON', err);
    }
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-gray-900" style={{ colorScheme: 'light' }}>
      {/* Hero Section */}
      <section className="relative bg-white overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AutoFounder</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                How it Works
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('cta')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`w-6 h-0.5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  How it Works
                </button>
                <button 
                  onClick={() => scrollToSection('pricing')}
                  className="text-left text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => scrollToSection('cta')}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm text-center"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Launched at Hackathon 3.0</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                from <span className="text-blue-600">idea</span> to investor inbox in <span className="text-blue-600">60 seconds</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-lg">
                autofounder creates your pitch deck and sends it to investors instantly.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  data-testid="cta-generate"
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Generate Your Deck</span>
                </button>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>See How It Works</span>
                </button>
              </div>
            </div>

            {/* Right Column - Animated Mockup */}
            <div className="relative space-y-8">
              {/* Input Box */}
              <div
                className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-1000 ${
                  isAnimating ? 'shadow-lg border-blue-200 transform -translate-y-1' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-yellow-100 rounded-md flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Your Idea</span>
                </div>
                <div className={`transition-all duration-1000 ${isAnimating ? 'opacity-100' : 'opacity-70'}`}>
                  <p className="text-gray-900 text-sm">
                    AI-powered fitness app that creates personalized workout plans based on your schedule and equipment...
                  </p>
                </div>
              </div>

              {/* Arrow Animation */}
              <div className="flex justify-center">
                <div className={`transition-all duration-500 ${isAnimating ? 'translate-y-1 opacity-100' : 'opacity-40'}`}>
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>

              {/* Deck Preview */}
              <div
                className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm transition-all duration-1000 delay-500 ${
                  isAnimating ? 'shadow-lg border-blue-200 transform -translate-y-1' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Generated Deck</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded border h-12 flex items-center justify-center text-xs text-gray-500 font-medium"
                    >
                      Slide {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow Animation */}
              <div className="flex justify-center">
                <div
                  className={`transition-all duration-500 delay-1000 ${
                    isAnimating ? 'translate-y-1 opacity-100' : 'opacity-40'
                  }`}
                >
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600" />
              </div>

              {/* Email Sent */}
              <div
                className={`bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm transition-all duration-1000 delay-1500 ${
                  isAnimating ? 'shadow-lg border-green-300 transform -translate-y-1' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                    <Send className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-700">Sent to Investors</span>
                </div>
                <div className="text-green-900">
                  <p className="text-sm">✓ 12 investors contacted</p>
                  <p className="text-sm">✓ Personalized intro emails sent</p>
                </div>
              </div>
            </div>
            {/* End Right Column */}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 bg-gray-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-600 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            founders spend <span className="text-red-600">weeks</span> making decks and chasing intros.
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8 sm:mb-12">
            autofounder does it in <span className="text-green-600 font-semibold">seconds</span>.
          </p>

          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto">
            {/* Before */}
            <div className="bg-white border border-red-200 rounded-xl p-6 sm:p-10 relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✗
              </div>
              <h3 className="text-red-600 font-bold mb-8 text-xl">The Old Way</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-gray-700">PowerPoint hell for weeks</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-gray-700">Awkward networking events</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-gray-700">Cold LinkedIn messages</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span className="text-gray-700 font-semibold">Months of rejection</span>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-white border border-green-200 rounded-xl p-6 sm:p-10 relative transform -rotate-1 hover:rotate-0 transition-transform duration-300 shadow-lg">
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                ✓
              </div>
              <h3 className="text-green-600 font-bold mb-8 text-xl">The AutoFounder Way</h3>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-700">AI-generated pitch deck</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-700">Curated investor database</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-700">Personalized intro emails</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                  <span className="text-gray-700 font-semibold">Done in 60 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-gray-600">Three steps to investor inbox</p>
          </div>

          <div className="relative">
            {/* Connecting line (note: left-1/6/right-1/6 require custom config; safe to keep or adjust) */}
            <div className="hidden lg:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-yellow-200 via-blue-200 to-green-200" />

            <div className="grid md:grid-cols-3 gap-12 lg:gap-16 relative">
              {[
                {
                  step: '01',
                  icon: Lightbulb,
                  title: 'Input Your Idea',
                  description:
                    'Describe your startup in plain English. Our AI understands context, market, and potential.',
                  color: 'yellow'
                },
                {
                  step: '02',
                  icon: FileText,
                  title: 'Deck Generated',
                  description:
                    'Get a founder-friendly narrative with market analysis, business model, and compelling visuals.',
                  color: 'blue'
                },
                {
                  step: '03',
                  icon: Send,
                  title: 'Sent to Investors',
                  description:
                    'We match your startup to relevant investors and send personalized intro emails instantly.',
                  color: 'green'
                }
              ].map((item, index) => (
                <div key={index} className="relative text-center group">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 relative z-10 shadow-lg ${
                      item.color === 'yellow'
                        ? 'bg-yellow-100'
                        : item.color === 'blue'
                        ? 'bg-blue-100'
                        : 'bg-green-100'
                    }`}
                  >
                    <item.icon
                      className={`w-9 h-9 ${
                        item.color === 'yellow'
                          ? 'text-yellow-600'
                          : item.color === 'blue'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    />
                  </div>

                  <div className="text-xs font-bold text-gray-400 mb-3 tracking-wider">{item.step}</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Killer Features */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Killer Features</h2>
            <p className="text-lg sm:text-xl text-gray-600">Everything you need to get funded</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: FileText,
                title: 'Deck Builder with Founder-Friendly Narrative',
                description:
                  'AI creates compelling stories that investors actually want to read, not corporate jargon.',
                color: 'blue'
              },
              {
                icon: Target,
                title: 'Investor Enrichment',
                description:
                  'We match your startup to the right investors based on stage, industry, and investment history.',
                color: 'purple'
              },
              {
                icon: Mail,
                title: 'Personalized Intro Emails',
                description:
                  "Every email is customized to the investor's portfolio and interests. No generic templates.",
                color: 'green'
              },
              {
                icon: Eye,
                title: "Real-time 'Deck Viewed' Notifications",
                description:
                  'Get instant alerts when investors open your deck. Perfect timing for follow-ups.',
                color: 'orange'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-8 border border-gray-200 hover:shadow-sm transition-shadow duration-200 group"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-200 ${
                    feature.color === 'blue'
                      ? 'bg-blue-100'
                      : feature.color === 'purple'
                      ? 'bg-purple-100'
                      : feature.color === 'green'
                      ? 'bg-green-100'
                      : 'bg-orange-100'
                  }`}
                >
                  <feature.icon
                    className={`w-6 h-6 ${
                      feature.color === 'blue'
                        ? 'text-blue-600'
                        : feature.color === 'purple'
                        ? 'text-purple-600'
                        : feature.color === 'green'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-12">
            <Rocket className="w-4 h-4" />
            <span>Launched at Hackathon 3.0</span>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Built by founders who know the fundraising grind
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
              We've been through the PowerPoint hell, the awkward networking events, and the months of rejection. 
              That's why we built AutoFounder - to skip straight to what actually matters: getting in front of the right investors.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">60s</div>
                <div className="text-gray-600">Average deck generation time</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Investors in our database</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">24h</div>
                <div className="text-gray-600">Typical first response time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Simple Pricing</h2>
            <p className="text-lg sm:text-xl text-gray-600">Start free, scale when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                description: 'Perfect for testing',
                features: ['1 deck generation', 'Watermarked output', 'Basic templates', 'Community support'],
                cta: 'Get Started',
                popular: false
              },
              {
                name: 'Pro',
                price: '$29',
                unit: '/deck',
                description: 'For serious founders',
                features: ['Unlimited deck edits', 'No watermark', 'Premium templates', 'Investor database access'],
                cta: 'Generate Deck',
                popular: true
              },
              {
                name: 'Growth',
                price: '$99',
                unit: '/mo',
                description: 'For scaling startups',
                features: ['Everything in Pro', 'Investor outreach', 'View tracking', 'Priority support'],
                cta: 'Start Growing',
                popular: false
              }
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-lg p-8 border ${
                  plan.popular ? 'bg-blue-600 text-white border-blue-600 scale-105' : 'bg-white text-gray-900 border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-medium">Most Popular</div>
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-end mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.unit && <span className="text-lg ml-1">{plan.unit}</span>}
                </div>
                <p className={`${plan.popular ? 'text-blue-100' : 'text-gray-600'} mb-8`}>{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <CheckCircle className={`w-4 h-4 ${plan.popular ? 'text-white' : 'text-green-500'}`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-md font-medium transition-all duration-200 ${
                    plan.popular ? 'bg-white text-blue-600 hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => scrollToSection('cta')}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="py-16 sm:py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
            stop pitching slides.<br />start pitching <span className="underline decoration-blue-400">investors</span>.
          </h2>

          <button 
            data-testid="cta-generate"
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-1 flex items-center space-x-3 mx-auto shadow-lg"
          >
            <Rocket className="w-5 h-5" />
            <span>Generate Your Deck Now</span>
          </button>

          <p className="text-gray-400 mt-4 sm:mt-6 text-sm sm:text-base">Join hundreds of founders who've raised millions</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 sm:py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">AutoFounder</span>
            </div>

            <div className="flex space-x-6 sm:space-x-8">
              <button className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Privacy</button>
              <button className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Terms</button>
              <button className="text-gray-500 hover:text-gray-900 transition-colors text-sm">Contact</button>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-500">
            <p className="text-sm">&copy; 2025 AutoFounder. Built for founders, by founders.</p>
          </div>
        </div>
      </footer>

      {/* Deck Form Modal */}
      <DeckFormModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        onGenerate={handleGenerate}
      />
      </div>
    </ToastProvider>
  );
}

export default App;
