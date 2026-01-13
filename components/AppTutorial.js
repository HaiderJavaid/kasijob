"use client";
import { STATUS, EVENTS, ACTIONS } from "react-joyride";
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from "next/navigation";

const Joyride = dynamic(() => import('react-joyride'), { ssr: false });

export default function AppTutorial({ run, steps, stepIndex, onStepChange, onComplete }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleJoyrideCallback = (data) => {
    const { status, type, action, index } = data;

    // 1. Handle Finish/Skip
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      if (onComplete) onComplete();
      return;
    }

    // 2. Handle Step Changes (Controlled Mode)
    // We listen for STEP_AFTER (user clicked next) and tell the parent to update the index
    if (type === EVENTS.STEP_AFTER || (type === EVENTS.TARGET_NOT_FOUND && action === ACTIONS.NEXT)) {
        const nextIndex = index + (action === ACTIONS.PREV ? -1 : 1);
        if (onStepChange) {
            onStepChange(nextIndex);
        }
    }
    
    // 3. Custom Redirect Logic (Tasks -> Profile)
    if (type === EVENTS.STEP_AFTER && pathname === '/tasks' && index === steps.length - 1) {
        router.push("/profile?tour=true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex} // <--- This connects the manual control
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      disableCloseOnEsc
      spotlightClicks={true}
      scrollOffset={150}
      styles={{
        options: {
          primaryColor: '#FFD700',
          textColor: '#1A1A1A',
          zIndex: 10000,
        },
        buttonNext: {
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '8px',
        }
      }}
      callback={handleJoyrideCallback}
    />
  );
}