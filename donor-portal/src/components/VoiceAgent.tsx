import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Send, MessageCircle, AlertCircle } from 'lucide-react';
import Vapi from '@vapi-ai/web';
import { CHAT_CONFIG, getRandomFallbackResponse } from '../config/chat';

// Declare custom vapi-widget element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vapi-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'assistant-id': string;
        'public-key': string;
      };
    }
  }
}

interface VoiceAgentProps {
  className?: string;
}

interface VapiControls {
  start: () => void;
  stop: () => void;
  send: (message: string) => void;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ className = '' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [vapiControls, setVapiControls] = useState<VapiControls | null>(null);
  const [isVapiLoaded, setIsVapiLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string, timestamp: Date}>>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');

  // Vapi configuration - use environment variables
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID || "7eed8831-dab4-4afa-b413-0818aecc0c57";
  const apiKey = import.meta.env.VITE_VAPI_API_KEY || "b0bed86f-579d-4210-9982-449afa3b0a70";
  
  // n8n webhook configuration
  const n8nWebhookUrl = CHAT_CONFIG.n8nWebhookUrl;
  
  // Validate configuration
  useEffect(() => {
    console.log('VoiceAgent: Initializing with configuration:');
    console.log('- Assistant ID:', assistantId);
    console.log('- API Key length:', apiKey ? apiKey.length : 'undefined');
    console.log('- n8n Webhook URL:', n8nWebhookUrl);
    
    if (!apiKey || apiKey.length < 10) {
      setError('Invalid API key configuration. Please check your VITE_VAPI_API_KEY environment variable.');
      return;
    }
    
    if (!assistantId || assistantId.length < 1) {
      setError('Invalid assistant ID configuration. Please check your VITE_VAPI_ASSISTANT_ID environment variable.');
      return;
    }
    
    console.log('VoiceAgent: Configuration validation passed');
  }, []);

