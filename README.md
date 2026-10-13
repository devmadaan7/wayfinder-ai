# Wayfinder AI — Travel Orchestration Prototype

A premium React + Vite front-end prototype for a multimodal travel orchestration agent. It runs locally without an API key.

## Features
- Compare flight, train, bus and cab options for one route.
- Feasibility checks: direct end-to-end road/bus/train modes are marked unavailable for India ↔ Bali in this demo.
- Cheapest, fastest and best-overall recommendations.
- Rule-based natural-language assistant with sample prompts.
- Journey combination lab for first-mile, main journey and last-mile segments.
- Clear labels that fares are illustrative, not live provider quotes.
- Explainability page documenting the local decision logic.

## Important limitations
This is an AI-style prototype using a deterministic local rules engine, not a trained model or a remote LLM. All prices and schedules are illustrative estimates. It does not verify actual service availability, provide bookings, or access live fares. For production, integrate provider APIs and a secure backend.

## Run it
1. Install Node.js LTS from https://nodejs.org/ if needed.
2. Extract this ZIP.
3. Open the extracted `ai-travel-orchestrator-ai-prototype` folder in VS Code.
4. Open Terminal → New Terminal.
5. Run:

   ```bash
   npm install
   npm run dev
   ```

6. Open the local URL Vite prints (usually http://localhost:5173/).
7. Keep the terminal running while you use the website.

## Demo script for presentation
1. Chennai → Bengaluru, 2 travellers. Compare all four modes.
2. Change “Optimize for” to Lowest cost and then Shortest time. Observe the recommendation scores change.
3. Ask the assistant: “Can I take a cab from India to Bali?”
4. Set destination to Bali, Indonesia. Show unavailable direct ground modes and the conceptual flight + local transfer plan.
5. Open “How it decides” to explain feasibility checks, normalized cost/time and weighted scoring.

## Tech stack
React 18, Vite 6, lucide-react. No API key and no server-side dependencies.
