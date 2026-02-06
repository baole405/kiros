Hi Bao Le,

Thank you for your interest in the Full Stack Developer role. We enjoyed reviewing your profile and would like to invite you to the next stage: a practical technical assessment.

The Objective
We are evaluating your ability to build a Full Stack MVP that integrates Generative AI. We are not testing your ability to memorize syntax. We are testing your ability to architect, debug, and ship production-ready software using modern tools.

Tools & Methodology

AI Usage: You are required/highly encouraged to use AI coding assistants such as Cursor, Windsurf, or Claude Code to accelerate your development.

The Test: Since the AI will handle the boilerplate code, we will be grading you strictly on Engineering Depth:

How you handle edge cases the AI missed.

How you structure your database and async logic.

How you verify and validate the AI's output.

Instructions Please choose ONE of the following two challenges to complete. You have 7 days to complete this assignment.

Constraints for Both Options:

Frontend: Next.js (React)

Backend: FastAPI (Python) OR Node.js (Express)

Database: PostgreSQL

AI Provider: Any LLM. 

Option A: The AI Support "Triage & Recovery" Hub
Goal: Build a system that ingests user complaints and asynchronously turns them into prioritized, "ready-to-send" drafts.

1. The Ingestion API (The "Bottle-Neck" Test)

Create a POST /tickets endpoint.

Constraint: The AI processing (which takes 3-5 seconds) must not block the HTTP response. The API must return a 201 Created status immediately to the user, while the AI processing happens in the background.

2. The AI Triage Engine (Background Worker)

Implement a background task that calls an LLM to:

Categorize: (Billing, Technical, Feature Request).

Score: Sentiment (1-10) and Urgency (High/Medium/Low).

Draft: A polite, context-aware response.

Constraint: Ensure the AI returns valid JSON so your database stores the Category and Score as distinct fields, not just text.

3. The Agent Dashboard

List View: Show tickets color-coded by Urgency (Red/Green).

Detail View: Allow an agent to edit the AI draft and click "Resolve" (updating the database).

Option B: The Career "Gap Architect"
Goal: An app where a user uploads a Resume and a Job Description (JD), and the AI maps out a precise "Gap Analysis" and learning path.

1. The "Semantic Diff" Engine

Create an interface to accept "Resume Text" and "Target Job Description."

Constraint: Implement a Validation Layer. If the AI returns malformed data, the system should catch it or handle the error gracefully without crashing the frontend.

2. The Analysis Logic

The AI must extract:

Missing Skills: Tech present in the JD but absent in the Resume.

3 Concrete Steps: (e.g., "Build a CRUD app using Docker").

3 Interview Questions: Specifically targeting the identified gaps.

Constraint: Implement Caching. If a user submits the exact same Resume and JD twice, return the result from the Database immediately without calling the AI API again.

3. The "Growth" UI

Use a Markdown Viewer to render the Roadmap and Questions cleanly.

Display "Missing Skills" as visual tags (e.g., red badges).

Submission Requirements
Code Repository: A link to your public GitHub repo.

Video Walkthrough (Loom, max 5 mins):

Demonstrate the app working.

Crucial: Verbally explain how you handled the engineering constraints (e.g., "How I handled the background processing").

Tooling: Briefly mention how utilizing AI (Cursor/Windsurf) changed your workflow or helped you solve a specific bug.

Setup Instructions: A clear README.md or Docker Compose file to run the app locally.

Please reply to this email with your submission when you are ready.

Good luck! We look forward to seeing your work.

Best regards,
Kiros Hiring Team

