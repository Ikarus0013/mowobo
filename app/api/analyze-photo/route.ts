import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    console.log('API route called - starting photo analysis')
    const { imageData, photoType } = await request.json()

    if (!imageData || !photoType) {
      console.log('Missing imageData or photoType')
      return NextResponse.json(
        { error: 'Missing imageData or photoType' },
        { status: 400 }
      )
    }

    console.log('Calling Gemini API...')
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
    Analyze this ${photoType} photo for AI-generated modeling portfolio use. 
    Since this will be used as a reference for AI image generation, the standards are more lenient than traditional modeling.
    
    Evaluate the following aspects:
    1. Face visibility and clarity (1-10) - Can the AI see facial features clearly?
    2. Image sharpness (1-10) - Is the photo reasonably clear?
    3. Subject positioning (1-10) - Is the main subject well-framed?
    4. Overall usability for AI (1-10) - Would this work as a reference photo?
    
    IMPORTANT: Approve photos that are "good enough" for AI reference, even if not perfect studio quality.
    A decent selfie or casual photo can work fine for AI generation.
    
    Provide:
    - Overall score (1-10)
    - Brief feedback on what's good and what could be better
    - 2-3 simple suggestions for improvement (if needed)
    - Whether this photo is approved for AI portfolio generation (true/false)
    
    Format your response as JSON:
    {
      "score": number,
      "feedback": "string",
      "suggestions": ["string1", "string2", "string3"],
      "isApproved": boolean
    }
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      }
    ])

    const response = await result.response
    console.log('Got response from Gemini')
    const text = await response.text()
    console.log('Response text:', text.substring(0, 200) + '...')
    
    // Clean the response text - remove markdown code blocks
    let cleanText = text.trim()
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Try to parse JSON response
    try {
      const parsed = JSON.parse(cleanText)
      console.log('Parsed JSON successfully')
      return NextResponse.json({
        score: parsed.score || 5,
        feedback: parsed.feedback || 'Analysis completed',
        suggestions: parsed.suggestions || ['No specific suggestions'],
        isApproved: parsed.isApproved || false
      })
    } catch (parseError) {
      console.log('JSON parse error:', parseError)
      console.log('Cleaned text:', cleanText)
      // Fallback if JSON parsing fails
      return NextResponse.json({
        score: 5,
        feedback: cleanText || 'Analysis completed',
        suggestions: ['Review the feedback for specific improvements'],
        isApproved: false
      })
    }
  } catch (error) {
    console.error('Error analyzing photo quality:', error)
    return NextResponse.json(
      {
        score: 0,
        feedback: 'Error analyzing photo. Please try again.',
        suggestions: ['Ensure photo is clear and well-lit', 'Try uploading a different photo'],
        isApproved: false
      },
      { status: 500 }
    )
  }
}
