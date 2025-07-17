
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionIdFromCookie() {
  const match = document.cookie.match(/(?:^|; )demoshop_session_id=([^;]*)/);
  return match ? match[1] : "";
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Ensures a session ID cookie exists, creates one if missing
export async function ensureSessionId() {
  if (!getSessionIdFromCookie()) {
    const cookieName = 'demoshop_session_id';
    // Try to generate session ID using API
    try {
      const res = await fetch('https://dev.demoshop.skyramp.dev/api/v1/generate', {
        headers: { 'Authorization': `Bearer ${getSessionIdFromCookie()}` }
      });
      await sleep(500);
      if (!res.ok) throw new Error('Failed to generate session ID');
      const data = await res.json();
      const sessionId = data.session_id || data.id || '';
      document.cookie = `${cookieName}=${sessionId}; path=/; max-age=31536000`;
      return sessionId;
    } catch (err) {
      // Fallback to random words if API fails
      const words = [
        'apple', 'banana', 'cherry', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet',
        'kilo', 'lima', 'mango', 'november', 'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango',
        'umbrella', 'victor', 'whiskey', 'xray', 'yankee', 'zulu', 'orange', 'peach', 'plum', 'berry',
        'cloud', 'river', 'mountain', 'forest', 'ocean', 'desert', 'prairie', 'meadow', 'valley', 'hill',
        'star', 'moon', 'sun', 'comet', 'nova', 'orbit', 'galaxy', 'asteroid', 'meteor', 'nebula'
      ];
      const pick = () => words[Math.floor(Math.random() * words.length)];
      const sessionId = `${pick()}-${pick()}-${pick()}`;
      document.cookie = `${cookieName}=${sessionId}; path=/; max-age=31536000`;
      return sessionId;
    }
  } else {
    return getSessionIdFromCookie();
  }
}