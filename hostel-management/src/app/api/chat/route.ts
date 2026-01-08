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
            const lowerMsg = message.toLowerCase();
            let response = "I'm currently in **Basic Mode** (API Key not set). I can still help with general info!";

            if (lowerMsg.includes("fee") || lowerMsg.includes("pay") || lowerMsg.includes("invoice")) {
                response = "To manage your **Fees**, go to the **Fees** tab in the sidebar. There you can scan the **UPI QR Code** to pay and download your **PDF Tax Invoices**.";
            } else if (lowerMsg.includes("room") || lowerMsg.includes("change")) {
                response = "You can view your room details or request a change in the **Room Change** section. Your requests will be reviewed by the Rector.";
            } else if (lowerMsg.includes("meal") || lowerMsg.includes("food") || lowerMsg.includes("menu")) {
                response = "Check the **Meal Reviews** section to see today's menu, submit feedback, or opt-out of meals if you'll be away.";
            } else if (lowerMsg.includes("attendance") || lowerMsg.includes("face") || lowerMsg.includes("register")) {
                response = "We use **AI Face Recognition**. Make sure to register your face in your **Profile Settings** so you can scan in at the entrance.";
            } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
                response = `Hello ${session.user.name || "there"}! I'm your HMS Assistant. I can help you with fees, room requests, meals, or attendance. What's on your mind?`;
            } else {
                response = "I'm in basic mode right now. You can ask me about **fees**, **room changes**, **meal menus**, or **face attendance**!";
            }

            return NextResponse.json({ content: response });
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
