'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  memo,
} from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const clsx = (...args: any[]) => args.filter(Boolean).join(' ');

// Type Definitions
interface UIMessage {
  id: string;
  content: string;
  role: string;
}

type VisibilityType = 'public' | 'private' | 'unlisted' | string;

// Utility Functions
const cn = (...inputs: any[]) => {
  return twMerge(clsx(inputs));
};

// Button variants using cva
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-black text-white hover:bg-gray-800',
        destructive:
          'border border-black text-black hover:bg-gray-100',
        outline:
          'border border-gray-400 bg-white hover:bg-gray-100 hover:text-black',
        secondary:
          'bg-gray-200 text-black hover:bg-gray-300',
        ghost: 'text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]', 
        link: 'text-black underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Button component
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'button' : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

// Textarea component
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-base ring-offset-[var(--color-bg)] placeholder:text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2a900]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-[var(--color-text)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

// Stop Icon SVG (uses currentColor)
const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg height={size} viewBox="0 0 16 16" width={size} style={{ color: 'currentcolor' }}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H13V13H3V3Z"
        fill="currentColor"
      />
    </svg>
  );
};

// Globe Icon SVG (uses currentColor)
const GlobeIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: 'currentcolor' }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
};

// Arrow Up Icon SVG (Send) (uses currentColor)
const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
    return (
      <svg
        height={size}
        strokeLinejoin="round"
        viewBox="0 0 16 16"
        width={size}
        style={{ color: 'currentcolor' }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
          fill="currentColor"
        />
      </svg>
    );
  };

// Sub-Components
interface SuggestedActionsProps {
  chatId: string;
  onSelectAction: (action: string) => void;
  selectedVisibilityType: VisibilityType;
}

const ALL_SUGGESTED_ACTIONS = [
  {
    title: 'Hostel & Housing',
    label: 'how do I apply for hostels?',
    action: 'How do I apply for hostels?',
  },
  {
    title: 'Fee & Policy',
    label: 'what is the tuition waiver policy?',
    action: 'What is the tuition waiver policy?',
  },
  {
    title: 'Admission Info',
    label: 'what are the CS requirements?',
    action: 'What are the Computer Science admission requirements?',
  },
  {
    title: 'IT Helpdesk',
    label: 'how do I contact tech support?',
    action: 'How do I contact the SNU IT helpdesk?',
  },
  {
    title: 'Library Hours',
    label: 'what are the library timings?',
    action: 'What are the library timings and rules?',
  },
  {
    title: 'Dining & Mess',
    label: 'what is the mess menu today?',
    action: 'What is the mess dining timing and menu?',
  },
  {
    title: 'Campus Clinic',
    label: 'where is the campus medical center?',
    action: 'Where is the campus medical clinic and how do I contact them?',
  },
  {
    title: 'Sports Facilities',
    label: 'how to book the indoor sports court?',
    action: 'How do I book or access the indoor sports facilities?',
  },
  {
    title: 'Academic Calendar',
    label: 'when do semester breaks start?',
    action: 'When are the semester breaks and summer vacations scheduled?',
  },
  {
    title: 'SNU Shuttle',
    label: 'what is the shuttle bus schedule?',
    action: 'What is the shuttle bus schedule to the nearest metro station?',
  },
  {
    title: 'Placement Cell',
    label: 'how to contact the CDC team?',
    action: 'How do I contact the Career Development Centre (CDC)?',
  },
  {
    title: 'Club Activities',
    label: 'how do I join student clubs?',
    action: 'How do I register for student clubs and societies?',
  },
];

function PureSuggestedActions({
  chatId,
  onSelectAction,
}: SuggestedActionsProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const suggestedActions = React.useMemo(() => {
    if (!mounted) {
      return ALL_SUGGESTED_ACTIONS.slice(0, 4);
    }
    return [...ALL_SUGGESTED_ACTIONS]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [chatId, mounted]);

  return (
    <div
      data-testid="suggested-actions"
      className="grid pb-2 sm:grid-cols-2 gap-2 w-full"
    >
      <AnimatePresence>
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={() => onSelectAction(suggestedAction.action)}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:border-amber-500/40 transition-all duration-200"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <span className="font-medium text-[var(--color-text)]">{suggestedAction.title}</span>
            <span style={{ color: "var(--color-muted)" }}>
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
      </AnimatePresence>
    </div>
  );
}

const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    return true;
  },
);


function PureWebSearchButton({
  active,
  onClick,
  disabled,
}: {
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
  disabled: boolean;
}) {
  return (
    <Button
      data-testid="websearch-button"
      className={cn(
        "rounded-md rounded-bl-lg p-[7px] h-fit border transition-all flex items-center gap-1.5",
        active 
          ? "border-amber-500/50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
      )}
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      aria-label="Toggle web search"
      title="Search Web & DB Combined"
    >
      <GlobeIcon size={14} />
      <span className="text-[10px] font-semibold uppercase tracking-wider px-0.5">
        Search Web
      </span>
    </Button>
  );
}

