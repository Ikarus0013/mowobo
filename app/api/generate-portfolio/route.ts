import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const STYLE_PROMPTS = {
  commercial: {
    base: 'Professional commercial headshot, clean and approachable',
    variations: [
      'Professional headshot with confident smile, clean white background, studio lighting',
      'Commercial portrait with neutral expression, business attire, soft lighting',
      'Approachable headshot with slight smile, clean background, professional lighting',
      'Corporate headshot with serious expression, clean background, professional studio setup',
      'Commercial portrait with warm smile, clean background, soft professional lighting',
      'Professional headshot with confident expression, clean background, studio lighting'
    ]
  },
  fashion: {
    base: 'High-end fashion editorial portrait, artistic and striking',
    variations: [
      'Fashion editorial portrait with dramatic lighting, high-end styling, artistic composition',
      'Editorial headshot with strong expression, dramatic lighting, fashion-forward styling',
      'Artistic fashion portrait with unique angle, dramatic lighting, editorial style',
      'High-fashion headshot with striking expression, dramatic lighting, luxury styling',
      'Editorial portrait with artistic composition, dramatic lighting, fashion-forward look',
      'Fashion headshot with confident expression, dramatic lighting, high-end styling'
    ]
  },
  beauty: {
    base: 'Beauty-focused portrait, highlighting facial features and skin',
    variations: [
      'Beauty portrait with flawless skin, soft lighting, makeup-focused styling',
      'Close-up beauty headshot with glowing skin, soft lighting, skincare-focused',
      'Beauty editorial with perfect skin, soft lighting, makeup artistry',
      'Skincare-focused portrait with radiant skin, soft lighting, natural beauty',
      'Beauty headshot with flawless complexion, soft lighting, makeup artistry',
      'Beauty portrait with glowing skin, soft lighting, skincare-focused styling'
    ]
  },
  lifestyle: {
    base: 'Casual lifestyle portrait, natural and relatable',
    variations: [
      'Casual lifestyle headshot with natural expression, soft natural lighting',
      'Relatable portrait with genuine smile, natural lighting, casual styling',
      'Lifestyle headshot with natural expression, soft lighting, everyday styling',
      'Casual portrait with warm smile, natural lighting, approachable styling',
      'Lifestyle headshot with natural expression, soft lighting, casual fashion',
      'Relatable portrait with genuine expression, natural lighting, everyday styling'
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Portfolio generation API called')
    const { imageData, style, photoType } = await request.json()

    if (!imageData || !style || !photoType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const styleConfig = STYLE_PROMPTS[style as keyof typeof STYLE_PROMPTS]
    if (!styleConfig) {
      return NextResponse.json(
        { error: 'Invalid style selected' },
        { status: 400 }
      )
    }

    console.log(`Generating ${style} portfolio for ${photoType} photo`)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const generatedImages = []

    // Generate 6 variations
    for (let i = 0; i < 6; i++) {
      try {
        const prompt = `${styleConfig.variations[i]}, based on this reference photo, maintain the person's facial features and identity while applying the professional styling and lighting described. Generate a high-quality professional portrait that matches the reference person's appearance.`

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
        const imageData = await response.text()
        
        // For now, we'll return the prompt as the "image" since Gemini doesn't return actual images
        // In a real implementation, you'd use an image generation model
        generatedImages.push({
          id: `img_${i + 1}`,
          url: `data:image/jpeg;base64,${imageData}`, // Placeholder
          style: style,
          prompt: styleConfig.variations[i],
          isSelected: false
        })

        console.log(`Generated variation ${i + 1} for ${style}`)
      } catch (error) {
        console.error(`Error generating variation ${i + 1}:`, error)
        // Continue with other variations
      }
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      style: style,
      totalGenerated: generatedImages.length
    })

  } catch (error) {
    console.error('Error generating portfolio:', error)
    return NextResponse.json(
      { error: 'Failed to generate portfolio' },
      { status: 500 }
    )
  }
}
