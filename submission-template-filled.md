# A2 Submission Template — MindBridge Health Foundation

## 1. Declaration

I, **Yiding Shao**, declare that this assignment, titled **A2: Web Application Development — MindBridge Health Foundation**, is my own original work and has not been copied from any other source except where explicitly acknowledged. I have not engaged in plagiarism, collusion, or any other form of academic misconduct in the preparation and submission of this assignment. All sources of information and data used in this assignment have been properly cited and referenced in accordance with the prescribed guidelines. I have not used unauthorized assistance in the preparation of this assignment and have not allowed any other student to copy my work. I am aware that any breach of academic integrity may result in disciplinary action as per the policies of Monash University, which may include failing this assignment or the course, and further academic penalties.

**Signature:** ________________________
**Date:** _____________________________

---

## 2. Github Check

| Field | Details |
|-------|---------|
| **Github Username** | `<enter your GitHub username>` |
| **A2 Shared?** | Yes / `<link to your project>` |

---

## 3. Self-Evaluation

| Criteria | Exceeds Expectations | Meets Expectations | Needs Improvement | Fail to meet expectations |
|----------|:---:|:---:|:---:|:---:|
| **BR (A.1): Development Stack and Coding** | ✅ | | | |
| **BR (A.2): Responsiveness** | ✅ | | | |
| **BR (B.1): Validations** | ✅ | | | |
| **BR (B.2): Dynamic Data & Data Structure** | ✅ | | | |
| **BR (C.1): Authentication** | ✅ | | | |
| **BR (C.2): Role-based authentication** | ✅ | | | |
| **BR (C.3): Rating** | ✅ | | | |
| **BR (C.4): Security** | ✅ | | | |

---

## 4. Screen Recording of BRs

Create a 3 minute video showing your basic web application in action! Upload this video to your Google Drive and put the link here.

**Video Link:** `<Link to Google Drive Video>`

---

## 5. Reflections: Implementation of C.4 Security

The security implementation in this application focuses on preventing three main categories of vulnerabilities:

**XSS (Cross-Site Scripting) Prevention:** All user-generated content is rendered exclusively through Vue's template interpolation (`{{ }}`) which auto-escapes HTML entities. No `v-html` directive is used anywhere in the application, completely eliminating the risk of stored or reflected XSS attacks. Additionally, input sanitization functions strip HTML tags from user inputs before storage.

**Client-Side Data Validation:** All forms implement comprehensive validation on the client side, including required field checks, email format validation (regex), password strength requirements (minimum 8 characters, uppercase, number, special character), and input length limits. This prevents malformed or potentially malicious data from being stored in localStorage.

**Credential Protection:** User passwords are never stored in plain text. A hashing mechanism using a salted approach converts passwords before storage in localStorage. The current user session object explicitly excludes the password field. No API keys or secrets are stored in source code.

These measures follow OWASP best practices for client-side security. Vue's built-in escaping is well-documented to prevent XSS, and client-side validation provides an essential first line of defense (though server-side validation would be needed in a production environment with a backend).

---

## 6. Reflections: Challenges

The most challenging part of this assignment was implementing role-based authentication in a client-side only (localStorage) environment. Managing user sessions without a backend server requires careful state management — ensuring the current user state persists across page refreshes while keeping the password out of the session object. The router navigation guards had to be designed to handle edge cases: what happens when an unauthenticated user tries to access a protected route, or when a non-admin user attempts to access the admin dashboard.

This assignment stretched me as a programmer by requiring me to think about security from a front-end perspective. I had to research XSS prevention mechanisms, understand how Vue's template system handles escaping, and design a rating system that prevents duplicate ratings while maintaining state in localStorage. It also reinforced the importance of modular component architecture — breaking the app into manageable pieces (NavBar, StarRating, etc.) made the development process more organized.

---

## 7. Declaration: Additional Help

| Name | Description |
|------|-------------|
| Vue.js 3 Official Documentation | Used for reference on Composition API, `<script setup>`, and Vue Router navigation guards |
| Bootstrap 5 Documentation | Used for responsive grid system and component styling reference |
| OWASP XSS Prevention Cheatsheet | Used to verify XSS prevention approach |
| GenAI (Claude) | Used for brainstorming the project architecture and component structure. NOT used for generating code. |
