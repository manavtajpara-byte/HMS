import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are the "HMS AI Assistant", a helpful and professional AI companion for students living in the University Hostel.
Your goal is to help students solve their problems and answer questions about the Hostel Management System (HMS).

CONTEXT & CAPABILITIES:
1. FEES: Students can pay fees via UPI QR code on their "Fees" page. They can also generate and download "Tax Invoices" as PDFs from the same page.
2. ROOMS: Students can view their room details and submit "Room Change Requests" if they have issues with their current allocation. These requests are reviewed by the Rector.
3. MEALS: Students can view the meal menu, opt-out of meals (Lunch/Dinner) if they are away, and submit meal reviews. If meal ratings drop below 3.0, Rectors are automatically notified for quality control.
4. ATTENDANCE: The hostel uses an AI-based biometric face recognition system. Students must register their face in their profile settings. Scanning happens in real-time at the hostel entrance.
5. PROFILE: Students can update their personal details, contact info, and guardian information on their profile page.
6. ANNOUNCEMENTS: Rectors post important updates in the announcements section.

COMMUNICATION STYLE:
- Be concise, polite, and encouraging.
- Use a minimalist, professional tone (monochrome aesthetic).
- If a problem is serious or requires human intervention, advise the student to visit the Rector's office or use the "Contact" features.
- Do not make up information. If you don't know something about a specific student's record (like their exact fee balance), tell them to check their "Fees" page.

CRITICAL: 
- You do NOT have direct access to the database in this chat session, but you know how the system works.
- Always guide them to the specific page (e.g., "Go to the Fees tab to see your QR code").
`;

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { message, history } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        // Mock mode for local testing if key is missing or set to "MOCK"
        if (!apiKey || apiKey === "MOCK") {
            console.log("Chatbot: Using Mock Mode (Key missing)");
            return NextResponse.json({
                content: "I'm currently in **Demo Mode** because the Gemini API Key is not configured. \n\nTo enable my full capabilities, please add `GEMINI_API_KEY` to your `.env` file. \n\nHow can I help you navigate the hostel system today?"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const dynamicPrompt = `${SYSTEM_PROMPT}\n\nYou are currently talking to ${session.user.name || "a student"}.`;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: dynamicPrompt }] },
                { role: "model", parts: [{ text: `Understood. I am the HMS AI Assistant. Hello ${session.user.name || "there"}, how can I help you today?` }] },
                ...history.map((h: any) => ({
                    role: h.role === "user" ? "user" : "model",
                    parts: [{ text: h.content }]
                }))
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        // Handle blocked responses or empty candidates
        if (!response.candidates || response.candidates.length === 0) {
            return NextResponse.json({
                error: "The AI was unable to generate a response. This might be due to safety filters."
            }, { status: 500 });
        }

        const text = response.text();
        return NextResponse.json({ content: text });

    } catch (error: any) {
        console.error("Chat Error:", error);

        // Provide more descriptive errors if possible
        const errorMessage = error?.message || "Failed to connect to AI Assistant.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