const WebSearchButton = memo(PureWebSearchButton, (prev, next) => prev.active === next.active && prev.disabled === next.disabled);

function PureStopButton({ onStop }: { onStop: () => void }) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit bg-red-600 hover:bg-red-700 text-white border-none"
      onClick={(event) => {
        event.preventDefault();
        onStop();
      }}
      aria-label="Stop generating"
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton, (prev, next) => prev.onStop === next.onStop);

function PureSendButton({
  submitForm,
  input,
  canSend,
  isGenerating,
}: {
  submitForm: () => void;
  input: string;
  canSend: boolean;
  isGenerating: boolean;
}) {
  const isDisabled =
    !canSend ||
    isGenerating ||
    input.trim().length === 0;

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit bg-[#f2a900] text-[#002e5b] hover:bg-[#cc8e00] disabled:bg-[var(--color-border)] disabled:text-[var(--color-muted)] disabled:opacity-40 border-none"
      onClick={(event) => {
        event.preventDefault();
        if (!isDisabled) {
          submitForm();
        }
      }}
      disabled={isDisabled}
      aria-label="Send message"
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.canSend !== nextProps.canSend) return false;
  if (prevProps.isGenerating !== nextProps.isGenerating) return false;
  return true;
});


// Main Component

export interface MultimodalInputProps {
  chatId: string;
  messages: Array<UIMessage>;
  webSearchActive: boolean;
  setWebSearchActive: Dispatch<SetStateAction<boolean>>;
  onSendMessage: (params: { input: string; webSearch: boolean }) => void;
  onStopGenerating: () => void;
  isGenerating: boolean;
  canSend: boolean;
  className?: string;
  selectedVisibilityType: VisibilityType;
}

function PureMultimodalInput({
  chatId,
  messages,
  webSearchActive,
  setWebSearchActive,
  onSendMessage,
  onStopGenerating,
  isGenerating,
  canSend,
  className,
  selectedVisibilityType,
}: MultimodalInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [input, setInput] = useState('');

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    }
  };

  const resetHeight = useCallback(() => {
     const textarea = textareaRef.current;
      if (textarea) {
          textarea.style.height = 'auto';
          textarea.rows = 1;
          adjustHeight();
      }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, [input]); // Depend only on input

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
  };

  const submitForm = useCallback(() => {
     if (input.trim().length === 0) {
        console.warn('Please enter a message.');
        return;
     }

    onSendMessage({ input, webSearch: webSearchActive });

    // Clear input
    setInput('');

    resetHeight();
    textareaRef.current?.focus();

  }, [
    input,
    webSearchActive,
    onSendMessage,
    resetHeight,
  ]);

  const showSuggestedActions = messages.length === 0;

  return (
    <div className={cn("relative w-full flex flex-col gap-4", className)}>

      <AnimatePresence>
       {showSuggestedActions && (
         <motion.div
            key="suggested-actions-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
         >
            <SuggestedActions
              onSelectAction={(action) => {
                setInput(action);
                requestAnimationFrame(() => {
                     adjustHeight();
                     textareaRef.current?.focus();
                });
             }}
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
            />
         </motion.div>
       )}
      </AnimatePresence>

      <Textarea
        data-testid="multimodal-input"
        ref={textareaRef}
        placeholder="Message SNUGPT..."
        value={input}
        onChange={handleInput}
        className={cn(
          'min-h-[24px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-2xl !text-base pb-10',
          'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-amber-500/30 focus:border-[#f2a900]/60 focus-visible:ring-1 focus-visible:ring-[#f2a900]/50 focus-visible:ring-offset-1 transition-all duration-200 text-[var(--color-text)] placeholder:text-[var(--color-muted)]', 
          className,
        )}
        rows={1}
        autoFocus
        disabled={!canSend || isGenerating}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            const canSubmit = canSend && !isGenerating && input.trim().length > 0;

            if (canSubmit) {
              submitForm();
            }
          } else if (event.key === 'ArrowUp' && !input.trim()) {
            const userMessages = messages.filter((m) => m.role === 'user');
            if (userMessages.length > 0) {
              event.preventDefault();
              setInput(userMessages[userMessages.length - 1].content);
            }
          }
        }}
      />

      <div className="absolute bottom-0 left-0 p-2 w-fit flex flex-row justify-start z-10">
        <WebSearchButton
          active={webSearchActive}
          onClick={(e) => {
            e.preventDefault();
            setWebSearchActive((prev) => !prev);
          }}
          disabled={isGenerating}
        />
      </div>

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end z-10">
        {isGenerating ? (
          <StopButton onStop={onStopGenerating} />
        ) : (
          <SendButton
            submitForm={submitForm}
            input={input}
            canSend={canSend}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
}

export { PureMultimodalInput };
