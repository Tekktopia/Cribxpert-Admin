// utils/email.ts — strip quoted reply chains + template footers so the mail
// trail shows only the actual message body of each email.

const QUOTE_INTRO = /^\s*On\b.+/i;          // "On Sat, May 16, 2026 at 6:44 PM ... "
const FOOTER_MARKERS = [
  /reply directly to this email/i,
  /your response goes straight to our support team/i,
];

/**
 * Returns just the new content the sender actually wrote, removing:
 *  • the "On <date> … wrote:" attribution (even when wrapped over 2–3 lines)
 *  • all subsequent quoted ("> …") lines
 *  • our own template footer ("Reply directly to this email …", "CribXpert · ©")
 */
export function cleanEmailBody(raw: string | null | undefined): string {
  if (!raw) return "";
  const lines = raw.replace(/\r\n/g, "\n").split("\n");

  let cut = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // 1. A quoted block starts here
    if (trimmed.startsWith(">")) {
      cut = i;
      break;
    }

    // 2. Gmail-style attribution line. The "wrote:" can land on this line
    //    or be wrapped onto one of the next ~3 lines.
    if (QUOTE_INTRO.test(line)) {
      const window = lines.slice(i, i + 4).join(" ");
      if (/wrote:\s*$/i.test(window) || /wrote:/i.test(window)) {
        cut = i;
        break;
      }
    }

    // 3. Our template footer leaked into the body
    if (FOOTER_MARKERS.some((re) => re.test(line))) {
      cut = i;
      break;
    }
  }

  let body = lines.slice(0, cut).join("\n");

  // Drop trailing blank lines / stray separators
  body = body.replace(/\n{3,}/g, "\n\n").replace(/[\s\-—_]+$/g, "").trim();

  return body || raw.trim();
}
