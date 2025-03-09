import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: NextRequest) {
  try {
    const { credentials, user } = await req.json()

    if (!credentials || !Array.isArray(credentials) || credentials.length === 0) {
      return NextResponse.json({ error: "No credentials provided" }, { status: 400 })
    }

    // Format credentials for the prompt
    const formattedCredentials = credentials
      .map((cred) => `- ${cred.degree} from ${cred.university} (Credential ID: ${cred.id})`)
      .join("\n")

    // Generate a dynamic prompt based on the real credential data
    const prompt = `
    Generate a professional resume for a student with the following details:

    Name: ${user.name}
    
    Education:
    ${formattedCredentials}

    Please create a complete resume with the following sections:
    1. Professional Summary - Based on the academic credentials
    2. Education - Formatted details of the credentials listed above
    3. Skills - Infer relevant skills based on the degrees and institutions
    4. Achievements - Suggest possible achievements based on the academic background

    Format the resume in a professional manner suitable for job applications.
    `

    // Generate the resume using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    return NextResponse.json({ resume: text })
  } catch (error) {
    console.error("Resume generation error:", error)
    return NextResponse.json({ error: "Failed to generate resume" }, { status: 500 })
  }
}

