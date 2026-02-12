# Specification

## Summary
**Goal:** Improve Android file-selection permission behavior so permission prompts only appear when truly needed, request the correct permission set, and provide a clear, predictable in-app permission UX.

**Planned changes:**
- Refine Android permission-check logic around file selection to avoid unnecessary OS prompts, avoid incomplete/incorrect permission requests for the chosen picker mode, and keep Android 12-and-below vs Android 13+ handling deterministic.
- Ensure non-Android (web) file picking never triggers any permission flow and always proceeds directly to the browser file picker.
- Update the file-selection UI to introduce an in-app rationale step (English) before requesting runtime permissions, with clear actions (e.g., Continue / Not now).
- After permission denial, replace repeated OS prompting with a persistent, user-friendly message and next steps (e.g., Try again, Open settings when available, or manual settings instructions).
- Update all permission-related strings (hook + file picker UI) to be accurate, consistent, English-only, and Android-version-appropriate; adjust the inline error banner wording to match the new flow.
- Add/loading states during permission checks to prevent opening the picker until permission status is known.

**User-visible outcome:** On Android, users see a clear explanation before any permission request, are not spammed by repeated OS prompts after denying, and can reliably proceed to file picking when no permission is required; on web, the file picker opens directly without any permission flow.
