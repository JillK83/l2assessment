/**
 * Recommendation Engine - Context-aware recommended actions
 */

import { CHURN_ESCALATION_KEYWORDS } from './urgencyScorer.js';

/**
 * Get recommended action for a given category and urgency
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level ("High", "Medium", "Low")
 * @returns {string} - Recommended next step
 */
export function getRecommendedAction(category, urgency) {
  if (category === 'Escalation/Complaint') {
    return 'Route to account manager immediately. Do not send automated response. Flag for human callback within 1 hour.';
  }

  if (category === 'Billing Issue') {
    if (urgency === 'High') {
      return 'Escalate to billing team. Pull account history before responding. Do not auto-close.';
    }
    return 'Send plan comparison and schedule a 15-min sales consult. Do not direct to billing portal alone.';
  }

  if (category === 'Technical Problem') {
    if (urgency === 'High') {
      return 'Escalate to engineering triage queue. Request screen recording or error logs.';
    }
    return 'Send troubleshooting guide. If unresolved in 24hrs, escalate to eng.';
  }

  if (category === 'General Inquiry') {
    return 'Respond with relevant FAQ section. Link to knowledge base.';
  }

  if (category === 'Feature Request') {
    if (urgency === 'High' || urgency === 'Medium') {
      return 'Log in product feedback board. Assign to sales team for direct follow-up within 24 hours — customer has indicated this is actively impacting their workflow.';
    }
    return 'Log in product feedback board. Send acknowledgment with timeline estimate.';
  }

  if (category === 'Account Access') {
    return "Send password reset link directly. If reset email doesn't arrive within 5 minutes, direct to /account-access or have agent manually trigger reset from admin panel.";
  }

  return 'Flag for manual human review.';
}

/**
 * Get all available categories
 *
 * @returns {string[]}
 */
export function getAvailableCategories() {
  return [
    'Billing Issue',
    'Technical Problem',
    'General Inquiry',
    'Feature Request',
    'Escalation/Complaint',
    'Account Access',
    'Unknown',
  ];
}

/**
 * Determines if message should be escalated
 *
 * @param {string} category - The message category
 * @param {string} urgency - The urgency level
 * @param {string} message - The original message
 * @returns {boolean}
 */
export function shouldEscalate(category, urgency, message) {
  if (urgency === 'High') return true;
  if (category === 'Escalation/Complaint') return true;

  const lower = message.toLowerCase();
  return CHURN_ESCALATION_KEYWORDS.some(keyword => lower.includes(keyword));
}
