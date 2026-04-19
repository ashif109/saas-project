"use client";

import React, { useState } from 'react';
import { 
  Building2, 
  Map, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Briefcase, 
  CalendarDays, 
  Clock, 
  CreditCard, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Academic Year', icon: CalendarDays, description: 'Define the duration of the new session' },
  { id: 2, title: 'Departments', icon: Building2, description: 'Setup branches/departments' },
  { id: 3, title: 'Courses & Subjects', icon: BookOpen, description: 'Curriculum definition' },
  { id: 4, title: 'Batches', icon: Users, description: 'Group students by year' },
  { id: 5, title: 'Students', icon: GraduationCap, description: 'Onboard and assign' },
  { id: 6, title: 'Faculty & Roles', icon: Briefcase, description: 'Staffing and permissions' },
  { id: 7, title: 'Assign Subjects', icon: Map, description: 'Map faculty to subjects' },
  { id: 8, title: 'Timetable', icon: Clock, description: 'Generate schedule' },
  { id: 9, title: 'Configure Fees', icon: CreditCard, description: 'Fee structure & installments' },
  { id: 10, title: 'Publish', icon: CheckCircle2, description: 'Go live' },
];

export default function AcademicSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // Assuming 1 is somehow done or active

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 10) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Session Setup</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Follow this guided workflow to completely configure your institution for the upcoming session.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Steps */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sticky top-24">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 px-2">Setup Progress</h3>
            
            <div className="space-y-1">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                const isPast = step.id < currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all relative ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Connecting line */}
                    {index !== steps.length - 1 && (
                      <div className={`absolute left-5 top-10 bottom-[-10px] w-[2px] z-0 ${
                         isPast ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`} />
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 font-bold text-sm ${
                      isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' :
                      isCompleted ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-400' :
                      'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isCompleted && !isActive ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                    </div>
                    
                    <div>
                      <p className={`text-sm font-semibold ${
                        isActive ? 'text-blue-700 dark:text-blue-400' : 
                        isCompleted ? 'text-slate-900 dark:text-white' : 
                        'text-slate-500 dark:text-slate-400'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-1 mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Body Context Area */}
        <div className="flex-1 flex flex-col min-h-[600px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-800/50">
               {React.createElement(steps[currentStep-1].icon, { className: "w-6 h-6" })}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Step {currentStep}: {steps[currentStep-1].title}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {steps[currentStep-1].description}. Ensure all details are accurate before proceeding to the next step.
            </p>
          </div>

          {/* Dynamic Step Content Area */}
          <div className="flex-1 p-8 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
            {/* Mock content representing the actual forms */}
            <div className="text-center space-y-4 w-full max-w-md">
               <div className="w-full h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-md animate-pulse" />
               <div className="w-3/4 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-md animate-pulse mx-auto" />
               <div className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed mt-8 flex items-center justify-center">
                  <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Form components will render here</p>
               </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex justify-between items-center">
             <button 
                onClick={handlePrev}
                disabled={currentStep === 1}
                className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
               <ChevronLeft className="w-4 h-4" /> Previous
             </button>

             <div className="flex gap-3">
                <button className="px-5 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-medium transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800">
                  Save as Draft
                </button>
                <button 
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 flex items-center gap-2"
                >
                  {currentStep === 10 ? 'Publish Session' : 'Save & Continue'}
                  {currentStep < 10 && <ChevronRight className="w-4 h-4" />}
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
