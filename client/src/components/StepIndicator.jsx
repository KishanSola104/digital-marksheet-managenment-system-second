import React from 'react';

const STEPS = [
  { number: 1, title: 'School Info', subtitle: 'Basic school details' },
  { number: 2, title: 'Contact Persons', subtitle: 'Min 2, Max 3 persons' },
  { number: 3, title: 'Admin Details', subtitle: 'Min 1, Max 3 admins' },
  { number: 4, title: 'Review & Submit', subtitle: 'Verify & register' }
];

export default function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && step.number < currentStep;

          return (
            <React.Fragment key={step.number}>
              {/* Step Circle & Label */}
              <div
                onClick={() => isClickable && onStepClick(step.number)}
                className={`flex flex-col items-center text-center cursor-${isClickable ? 'pointer' : 'default'} group`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-brand-700'
                        : isCompleted
                        ? 'text-gray-800'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-gray-400 hidden sm:block">{step.subtitle}</p>
                </div>
              </div>

              {/* Connecting line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 -mt-5 transition ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
