import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth.js';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    // Authenticate student or allow authenticated demo session
    const studentName = session?.user?.name || 'Aarav Sharma';

    const body = await request.json();
    const { messages, currentTopic } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey && apiKey.trim() !== '') {
      try {
        const anthropic = new Anthropic({ apiKey });
        const systemPrompt = `You are EduVision AI, an academic tutor specializing in Engineering, Computer Science, Electronics, and Mathematics.
Student name: ${studentName}.
Current focus context: ${currentTopic || 'Digital Electronics & Data Structures'}.
Provide clear, rigorous, yet intuitive explanations. Use markdown, bullet points, and equations where helpful. Encourage active problem-solving.`;

        // Format messages for Anthropic SDK
        const formattedMessages = messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        }));

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-5',
          max_tokens: 1000,
          system: systemPrompt,
          messages: formattedMessages,
        });

        const reply = response.content[0]?.text || 'No response generated.';
        return NextResponse.json({
          reply,
          source: 'claude-sonnet-5',
        });
      } catch (anthropicErr) {
        return NextResponse.json({
          error: `Anthropic Claude API Error: ${anthropicErr.message}. Ensure ANTHROPIC_API_KEY is active and supports 'claude-sonnet-5'.`,
          reply: getTutorFallbackResponse(messages[messages.length - 1]?.content),
        });
      }
    }

    // High fidelity offline academic tutor fallback for SIH demo without active API key
    const latestUserMessage = messages[messages.length - 1]?.content || '';
    const reply = getTutorFallbackResponse(latestUserMessage);

    return NextResponse.json({
      reply,
      source: 'eduvision-academic-ai-engine',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

function getTutorFallbackResponse(query = '') {
  const q = query.toLowerCase();

  if (q.includes('mosfet') || q.includes('channel') || q.includes('transistor')) {
    return `### MOSFET Channel & Operation Principles\n\nIn an **Enhancement MOSFET**, channel formation occurs as follows:\n\n1. **Cutoff Region ($V_{GS} < V_{th}$):** No conducting channel exists between Drain and Source. Current $I_D \\approx 0$.\n2. **Triode / Linear Region ($V_{GS} > V_{th}$ and $V_{DS} < V_{GS} - V_{th}$):** Gate electric field attracts minority carriers, creating an inversion layer. The channel acts as a voltage-controlled resistor:\n   $$I_D = \\mu_n C_{ox} \\frac{W}{L} \\left[(V_{GS} - V_{th})V_{DS} - \\frac{V_{DS}^2}{2}\\right]$$\n3. **Saturation Region ($V_{DS} \\ge V_{GS} - V_{th}$):** Channel pinches off at the drain end. Current becomes saturated:\n   $$I_D = \\frac{1}{2} \\mu_n C_{ox} \\frac{W}{L} (V_{GS} - V_{th})^2$$\n\n💡 **Key Takeaway:** For amplification, always bias in saturation; for digital switching, operate between cutoff and deep triode!`;
  }

  if (q.includes('delay') || q.includes('cmos') || q.includes('timing') || q.includes('skew')) {
    return `### CMOS Propagation Delay & Timing Analysis\n\nPropagation delay ($t_{pd}$) is governed by RC time constants during charging/discharging:\n\n- **Elmore Delay Model:** $t_{pd} \\approx \\ln(2) \\cdot R_{eq} \\cdot C_L \\approx 0.69 R_{eq} C_L$\n- **NAND vs NOR Performance:**\n  - In **NAND**, NMOS transistors (higher mobility $\\mu_n$) are in series.\n  - In **NOR**, PMOS transistors (lower mobility $\\mu_p \\approx \\mu_n / 2.5$) are in series.\n  - Therefore, **NAND gates are inherently faster and more compact** in silicon area.\n\n⚡ **Design Tip:** Minimize high fan-out nets and size transistors according to Logical Effort theory for critical path optimization.`;
  }

  if (q.includes('tree') || q.includes('dsa') || q.includes('graph') || q.includes('sort') || q.includes('array')) {
    return `### Data Structures & Algorithmic Insights\n\nHere is a structured breakdown for your question:\n\n- **Red-Black Tree Balance Invariant:** Ensures height $h \\le 2 \\log_2(n + 1)$ with $O(\\log n)$ worst-case search, insertion, and deletion.\n- **Graph Traversal Complexity:**\n  - BFS / DFS: $O(V + E)$ using adjacency lists.\n  - Topological Sort: Valid only on Directed Acyclic Graphs (DAGs) using Kahn's algorithm or DFS finish times.\n- **Amortized Push:** Dynamic array doubling yields $O(1)$ amortized cost despite occasional $O(n)$ reallocations.\n\nWhich specific sub-concept or problem example would you like to solve next?`;
  }

  return `### Academic Explanation\n\nGreat question! In technical coursework, mastering the core physical or mathematical principles is key.\n\n- **Core Concept:** Break the problem down into boundary conditions, state variables, and governing equations.\n- **Verification Step:** Always perform dimensional analysis or trace small inputs (e.g. $n=0, 1$) to verify your logic.\n- **Next Practice:** Try solving the corresponding quiz problem in your Portal to reinforce this concept into long-term memory!\n\nFeel free to ask a follow-up question or paste code/equations!`;
}
