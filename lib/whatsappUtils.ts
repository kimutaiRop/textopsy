/**
 * Normalizes WhatsApp quoted messages to prevent AI confusion.
 * 
 * In WhatsApp, when you quote someone's message, the format is:
 * "PersonName" wrote: [quoted message]
 * Your reply
 * 
 * This can confuse AI into thinking the quoted person wrote the entire message.
 * This function adds clear markers to distinguish quoted vs actual messages.
 */

export function normalizeWhatsAppQuotes(text: string): string {
  if (!text) return text;

  // Pattern 1: "Name" wrote: (followed by message)
  // Pattern 2: "Name": (followed by message)
  // Pattern 3: Quoted message lines that appear before a reply
  
  // Common WhatsApp quote patterns
  // Matches: "Name" wrote: or "Name": at start of line
  let normalized = text.replace(
    /^"([^"]+)"\s*(?:wrote:|:)\s*(.+)$/gim,
    (match, quotedName, quotedMessage) => {
      return `[QUOTED FROM ${quotedName}] ${quotedMessage}\n[END QUOTE]`;
    }
  );

  // Pattern: Lines that might be quoted messages (often indented or with special formatting)
  // Look for patterns like:
  // - Indented text after a name
  // - Forwarded messages
  
  // Additional pattern: Forwarded messages
  normalized = normalized.replace(
    /Forwarded\s+from\s+[^:]+:\s*(.+)$/gim,
    '[FORWARDED MESSAGE] $1 [END FORWARD]'
  );

  // Pattern: Messages with "‎" (zero-width characters often used in WhatsApp formatting)
  // This is harder to detect, so we'll rely on the AI instructions

  return normalized;
}

/**
 * Adds a clarifying header about WhatsApp quotes to conversation text
 */
export function addWhatsAppQuoteContext(text: string): string {
  const header = `[IMPORTANT: WhatsApp Quote Context]
In WhatsApp conversations, when someone quotes a message, it appears as:
"PersonName" wrote: [quoted message]

This means the quoted person is NOT the one who wrote the message containing the quote.
The person who wrote the message containing "PersonName" wrote: is the actual sender.

Quoted messages are marked with [QUOTED FROM PersonName] ... [END QUOTE] tags below.

=== Conversation ===\n\n`;
  
  return header + text;
}

