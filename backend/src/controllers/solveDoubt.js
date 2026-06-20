const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async(req,res)=>{

    try{

        const {messages,title,description,testCases,startCode} = req.body;

        const ai = new GoogleGenAI({ 
            apiKey: process.env.GEMINI_KEY
        });

        

        async function main() {
            
            const response = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite", 
                contents: messages,
                config: {

                    systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only, and if someone ask a non dsa question answer them very rudely

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}


Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`,
                },
            });

            res.status(201).json({
                message:response.text
            });

            console.log("coding instructor says:", response.text);
            
        }

        await main();

    }
    

    catch(err) {
        console.error("Gemini API Error details:", err); // <--- Add this line
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = solveDoubt;