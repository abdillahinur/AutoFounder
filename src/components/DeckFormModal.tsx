"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Edit2, Plus, Minus, MoreVertical, RotateCcw, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/Dialog';
import { useToast } from './ui/Toast';

export type DeckFormPayload = {
  startupName: string;
  oneLiner: string;
  problem: string;
  solution: string;
  customer: string;
  traction: string;
  ask: string;
  model: string;
  market: string;
  competition: string;
  team: string;
  roadmap: string;
  contact: string;
};

interface DeckFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate?: (payload: DeckFormPayload) => Promise<void> | void;
}


const requiredQuestions = [
  {
    id: "startupName" as keyof DeckFormPayload,
    label: "what's your startup called?",
    cleanLabel: "Startup Name",
    helper: "e.g., Kova",
    type: "input" as const,
    maxLength: 40,
  },
  {
    id: "oneLiner" as keyof DeckFormPayload,
    label: "give us your startup in one sentence",
    cleanLabel: "One-Line Pitch",
    helper: "e.g., the fastest way from idea to investor inbox",
    type: "textarea" as const,
    rows: 2,
    maxLength: 120,
  },
  {
    id: "problem" as keyof DeckFormPayload,
    label: "what problem are you solving?",
    cleanLabel: "Problem",
    type: "textarea" as const,
    rows: 4,
    maxLength: 280,
  },
  {
    id: "solution" as keyof DeckFormPayload,
    label: "how do you solve it?",
    cleanLabel: "Solution",
    type: "textarea" as const,
    rows: 4,
    maxLength: 280,
  },
  {
    id: "customer" as keyof DeckFormPayload,
    label: "who is this for?",
    cleanLabel: "Target Customer",
    helper: "e.g., pre-seed founders, accelerators",
    type: "input" as const,
    maxLength: 80,
  },
  {
    id: "traction" as keyof DeckFormPayload,
    label: "any traction yet? (metrics or n/a)",
    cleanLabel: "Traction",
    type: "textarea" as const,
    rows: 3,
    maxLength: 200,
  },
  {
    id: "ask" as keyof DeckFormPayload,
    label: "what are you raising & what for?",
    cleanLabel: "Funding Ask",
    helper: "e.g., $500k for 12 months: build, GTM, hires",
    type: "input" as const,
    maxLength: 140,
  },
];

const optionalQuestions = [
  {
    id: "model" as keyof DeckFormPayload,
    label: "Business model",
    cleanLabel: "Business Model",
    type: "textarea" as const,
    rows: 3,
    maxLength: 200,
  },
  {
    id: "market" as keyof DeckFormPayload,
    label: "Market size",
    cleanLabel: "Market Size",
    helper: "tam/sam/som or rough guess",
    type: "input" as const,
    maxLength: 120,
  },
  {
    id: "competition" as keyof DeckFormPayload,
    label: "Competition",
    cleanLabel: "Competition",
    type: "textarea" as const,
    rows: 3,
    maxLength: 240,
  },
  {
    id: "team" as keyof DeckFormPayload,
    label: "Team",
    cleanLabel: "Team",
    type: "textarea" as const,
    rows: 3,
    maxLength: 240,
  },
  {
    id: "roadmap" as keyof DeckFormPayload,
    label: "Vision / milestones",
    cleanLabel: "Roadmap",
    type: "textarea" as const,
    rows: 3,
    maxLength: 240,
  },
  {
    id: "contact" as keyof DeckFormPayload,
    label: "Contact",
    cleanLabel: "Contact",
    helper: "email or website",
    type: "input" as const,
    maxLength: 120,
  },
];

const initialFormData: DeckFormPayload = {
  startupName: "",
  oneLiner: "",
  problem: "",
  solution: "",
  customer: "",
  traction: "",
  ask: "",
  model: "",
  market: "",
  competition: "",
  team: "",
  roadmap: "",
  contact: "",
};

