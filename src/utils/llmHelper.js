import Groq from 'groq-sdk';

/**
 * LLM Helper for categorizing customer support messages
 * Using Groq API for AI-powered categorization
 */

const VALID_CATEGORIES = [
  'Billing Issue',
  'Technical Problem',
  'General Inquiry',
  'Feature Request',
  'Escalation/Complaint',
  'Account Access',
];

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true // Required for browser-based calls (not recommended for production!)
});

/**
 * Categorize a customer support message using Groq AI
 *
 * @param {string} message - The customer support message
 * @returns {Promise<{category: string, reasoning: string}>}
 */
export async function categorizeMessage(message) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a customer support triage assistant. Classify the message into exactly one of these categories: Billing Issue, Technical Problem, General Inquiry, Feature Request, Escalation/Complaint, Account Access. Return only the category name on the first line, then explain your reasoning."
        },
        {
          role: "user",
          content: `Categorize this customer support message: ${message}`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const firstLine = content.split('\n')[0].trim();

    // Use the first line as the category if it matches a known category
    const category = VALID_CATEGORIES.find(
      cat => firstLine.toLowerCase() === cat.toLowerCase()
    ) || 'Unknown';

    return {
      category,
      reasoning: content
    };
  } catch (error) {
    console.warn('Groq API failed, using mock response:', error.message);
    return getMockCategorization(message);
  }
}

/**
 * Mock categorization for when API is unavailable
 */
function getMockCategorization(message) {
  const lowerMessage = message.toLowerCase();

  const reasoningVariations = {
    billing: [
      "Based on keywords related to payments and billing, this appears to be a billing-related inquiry. The customer may need assistance with account charges or payment issues.",
      "This message contains billing terminology. The customer is likely experiencing issues with payments, invoices, or account charges.",
      "The message references financial matters related to the customer's account. This suggests a billing or payment concern that requires attention.",
    ],
    technical: [
      "This message describes technical difficulties or system errors. The customer is reporting functionality issues that may require engineering review.",
      "Based on error-related keywords, this appears to be a technical support issue. The customer is experiencing problems with product functionality.",
      "The message indicates a technical problem or bug. This requires investigation from the technical support team.",
    ],
    feature: [
      "This message suggests improvements or new functionality. The customer is providing product feedback and feature suggestions.",
      "The customer is requesting enhancements to the product. This appears to be a feature request that should be reviewed by the product team.",
      "Based on the language used, this seems to be a suggestion for product improvements rather than a support issue.",
    ],
    inquiry: [
      "This appears to be a general question about the product or service. The customer is seeking information or clarification.",
      "The message contains questions that don't indicate a specific problem. This is likely a general inquiry requiring informational support.",
      "Based on the question format, this seems to be an information request rather than a technical or billing issue.",
    ],
    escalation: [
      "This message contains escalation signals such as cancellation threats, requests for management, or disputed charges. Immediate human review is required.",
      "The customer is expressing strong dissatisfaction and requesting escalation. This requires priority handling by a senior support agent.",
    ],
    accountAccess: [
      "The customer is reporting difficulty accessing their account, resetting credentials, or recovering login information.",
      "This message indicates an account access issue such as a forgotten password or locked account.",
    ],
    ambiguous: [
      "The message content is unclear or doesn't match standard support categories. Manual review may be needed for proper categorization.",
      "This message doesn't contain clear indicators for automatic categorization. Human review recommended.",
    ]
  };

  const getRandomReasoning = (category) => {
    const reasons = reasoningVariations[category];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  // Escalation/Complaint detection (check before billing to catch "cancel" escalations)
  if (
    lowerMessage.includes('cancel') || lowerMessage.includes('manager') ||
    lowerMessage.includes('supervisor') || lowerMessage.includes('escalate') ||
    lowerMessage.includes('was promised') || lowerMessage.includes('never agreed') ||
    lowerMessage.includes('unacceptable')
  ) {
    return {
      category: 'Escalation/Complaint',
      reasoning: getRandomReasoning('escalation')
    };
  }

  // Account Access detection
  if (
    lowerMessage.includes('login') || lowerMessage.includes('log in') ||
    lowerMessage.includes('password') || lowerMessage.includes("can't access") ||
    lowerMessage.includes('locked out') || lowerMessage.includes('reset')
  ) {
    return {
      category: 'Account Access',
      reasoning: getRandomReasoning('accountAccess')
    };
  }

  // Billing-related detection
  if (
    lowerMessage.includes('bill') || lowerMessage.includes('payment') ||
    lowerMessage.includes('charge') || lowerMessage.includes('invoice') ||
    lowerMessage.includes('credit card') || lowerMessage.includes('subscription') ||
    lowerMessage.includes('refund') || lowerMessage.includes('plan') ||
    lowerMessage.includes('upgrade') || lowerMessage.includes('tier')
  ) {
    return {
      category: 'Billing Issue',
      reasoning: getRandomReasoning('billing')
    };
  }

  // Technical problem detection
  if (
    lowerMessage.includes('bug') || lowerMessage.includes('error') ||
    lowerMessage.includes('broken') || lowerMessage.includes('not working') ||
    lowerMessage.includes('crash') || lowerMessage.includes('down') ||
    lowerMessage.includes('server') || lowerMessage.includes('loading') ||
    lowerMessage.includes('slow') || lowerMessage.includes('issue') ||
    lowerMessage.includes('problem') && !lowerMessage.includes('no problem')
  ) {
    return {
      category: 'Technical Problem',
      reasoning: getRandomReasoning('technical')
    };
  }

  // Feature request detection
  if (
    lowerMessage.includes('feature') || lowerMessage.includes('improve') ||
    lowerMessage.includes('would like to see') || lowerMessage.includes('suggestion') ||
    lowerMessage.includes('wish') || lowerMessage.includes('enhancement') ||
    lowerMessage.includes('would be great')
  ) {
    return {
      category: 'Feature Request',
      reasoning: getRandomReasoning('feature')
    };
  }

  // Question/inquiry detection
  if (
    lowerMessage.includes('how') || lowerMessage.includes('what') ||
    lowerMessage.includes('when') || lowerMessage.includes('where') ||
    lowerMessage.includes('can i') || lowerMessage.includes('is there') ||
    lowerMessage.includes('?')
  ) {
    return {
      category: 'General Inquiry',
      reasoning: getRandomReasoning('inquiry')
    };
  }

  return {
    category: 'General Inquiry',
    reasoning: getRandomReasoning('ambiguous')
  };
}
