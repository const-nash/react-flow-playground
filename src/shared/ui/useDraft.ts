import { useEffect, useState } from 'react';
import type { z } from 'zod';

/**
 * Local editable copy of a saved value; resets whenever the saved value changes.
 * Store data is immutable, so a new reference means a real change.
 *
 * The draft may be in an intermediate shape (`Draft`); `schema` turns it into
 * savable `Data`, and its first issue becomes the `error` shown to the user.
 */
export function useDraft<Draft, Data>(
  saved: Draft,
  schema: z.ZodType<Data>,
  isEqual: (a: Draft, b: Draft) => boolean = Object.is,
) {
  const [draft, setDraft] = useState(saved);
  useEffect(() => setDraft(saved), [saved]);

  const parsed = schema.safeParse(draft);
  return {
    draft,
    setDraft,
    dirty: !isEqual(draft, saved),
    reset: () => setDraft(saved),
    error: parsed.success ? undefined : parsed.error.issues[0]?.message,
    /** Validated value; `undefined` while the draft is invalid. */
    value: parsed.success ? parsed.data : undefined,
  };
}