export default function DeckFormModal({ open, onOpenChange, onGenerate }: DeckFormModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DeckFormPayload>(initialFormData);
  const [showOptional, setShowOptional] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { addToast, removeToast } = useToast();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const totalSteps = requiredQuestions.length + 1; // +1 for review step
  const isReviewStep = currentStep === requiredQuestions.length;


  useEffect(() => {
    if (inputRef.current && !isReviewStep) {
      inputRef.current.focus();
    }
  }, [currentStep, isReviewStep]);


  const handleInputChange = (field: keyof DeckFormPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (isReviewStep) {
      handleSubmit();
    } else if (currentStep < totalSteps - 1) {
      // Check if current question is answered
      const currentQuestion = requiredQuestions[currentStep];
      if (!formData[currentQuestion.id] || formData[currentQuestion.id].trim() === '') {
        addToast('Please answer this question before continuing', 'error');
        return;
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    
    // Show "Generating..." toast immediately
    const generatingToastId = addToast({
      type: 'info',
      title: 'Deck Generating...',
      description: 'Creating your pitch deck with AI enhancement...',
      duration: 0 // Don't auto-dismiss - we'll dismiss it manually
    });
    
    try {
      const { generatePitchDeckPPTX } = await import("../../utils/generatePitchDeckPPTX");
      console.log("Generating deck...", formData);
      await generatePitchDeckPPTX(formData, "PitchDeck.pptx");
      
      // Remove the "Generating..." toast and show success
      removeToast(generatingToastId);
      addToast({
        type: 'success',
        title: 'Deck Generated!',
        description: 'Your pitch deck is downloading...',
        duration: 3000 // Auto-dismiss after 3 seconds
      });
      
      if (onGenerate) {
        await onGenerate(formData);
      }
      // Close modal after a short delay to let toast show
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } catch (error) {
      console.error('Error generating deck:', error);
      
      // Remove the "Generating..." toast and show error
      removeToast(generatingToastId);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        description: 'There was an error creating your deck. Please try again.'
      });
      setIsSubmitted(false); // Reset immediately on error
      return;
    }
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setShowOptional(false);
    setShowResetConfirm(false);
    setShowMenu(false);
    addToast({
      type: 'success',
      title: 'Form reset',
      description: 'All data has been cleared'
    });
  };


  const handleClose = () => {
    onOpenChange(false);
  };

  const jumpToStep = (stepIndex: number) => {
    // Only allow jumping to completed steps or the next step
    if (stepIndex <= currentStep || (stepIndex === currentStep + 1 && formData[requiredQuestions[currentStep].id]?.trim())) {
      setCurrentStep(stepIndex);
    } else {
      addToast({
        type: 'error',
        title: 'Cannot Skip Questions',
        description: 'Please complete the current question before jumping ahead'
      });
    }
  };

  // Keyboard event handler - must be after function definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [currentStep, formData, open, handleNext, handleClose]);

  const currentQuestion = requiredQuestions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col bg-white">
          {/* Header with branding and controls */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AutoFounder</span>
                <p className="text-sm text-gray-600">Create your pitch deck in 60 seconds</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-100 rounded-xl shadow-lg py-2 z-10 min-w-[160px]">
                    <button
                      onClick={() => {
                        setShowResetConfirm(true);
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 w-full transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset form</span>
                    </button>
                  </div>
                )}
              </div>
              <DialogClose onClick={handleClose}>
                <X className="w-5 h-5" />
              </DialogClose>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
                Step {isReviewStep ? requiredQuestions.length + 1 : currentStep + 1} of {totalSteps}
              </div>
              <div className="text-sm text-gray-500 font-medium">{Math.round(progress)}%</div>
            </div>
            
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="w-full">
              <AnimatePresence mode="wait">
                {!isReviewStep ? (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-6"
                  >
                    {/* Question buttons on top */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {requiredQuestions.map((question, index) => {
                        const isCompleted = index < currentStep && formData[question.id]?.trim();
                        const isCurrent = index === currentStep;
                        const isLocked = index > currentStep && !formData[requiredQuestions[currentStep].id]?.trim();
                        
                        return (
                          <button
                            key={question.id}
                            onClick={() => jumpToStep(index)}
                            disabled={isLocked}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isCurrent
                                ? "bg-blue-600 text-white"
                                : isCompleted
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : isLocked
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {question.cleanLabel}
                          </button>
                        );
                      })}
                    </div>

                    {/* Question header */}
                    <div className="space-y-3">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                        {currentQuestion.label}
                      </h2>

                      {currentQuestion.helper && <p className="text-sm text-gray-600">{currentQuestion.helper}</p>}
                    </div>

                    {/* Input field */}
                    <div className="space-y-3">
                      {currentQuestion.type === "input" ? (
                        <input
                          ref={inputRef as React.RefObject<HTMLInputElement>}
                          id={currentQuestion.id}
                          value={formData[currentQuestion.id]}
                          onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                          maxLength={currentQuestion.maxLength}
                          className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white text-gray-900 text-base p-4 h-auto rounded-xl transition-all duration-200"
                          placeholder="Type your answer here..."
                        />
                      ) : (
                        <textarea
                          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                          id={currentQuestion.id}
                          value={formData[currentQuestion.id]}
                          onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
                          rows={currentQuestion.rows}
                          maxLength={currentQuestion.maxLength}
                          className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white text-gray-900 text-base p-4 resize-none rounded-xl transition-all duration-200"
                          placeholder="Type your answer here..."
                        />
                      )}

                      {/* Character count */}
                      <div className="flex justify-end">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg font-mono">
                          {formData[currentQuestion.id].length}/{currentQuestion.maxLength}
                        </span>
                      </div>
                    </div>

                    {/* Optional questions section */}
                    {currentStep === requiredQuestions.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-16 pt-8 border-t border-gray-200"
                      >
                        <button
                          onClick={() => setShowOptional(!showOptional)}
                          className="border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 rounded-xl p-6 w-full text-left transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">Optional Details</h3>
                              <p className="text-sm text-gray-600">Add more context to strengthen your pitch</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                              {showOptional ? (
                                <Minus className="w-5 h-5 text-gray-600" />
                              ) : (
                                <Plus className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {showOptional && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 space-y-6"
                            >
                              {optionalQuestions.map((question) => (
                                <div key={question.id} className="space-y-3">
                                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg">
                                    <span className="text-xs font-semibold">{question.cleanLabel}</span>
                                  </div>

                                  <label htmlFor={question.id} className="text-lg font-semibold text-gray-900">
                                    {question.label}
                                  </label>

                                  {question.helper && <p className="text-sm text-gray-600">{question.helper}</p>}

                                  {question.type === "input" ? (
                                    <input
                                      id={question.id}
                                      value={formData[question.id]}
                                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                                      maxLength={question.maxLength}
                                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white text-gray-900 p-4 rounded-lg"
                                    />
                                  ) : (
                                    <textarea
                                      id={question.id}
                                      value={formData[question.id]}
                                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                                      rows={question.rows}
                                      maxLength={question.maxLength}
                                      className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0 bg-white text-gray-900 p-4 resize-none rounded-lg"
                                    />
                                  )}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  /* Review Step */
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-12"
                  >
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                        <span className="text-sm font-semibold">Final Review</span>
                      </div>

                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Ready to generate your pitch deck?</h2>

                      <p className="text-lg text-gray-600">Review your answers below. Click any section to edit.</p>
                    </div>

                    {/* Required Answers */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-600 pb-2">
                        Required Sections
                      </h3>
                      <div className="grid gap-4">
                        {requiredQuestions.map((question, index) => (
                          <button
                            key={question.id}
                            onClick={() => jumpToStep(index)}
                            className="border-2 border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50 rounded-xl text-left p-6 transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded">
                                    {index + 1}
                                  </span>
                                  <h4 className="text-sm font-semibold text-gray-900">{question.cleanLabel}</h4>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {formData[question.id] || "Not answered"}
                                </p>
                              </div>
                              <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Optional Answers */}
                    {optionalQuestions.some((q) => formData[q.id]) && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-300 pb-2">
                          Optional Sections
                        </h3>
                        <div className="grid gap-4">
                          {optionalQuestions
                            .filter((question) => formData[question.id])
                            .map((question) => (
                              <div key={question.id} className="border-2 border-gray-200 bg-white rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="bg-gray-500 text-white px-2 py-1 text-xs font-bold rounded">+</span>
                                  <h4 className="text-sm font-semibold text-gray-900">{question.cleanLabel}</h4>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{formData[question.id]}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 text-lg font-semibold disabled:opacity-50 rounded-xl transition-all duration-200 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitted || (!isReviewStep && (!formData[currentQuestion.id] || formData[currentQuestion.id].trim() === ''))}
                  className={`px-6 py-3 text-lg font-semibold rounded-xl border-0 transition-all duration-200 flex items-center ${
                    isSubmitted
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : !isReviewStep && (!formData[currentQuestion.id] || formData[currentQuestion.id].trim() === '')
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isReviewStep ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      {isSubmitted ? 'Generating...' : 'Generate Deck'}
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success notification */}
        <AnimatePresence>
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="fixed bottom-8 right-8 bg-green-600 text-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6" />
                <span className="text-lg font-bold">Deck Generated!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset Confirmation Modal */}
        <AnimatePresence>
          {showResetConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowResetConfirm(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.3 }}
                className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-gray-100 max-w-md w-full mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RotateCcw className="w-6 h-6 text-red-600" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Reset Form?
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    This will clear all your answers and start over. This action cannot be undone.
                  </p>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
