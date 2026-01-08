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

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: "AI Assistant is currently in maintenance mode (API Key missing). Please contact administration."
            }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Understood. I am the HMS AI Assistant. How can I help you today?" }] },
                ...history.map((h: any) => ({
                    role: h.role === "user" ? "user" : "model",
                    parts: [{ text: h.content }]
                }))
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ content: text });
    } catch (error) {
        console.error("Chat Error:", error);
        return NextResponse.json({ error: "Failed to connect to AI Assistant." }, { status: 500 });
    }
}