  // Load Vapi widget script and set up event listeners
  useEffect(() => {
    // Check if script already exists to prevent duplicates
    if (document.querySelector('script[src*="vapi-ai"]')) {
      setupVapiWidgetEvents();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@vapi-ai/client-sdk-react/dist/embed/widget.umd.js';
    script.async = true;
    script.type = 'text/javascript';
    script.id = 'vapi-widget-script';
    
    script.onload = () => {
      // Set up Vapi widget event listeners once script is loaded
      setupVapiWidgetEvents();
    };
    
    script.onerror = () => {
      console.error('Failed to load Vapi widget script');
      setError('Failed to load voice assistant script');
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.getElementById('vapi-widget-script');
      if (existingScript && document.head.contains(existingScript)) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Set up Vapi widget event listeners
  const setupVapiWidgetEvents = () => {
    try {
      // Wait for the widget to be available
      const checkWidget = setInterval(() => {
        const widget = document.querySelector('vapi-widget');
        if (widget) {
          clearInterval(checkWidget);
          
          console.log('Vapi widget found, setting up event listeners');
          
          // Listen for Vapi widget events
          widget.addEventListener('message', (event: any) => {
            if (event.detail && event.detail.type === 'transcript') {
              const userMessage = event.detail.transcript;
              console.log('🎤 Vapi widget transcript received:', userMessage);
              
              // Add user message to conversation
              addMessageToConversation('user', userMessage);
              
              // Send user message to n8n webhook for RAG responses
              console.log('🚀 Sending Vapi widget transcript to n8n:', userMessage);
              sendToN8nWebhook(userMessage, 'voice');
            }
          });

          // Listen for Vapi assistant responses - REMOVED to prevent fragmentation
          // widget.addEventListener('assistant-response', (event: any) => {
          //   if (event.detail && event.detail.response) {
          //     console.log('Vapi widget assistant response:', event.detail.response);
          //     addMessageToConversation('assistant', event.detail.response);
          //   }
          // });
        }
      }, 100);

      // Cleanup interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkWidget);
      }, 10000);
    } catch (error) {
      console.error('Error setting up Vapi widget events:', error);
    }
  };

  // Advanced VAPI setup with event handling
  const setupAdvancedVoiceWidget = (apiKey: string, assistantId: string): VapiControls => {
    try {
      const vapi = new Vapi(apiKey);
      
      // Verify the VAPI instance has the expected methods
      if (typeof vapi.on !== 'function') {
        throw new Error('VAPI instance missing "on" method');
      }
      if (typeof vapi.start !== 'function') {
        throw new Error('VAPI instance missing "start" method');
      }
      if (typeof vapi.stop !== 'function') {
        throw new Error('VAPI instance missing "stop" method');
      }
      if (typeof vapi.send !== 'function') {
        throw new Error('VAPI instance missing "send" method');
      }

      // Call lifecycle events
      vapi.on('call-start', () => {
        setIsListening(true);
        setIsProcessing(false);
        setTranscript('Voice conversation started...');
        setError(null);
      });

      vapi.on('call-end', () => {
        setIsListening(false);
        setIsProcessing(false);
        setTranscript('Voice conversation ended.');
      });

        // Real-time conversation events
  vapi.on('speech-start', () => {
    setIsListening(true);
    setTranscript('Listening...');
  });

  vapi.on('speech-end', () => {
    setIsListening(false);
    setTranscript('Processing your request through n8n RAG system...');
    setIsProcessing(true);
    
    // Send the current transcript to n8n webhook for RAG response
    // Use a timeout to ensure we have the final transcript
    setTimeout(() => {
      if (transcript && transcript.trim() && 
          transcript !== 'Starting voice assistant... Ask me about blood donation!' && 
          transcript !== 'Listening for your question about blood donation...' && 
          transcript !== 'Processing your request through n8n RAG system...' &&
          transcript !== 'Listening...') {
        console.log('🎤 Sending final voice transcript to n8n:', transcript);
        sendToN8nWebhook(transcript, 'voice');
      }
    }, 500);
  });

      vapi.on('message', (message: any) => {
        if (message.type === 'transcript') {
          // Only add user messages to conversation, not assistant responses
          if (message.role === 'user') {
            const userTranscript = message.transcript;
            console.log('🎤 VAPI transcript received:', userTranscript);
            
            // Add user message to conversation
            addMessageToConversation(message.role, userTranscript);
            setTranscript(userTranscript);
            
            // Always send voice message to n8n webhook for RAG responses
            if (userTranscript.trim()) {
              console.log('🚀 Processing voice message through n8n:', userTranscript);
              
              // Show that we're processing through n8n
              setTranscript(`🎤 Processing: "${userTranscript}" through n8n RAG system...`);
              
              // Send to n8n webhook
              sendToN8nWebhook(userTranscript, 'voice');
            }
          }
          // REMOVED: Don't add assistant messages here to prevent fragmentation
        } else if (message.type === 'function-call') {
          setTranscript(`Function called: ${message.functionCall.name}`);
        }
      });

      // Error handling
      vapi.on('error', (error: any) => {
        let errorMessage = 'Voice assistant error occurred. Please try again.';
        
        // Handle specific error types
        if (error.type === 'start-method-error') {
          errorMessage = 'Failed to start voice call. Please check your VAPI configuration.';
        } else if (error.error && error.error.status === 400) {
          errorMessage = 'Invalid request to VAPI. Please verify your assistant ID and API key. Check your environment variables.';
        } else if (error.error && error.error.status === 401) {
          errorMessage = 'Unauthorized. Please check your API key.';
        } else if (error.error && error.error.status === 404) {
          errorMessage = 'Assistant not found. Please check your assistant ID.';
        } else if (error.error && error.error.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.error && error.error.status >= 500) {
          errorMessage = 'VAPI service error. Please try again later.';
        }
        
        setError(errorMessage);
        setIsListening(false);
        setIsProcessing(false);
      });

      return {
        start: () => {
          return vapi.start(assistantId);
        },
        stop: () => {
          return vapi.stop();
        },
        send: (message: string) => {
          return vapi.send({
            type: 'add-message',
            message: {
              role: 'user',
              content: message
            }
          });
        }
      };
    } catch (error) {
      console.error('Error in setupAdvancedVoiceWidget:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Check if VAPI is available
    if (typeof Vapi === 'undefined') {
      setError('VAPI SDK not available');
      return;
    }
    
    // Check if browser supports required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Browser does not support voice input');
      return;
    }
    
    try {
      const controls = setupAdvancedVoiceWidget(apiKey, assistantId);
      setVapiControls(controls);
      setIsVapiLoaded(true);
    } catch (error) {
      console.error('Error setting up VAPI:', error);
      setError('Failed to initialize voice assistant');
    }

    // Cleanup function
    return () => {
      if (vapiControls) {
        try {
          vapiControls.stop();
        } catch (error) {
          console.log('Vapi cleanup error:', error);
        }
      }
    };
  }, [apiKey, assistantId]);

  const startListening = () => {
    if (vapiControls && isVapiLoaded) {
      try {
        // Start a new conversation
        startNewConversation();
        
        vapiControls.start();
        setIsListening(true);
        setIsProcessing(false);
        setTranscript('🎤 Voice assistant started! Ask me about blood donation, and I\'ll get answers from our knowledge base.');
        setError(null);
      } catch (error) {
        console.error('Error starting Vapi:', error);
        setError('Error starting voice assistant. Please try again.');
      }
    } else {
      setTranscript('Voice assistant is still loading. Please wait...');
    }
  };

  const stopListening = () => {
    if (vapiControls && isVapiLoaded) {
      try {
        vapiControls.stop();
        setIsListening(false);
        setIsProcessing(false);
        setTranscript('🛑 Voice assistant stopped. Your question has been processed through our n8n knowledge base system.');
      } catch (error) {
        console.error('Error stopping Vapi:', error);
      }
    }
  };

  const sendTextMessage = (message: string) => {
    if (vapiControls && isVapiLoaded) {
      try {
        vapiControls.send(message);
        addMessageToConversation('user', message);
        setTranscript(`Sent: ${message}`);
        
        // Also send to n8n webhook for RAG responses
        console.log('Sending text message to n8n:', message);
        sendToN8nWebhook(message, 'text');
      } catch (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
      }
    } else {
      // If VAPI is not available, still send to n8n webhook
      console.log('VAPI not available, sending text message directly to n8n:', message);
      addMessageToConversation('user', message);
      setTranscript(`Sent: ${message}`);
      sendToN8nWebhook(message, 'text');
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    // Don't clear transcript or conversation history when expanding/collapsing
    // This maintains the conversation context
  };

  const handleVoiceChat = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      // Set transcript to indicate we're listening for questions and will use n8n
      setTranscript('🎤 Listening for your question about blood donation... Will connect to n8n RAG system.');
    }
  };



  const clearError = () => {
    setError(null);
  };

  // Function to manage conversation state - CONSOLIDATED to prevent fragmentation
  const addMessageToConversation = (role: 'user' | 'assistant', content: string) => {
    // Prevent adding empty or duplicate messages
    if (!content.trim()) return;
    
    // Check if this is a duplicate of the last message
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    if (lastMessage && lastMessage.role === role && lastMessage.content === content) {
      return; // Skip duplicate
    }
    
    // Check if we should append to the last assistant message instead of creating a new one
    if (role === 'assistant' && lastMessage && lastMessage.role === 'assistant') {
      // If the last message was from assistant and this is also from assistant, 
      // check if they should be combined (e.g., fragmented responses)
      const timeDiff = new Date().getTime() - lastMessage.timestamp.getTime();
      if (timeDiff < 5000) { // Within 5 seconds, likely fragmented
        // Update the last message with combined content
        setConversationHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: lastMessage.content + ' ' + content,
            timestamp: new Date()
          };
          return updated;
        });
        return;
      }
    }
    
    const newMessage = {
      role,
      content,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, newMessage]);
  };

  // Function to consolidate fragmented messages in conversation history
  const consolidateConversationHistory = () => {
    setConversationHistory(prev => {
      if (prev.length <= 1) return prev;
      
      const consolidated = [];
      let currentMessage = { ...prev[0] };
      
      for (let i = 1; i < prev.length; i++) {
        const nextMessage = prev[i];
        
        // If consecutive messages are from the same role and within 5 seconds, combine them
        if (currentMessage.role === nextMessage.role) {
          const timeDiff = nextMessage.timestamp.getTime() - currentMessage.timestamp.getTime();
          if (timeDiff < 5000) {
            // Combine messages
            currentMessage = {
              ...currentMessage,
              content: currentMessage.content + ' ' + nextMessage.content,
              timestamp: nextMessage.timestamp
            };
          } else {
            // Add current message and start new one
            consolidated.push(currentMessage);
            currentMessage = { ...nextMessage };
          }
        } else {
          // Different role, add current message and start new one
          consolidated.push(currentMessage);
          currentMessage = { ...nextMessage };
        }
      }
      
      // Add the last message
      consolidated.push(currentMessage);
      return consolidated;
    });
  };

  // Consolidate conversation history when it changes
  useEffect(() => {
    if (conversationHistory.length > 0) {
      consolidateConversationHistory();
    }
  }, [conversationHistory.length]);

  // Auto-cleanup fragmented messages when conversation gets long
  useEffect(() => {
    if (conversationHistory.length > 10) {
      console.log('🔄 Auto-cleaning long conversation to prevent fragmentation');
      cleanupFragmentedMessages();
    }
  }, [conversationHistory.length]);

  // Function to start a new conversation
  const startNewConversation = () => {
    const newConversationId = `conv-${Date.now()}`;
    setCurrentConversationId(newConversationId);
    setConversationHistory([]);
    setTranscript('');
    setError(null);
    setIsProcessing(false);
    setIsListening(false);
  };

  // Function to clean up fragmented messages
  const cleanupFragmentedMessages = () => {
    setConversationHistory(prev => {
      if (prev.length <= 1) return prev;
      
      const cleaned = [];
      let currentMessage = { ...prev[0] };
      
      for (let i = 1; i < prev.length; i++) {
        const nextMessage = prev[i];
        
        // If consecutive messages are from the same role, combine them
        if (currentMessage.role === nextMessage.role) {
          currentMessage = {
            ...currentMessage,
            content: currentMessage.content + ' ' + nextMessage.content,
            timestamp: nextMessage.timestamp
          };
        } else {
          // Different role, add current message and start new one
          cleaned.push(currentMessage);
          currentMessage = { ...nextMessage };
        }
      }
      
      // Add the last message
      cleaned.push(currentMessage);
      return cleaned;
    });
  };

  // Unified function to send message to n8n webhook for RAG responses
  const sendToN8nWebhook = async (message: string, inputType: 'text' | 'voice' = 'text') => {
    if (!message.trim()) return;

    console.log(`🚀 Sending ${inputType} message to n8n:`, message);
    console.log('📍 n8n Webhook URL:', n8nWebhookUrl);
    
    // Show user that we're connecting to n8n
    if (inputType === 'voice') {
      setTranscript(`🎤 Connecting to n8n: "${message}"`);
    }

    // Validate webhook URL
    if (!n8nWebhookUrl || n8nWebhookUrl === 'undefined') {
      console.error('❌ Invalid n8n webhook URL:', n8nWebhookUrl);
      setError('n8n webhook URL not configured. Please check your environment variables.');
      return;
    }

    try {
      const requestBody = {
        message: message.trim(),
        timestamp: new Date().toISOString(),
        sessionId: `vitalita-vapi-${inputType}-${Date.now()}`,
        userAgent: navigator.userAgent,
        source: `vitalita-vapi-${inputType}-agent`,
        inputType: inputType,
        // Add additional context for better n8n processing
        context: {
          platform: 'vitalita-web',
          component: 'voice-agent',
          inputMethod: inputType
        }
      };

      console.log('📤 Sending request to n8n webhook:', n8nWebhookUrl);
      console.log('📤 Request body:', requestBody);

      // Test CORS preflight first
      try {
        console.log('🔍 Testing CORS preflight...');
        const preflightResponse = await fetch(n8nWebhookUrl, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        console.log('🔍 CORS preflight status:', preflightResponse.status);
      } catch (preflightError) {
        console.warn('⚠️ CORS preflight test failed:', preflightError);
      }

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 n8n response status:', response.status);
      console.log('📥 n8n response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        console.log('✅ n8n response data:', data);
        
        let responseText = 'I understand your question. Let me get that information for you.';

        if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0].output === 'string') {
          responseText = data[0].output;
        } else if (typeof data === 'object' && data !== null && typeof data.output === 'string') {
          responseText = data.output;
        } else if (typeof data === 'string') {
          responseText = data;
        }

        // Clean up the response text to prevent fragmentation
        responseText = responseText.trim();
        
        // If the response seems fragmented, try to combine it
        if (responseText.includes('...') || responseText.length < 50) {
          // This might be a fragmented response, try to get more context
          console.log('⚠️ Potential fragmented response detected, attempting to get complete response');
        }

        console.log('✅ Processed response text:', responseText);

        // Add bot response to conversation history - CONSOLIDATED
        const botMessage = {
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        };
        addMessageToConversation('assistant', responseText);

        // Update transcript for voice chat
        if (inputType === 'voice') {
          setTranscript(responseText);
        }
      } else {
        console.warn('❌ n8n webhook returned error status:', response.status);
        
        // Try to get error details
        let errorDetails = '';
        try {
          errorDetails = await response.text();
          console.error('❌ Error details:', errorDetails);
        } catch (e) {
          console.error('❌ Could not read error response');
        }
        
        // Fallback response on error - CONSOLIDATED
        const fallbackResponse = getRandomFallbackResponse();
        addMessageToConversation('assistant', fallbackResponse);
        
        if (inputType === 'voice') {
          setTranscript('I heard your question. Let me help you with that.');
        }
        
        // Set error for user feedback, but auto-dismiss after showing fallback
        setError(`Server responded with an error. Providing a general response.`);
        
        // Auto-dismiss error after 5 seconds
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } catch (error: unknown) {
      console.error(`❌ Error sending ${inputType} message to n8n:`, error);
      
      // Provide specific error messages for common issues
      let errorMessage = 'Unable to connect to the knowledge base. Using fallback response.';
      
      if (error instanceof Error) {
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Connection issue: Please check your internet connection. Providing a general response.';
          console.error('🔍 Network connectivity issue detected');
        } else if (error.name === 'TypeError' && error.message.includes('CORS')) {
          errorMessage = 'Server configuration issue. Providing a general response.';
          console.error('🔍 CORS issue detected');
        }
      }
      
      // Show error briefly, then auto-dismiss after showing fallback
      setError(errorMessage);
      
      // Fallback response on error - CONSOLIDATED
      const fallbackResponse = getRandomFallbackResponse();
      addMessageToConversation('assistant', fallbackResponse);
      
      if (inputType === 'voice') {
        setTranscript('I heard your question. Let me help you with that.');
      }
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className={`fixed pointer-events-auto transition-all duration-300 ease-in-out z-[1000] bottom-4 left-1/2 -translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:translate-x-0 transform-gpu ${className}`}
      style={{ 
        maxHeight: 'calc(100vh - 100px)'
      }}
    >
             {/* Compact Voice Agent - Mobile Compact / Desktop Full */}
       {!isExpanded && (
         <>
           {/* Mobile: Compact Icon Button */}
           <div className="md:hidden relative">
             <button
               onClick={handleVoiceChat}
               disabled={isProcessing || !isVapiLoaded}
               className={`min-w-[56px] min-h-[56px] bg-red-600 text-white rounded-full shadow-xl border-2 border-white flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2 ${
                 isListening ? 'bg-red-700 scale-110 shadow-2xl' : 'hover:bg-red-700 hover:scale-105'
               } ${(isProcessing || !isVapiLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
               title={isListening ? 'Stop listening' : 'Start voice chat'}
               aria-label={isListening ? 'Stop listening' : 'Start voice chat'}
             >
               {!isVapiLoaded ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : isProcessing ? (
                 <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
               ) : isListening ? (
                 <MicOff className="w-6 h-6" />
               ) : (
                 <Mic className="w-6 h-6" />
               )}
             </button>
             {/* Status indicator badge */}
             {(isListening || isProcessing) && (
               <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse transform translate-x-1/4 -translate-y-1/4"></div>
             )}
           </div>

           {/* Desktop: Full Card */}
           <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-64 hover:shadow-2xl transition-all duration-300">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-3">
                 <div className="relative">
                   <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                     <Mic className="w-5 h-5 text-red-600" />
                   </div>
                   {/* Animated sound bars */}
                   <div className="absolute -top-1 -left-1 w-12 h-12">
                     {[...Array(6)].map((_, i) => (
                       <div
                         key={i}
                         className={`absolute w-1 bg-red-400 rounded-full transition-all duration-300 ${
                           isListening ? 'animate-pulse' : 'opacity-0'
                         }`}
                         style={{
                           height: `${Math.random() * 16 + 6}px`,
                           left: `${i * 1.5}px`,
                           top: `${16 - (Math.random() * 16 + 6) / 2}px`,
                           animationDelay: `${i * 100}ms`
                         }}
                       />
                     ))}
                   </div>
                 </div>
                 <div>
                   <h3 className="font-semibold text-gray-900 text-sm">Voice Assistant</h3>
                   <p className="text-xs text-gray-600">
                     {!isVapiLoaded ? 'Loading...' : isListening ? 'Listening' : conversationHistory.length > 0 ? `${conversationHistory.length} messages` : 'Ready with n8n'}
                   </p>
                   <p className="text-xs text-blue-600 font-medium">
                     🔗 n8n Connected
                   </p>
                 </div>
               </div>
               <button
                 onClick={toggleExpanded}
                 className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                 title="Open chat window"
                 aria-label="Open chat window"
               >
                 <MessageCircle className="w-4 h-4" />
               </button>
             </div>
             
             <button
               onClick={handleVoiceChat}
               disabled={isProcessing || !isVapiLoaded}
               className={`w-full py-2.5 px-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm min-h-[44px] ${
                 isListening
                   ? 'bg-red-600 text-white shadow-lg hover:bg-red-700'
                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
               } ${(isProcessing || !isVapiLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {!isVapiLoaded ? (
                 <div className="flex items-center justify-center space-x-2">
                   <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                   <span>Loading...</span>
                 </div>
               ) : isProcessing ? (
                 <div className="flex items-center justify-center space-x-2">
                   <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   <span>Processing...</span>
                 </div>
               ) : isListening ? (
                 <div className="flex items-center justify-center space-x-2">
                   <MicOff className="w-3 h-3" />
                   <span>Stop listening</span>
                 </div>
               ) : (
                 <div className="flex items-center justify-center space-x-2">
                   <Mic className="w-3 h-3" />
                   <span>Start voice chat (n8n)</span>
                 </div>
               )}
             </button>
           </div>
         </>
       )}

             {/* Expanded Voice Agent - Responsive */}
       {isExpanded && (
         <div 
           className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-5 w-[calc(100vw-32px)] max-w-sm md:w-72"
          style={{ 
            maxHeight: 'calc(100vh - 100px)', 
            overflowY: 'auto',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Mic className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Voice Assistant</h3>
                <p className="text-xs text-gray-600">
                  {!isVapiLoaded ? 'Loading VAPI SDK...' : isListening ? 'Listening to you' : 'Ask me about donations'}
                </p>
                <p className="text-xs text-blue-600 font-medium">
                  🔗 Connected to n8n RAG System
                </p>

              </div>
            </div>
            <button
              onClick={toggleExpanded}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Minimize voice assistant"
              aria-label="Minimize voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Error Display */}
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 transition-all duration-300">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-sm text-amber-800 flex-1">{error}</span>
                <button
                  onClick={clearError}
                  className="ml-2 flex-shrink-0 text-amber-600 hover:text-amber-800 min-w-[32px] min-h-[32px] flex items-center justify-center p-1 rounded-full hover:bg-amber-100 transition-colors"
                  aria-label="Dismiss message"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4 min-h-28 max-h-40 overflow-y-auto">
            {!isVapiLoaded ? (
              <div className="text-center text-gray-500 py-6">
                <div className="w-6 h-6 mx-auto mb-2 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Loading voice assistant...</p>
              </div>
            ) : isProcessing ? (
              <div className="text-center text-gray-500 py-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="w-6 h-6 mx-auto mb-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600 mb-2">Processing your request...</p>
                  <p className="text-xs text-gray-500">Getting information from our knowledge base</p>
                </div>
              </div>
            ) : conversationHistory.length > 0 ? (
              <div className="space-y-3">
                {/* Single conversation thread */}
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 mb-2 text-center border-b border-gray-100 pb-2">
                    💬 Conversation Thread ({conversationHistory.length} messages)
                  </div>
                  <div className="space-y-3">
                    {conversationHistory.map((msg, index) => (
                      <div key={index} className={`flex items-start space-x-2 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Volume2 className="w-2.5 h-2.5 text-red-600" />
                          </div>
                        )}
                        <div className={`max-w-[85%] rounded-lg p-3 ${
                          msg.role === 'user' 
                            ? 'bg-blue-500 text-white ml-auto' 
                            : 'bg-gray-200 text-gray-800'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-2 ${
                            msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Mic className="w-2.5 h-2.5 text-blue-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Volume2 className="w-8 h-8 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">No conversation yet</p>
                  <p className="text-xs text-gray-500">Click the microphone to start talking or type a message below</p>
                </div>
              </div>
            )}
          </div>

          {/* Text Chat Input */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const message = e.currentTarget.value.trim();
                    console.log('Text input Enter key pressed:', message);
                    sendTextMessage(message);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isProcessing || !isVapiLoaded}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    const message = input.value.trim();
                    console.log('Text input Send button clicked:', message);
                    sendTextMessage(message);
                    input.value = '';
                  }
                }}
                disabled={isProcessing || !isVapiLoaded}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Send text message"
                aria-label="Send text message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              💬 Type a message or 🎤 use voice - both connect to n8n RAG system
            </p>
          </div>

          {/* Voice Controls */}
          <div className="space-y-3">
            <button
              onClick={handleVoiceChat}
              disabled={isProcessing || !isVapiLoaded}
              className={`w-full py-2.5 px-3 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-sm min-h-[44px] ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg hover:bg-red-700'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              } ${(isProcessing || !isVapiLoaded) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {!isVapiLoaded ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading VAPI SDK...</span>
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing your request...</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center justify-center space-x-2">
                  <MicOff className="w-3 h-3" />
                  <span>Stop listening</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Mic className="w-3 h-3" />
                  <span>Start listening (n8n)</span>
                </div>
              )}
            </button>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  const message = 'What are the requirements for blood donation?';
                  console.log('Quick action: Requirements');
                  sendTextMessage(message);
                }}
                className="py-3 px-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[44px] flex items-center justify-center"
                title="Ask about donation requirements"
                aria-label="Ask about donation requirements"
              >
                Requirements
              </button>
              <button 
                onClick={() => {
                  const message = 'Where are the donation centers located?';
                  console.log('Quick action: Center locations');
                  sendTextMessage(message);
                }}
                className="py-3 px-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[44px] flex items-center justify-center"
                title="Ask about center locations"
                aria-label="Ask about center locations"
              >
                Center locations
              </button>
            </div>

            
            {/* Debug/Test Section */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button 
                  onClick={startNewConversation}
                  className="py-3 px-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px] flex items-center justify-center"
                  title="Start a new conversation"
                  aria-label="Start a new conversation"
                >
                  🔄 New Conversation
                </button>
                <button 
                  onClick={() => {
                    setConversationHistory([]);
                    setTranscript('');
                  }}
                  className="py-3 px-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors min-h-[44px] flex items-center justify-center"
                  title="Clear all messages from chat"
                  aria-label="Clear all messages from chat"
                >
                  🧹 Clean Messages
                </button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                {conversationHistory.length > 0 && (
                  <span>Messages: {conversationHistory.length}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;

