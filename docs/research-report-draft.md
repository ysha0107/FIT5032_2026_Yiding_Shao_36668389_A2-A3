# Research Report — Topic B: Strategies for Using GenAI in JavaScript Debugging

> **Draft for Yiding Shao (36668389) — MUST personalise before submission.**
> Replace bracketed placeholders, swap the example details for your real experience,
> and insert screenshots of YOUR debugging prompts with the GenAI tool into Section 5.
> Word count target: 1000 (±10%). This draft runs ~1000 words excluding references.

---

## 1. Introduction

Modern web applications are increasingly asynchronous and framework-heavy, which makes JavaScript debugging one of the most time-consuming activities in web development. Generative AI (GenAI) tools such as large-language-model coding assistants have recently changed how developers approach this work: instead of only searching documentation or reading code, a developer can now converse with a model about an error. This report explores Topic B by analysing five practical strategies for using GenAI in JavaScript debugging. For each strategy, the report explains the approach, illustrates it with an example from the MindBridge Health Foundation project — a Vue 3 application built with Firebase, FullCalendar and Leaflet — and critically evaluates its benefits and drawbacks. The report concludes with a reflection on the wider impact of GenAI on debugging practices.

## 2. Main Body

### Strategy 1: Explaining error messages and stack traces

Pasting an error message and its stack trace into a GenAI tool produces a plain-language explanation of what failed and why. This strategy is most valuable with unfamiliar libraries. During the MindBridge project, the browser threw `Cannot read properties of undefined (reading 'seconds')` on the admin dashboard. The assistant explained that Firebase Firestore timestamps are objects containing a `seconds` field rather than native `Date` objects, and that `new Date(timestamp)` therefore fails silently. The benefit is speed of comprehension: framework-specific data shapes that would take several documentation pages to infer are explained in seconds. The drawback is accuracy risk — the model can confidently misattribute an error to the wrong component or propose a fix that targets a symptom rather than the cause, so every explanation must be verified against the actual code and official documentation.

### Strategy 2: Generating minimal reproductions

A second strategy is asking the model to extract the failing behaviour into a minimal standalone reproduction. Isolating the bug in a small snippet removes surrounding application noise and often reveals the root cause directly. In the MindBridge project, a booking-conflict check behaved unexpectedly with adjacent time slots; a minimal reproduction of the overlap comparison (`start < b.end && end > b.start`) made the boundary conditions explicit and confirmed that slots ending exactly when another begins should not conflict. The benefit is that minimal cases are easy to reason about and can become permanent unit tests. The drawback is loss of context: a reproduction that diverges from the real environment (e.g. missing time-zone handling) can "fix" a problem that does not exist in production, or miss one that does.

### Strategy 3: Hypothesis-driven root-cause dialogue

Rather than requesting an immediate fix, the developer can propose competing hypotheses to the model and ask it to test each one against the evidence. This turns debugging into a structured dialogue: "Could the race be caused by the router mounting before the auth listener fires?" In the MindBridge app, the router guard initially read authentication state from localStorage, which is synchronous; migrating to Firebase made the state asynchronous and produced a redirect loop on first load. The assistant confirmed the hypothesis — the guard ran before the first `onAuthStateChanged` callback — and suggested awaiting the first callback before mounting the application. The benefit is pedagogical: the developer understands the failure mechanism, not just the fix. The drawback is that the dialogue is only as good as the hypotheses supplied; a model may agree with an incorrect premise, so independent verification remains essential.

### Strategy 4: Suggesting and explaining candidate fixes

Asking the model for several alternative fixes with trade-offs supports informed decision-making. In the MindBridge project, Leaflet's default marker icons disappeared under the Vite bundler because the icon URLs are resolved at runtime. The assistant suggested importing the PNG assets and re-registering them through `L.Icon.Default.mergeOptions`, and explained why a CDN fallback would be less reliable. Evaluating options before editing reduces churn. The drawback is that generated fixes can introduce new problems — deprecated APIs, security weaknesses such as unsanitised `innerHTML`, or unnecessary dependencies — so each candidate must be reviewed and tested against the project's constraints before adoption.

### Strategy 5: Generating regression tests from bugs

Once a bug is understood and fixed, the model can generate a regression test that captures the corrected behaviour. In the MindBridge project, the booking-conflict and business-hours rules were extracted into pure functions (`hasConflict`, `isWithinBusinessHours`) and each fixed bug became a `node --test` case, so the suite now verifies boundary times, cancelled bookings and weekday restrictions. The benefit is long-term protection: future refactors that reintroduce the bug fail immediately. The drawback is that a test can accidentally encode incorrect behaviour if the developer does not verify that the expectation matches the specification, not just the current implementation.

## 3. Reflection

Across the five strategies, a pattern emerges: GenAI is most effective as a reasoning partner and documentation accelerator, and least trustworthy as an oracle. It dramatically shortens the time spent understanding unfamiliar errors and exploring fixes, but every output still requires the developer's judgment, verification against documentation, and regression testing. The overall impact on web development is likely a shift of developer effort from searching and recalling to reviewing and verifying. Ethically, developers must remain accountable for AI-assisted code, disclose its use, and be alert to hallucinated APIs and over-reliance, which can erode debugging skill over time. Future trends point toward agentic tools that run and verify fixes themselves, making the review loop — not the fix generation — the developer's primary responsibility.

## 4. Conclusion

This report examined five GenAI strategies for JavaScript debugging: explaining errors, generating reproductions, hypothesis-driven dialogue, candidate fixes and regression tests. Each offers clear gains but demands verification. GenAI should be treated as an assistant that accelerates diagnosis, not a substitute for understanding. Further research should evaluate agentic debugging systems and measure their effect on bug-resolution time and code quality in real projects.

## 5. Acknowledgement of AI use

- **Claude Code (Anthropic)** was used during the MindBridge project for debugging: explaining Firebase/Leaflet/FullCalendar error messages, suggesting fixes, and drafting the regression tests in `tests/`. Prompts and responses are shown in the screenshots below; each suggestion was verified against the official documentation and the running application before adoption.
- **Claude Code** also assisted with structuring and polishing this report draft. The final text was reviewed and edited by me; all example scenarios describe my own project and debugging sessions.

**Screenshots of prompts (insert your own):**
1. `<SCREENSHOT 1: prompt asking to explain a console error>`
2. `<SCREENSHOT 2: prompt asking for candidate fixes + the model's reply>`
3. `<SCREENSHOT 3: prompt generating a regression test>`

**How AI-generated content was refined:** explanations were shortened, project-specific details were corrected against the actual code, and all references were checked manually.

## 6. References

[1] J. White et al., "ChatGPT Prompt Patterns for Improving Code Quality, Refactoring, Requirements Elicitation, and Software Design," arXiv:2303.07839, 2023.

[2] S. I. Ross, F. Martinez, S. Houde, M. Muller, and J. D. Weisz, "The Programmer's Assistant: Conversational Interaction with a Large Language Model for Software Development," in Proc. 28th Int. Conf. Intelligent User Interfaces (IUI '23), Sydney, Australia, 2023, pp. 491–514.

[3] A. Fan et al., "Large Language Models for Software Engineering: Survey and Open Problems," arXiv:2310.03533, 2023.

[4] X. Hou et al., "Large Language Models for Software Engineering: A Systematic Literature Review," ACM Transactions on Software Engineering and Methodology, vol. 33, no. 8, 2024.

[5] N. M. S. Surameery and M. Y. Shakor, "Use Chat GPT to Solve Programming Bugs," International Journal of Information Technology and Computer Engineering, vol. 3, no. 1, pp. 17–22, 2023.
