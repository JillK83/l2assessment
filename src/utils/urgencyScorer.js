/**
 * Urgency Scorer - Rule-based urgency calculation
 */

export const CHURN_ESCALATION_KEYWORDS = [
  'cancel', 'canceling', 'cancelling',
  'escalate', 'escalation', 'manager', 'supervisor',
  'never agreed', 'was promised', 'legal', 'lawyer', 'sue',
  'switching to',
];

const FRUSTRATION_KEYWORDS = [
  'unacceptable', 'completely unacceptable',
  'extremely frustrated', 'very frustrated',
  'days with no response', 'no one has responded', 'been waiting',
  'ignored', 'nobody helped',
];

const HIGH_KEYWORDS = [
  'urgent', 'asap', 'immediately', 'right now', 'critical',
  'down', 'outage', 'blocked', "can't work", 'production',
];

const MEDIUM_KEYWORDS = [
  'not working', 'issue', 'problem', 'broken',
  'incorrect charge', 'wrong plan', 'confused',
  'upgrade', 'downgrade', 'pricing', 'plan change',
];

const NEGATIVE_CONTEXT = [
  'cancel', 'escalate', 'manager', 'supervisor', 'never',
  'unacceptable', 'wrong', 'sue', 'legal',
];

export function calculateUrgency(message) {
  const lower = message.toLowerCase();

  for (const keyword of CHURN_ESCALATION_KEYWORDS) {
    if (lower.includes(keyword)) return 'High';
  }

  for (const keyword of FRUSTRATION_KEYWORDS) {
    if (lower.includes(keyword)) return 'High';
  }

  // "immediately" in a negative context also triggers High
  if (lower.includes('immediately') && NEGATIVE_CONTEXT.some(k => lower.includes(k))) {
    return 'High';
  }

  for (const keyword of HIGH_KEYWORDS) {
    if (lower.includes(keyword)) return 'High';
  }

  for (const keyword of MEDIUM_KEYWORDS) {
    if (lower.includes(keyword)) return 'Medium';
  }

  return 'Low';
}

/**
 * Applies category-based urgency floors.
 * Escalation/Complaint is always at least Medium — Low is never appropriate
 * when a customer has signaled displeasure or churn intent.
 *
 * @param {string} category
 * @param {string} urgency - Raw urgency from calculateUrgency
 * @returns {string}
 */
export function resolveUrgency(category, urgency) {
  if (category === 'Escalation/Complaint' && urgency === 'Low') return 'Medium';
  if (category === 'Feature Request' && urgency === 'High') return 'Medium';
  return urgency;
}
