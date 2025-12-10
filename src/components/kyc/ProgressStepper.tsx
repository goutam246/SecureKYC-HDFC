import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export const ProgressStepper = ({ steps, currentStep, completedSteps }: ProgressStepperProps) => {
  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'progress-step',
                    isCompleted && 'progress-step-completed',
                    isCurrent && 'progress-step-active',
                    isPending && 'progress-step-pending'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-4 mt-[-40px]',
                    isCompleted ? 'bg-success' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-primary">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {steps.find(s => s.id === currentStep)?.title}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            
            return (
              <div
                key={step.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  isCompleted ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-border'
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
