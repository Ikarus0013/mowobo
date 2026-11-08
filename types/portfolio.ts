export interface StyleOption {
  id: string
  name: string
  description: string
  icon: string
  color: string
  examples: string[]
}

export interface GeneratedImage {
  id: string
  url: string
  style: string
  prompt: string
  isSelected: boolean
}

export interface PortfolioStyle {
  id: string
  name: string
  description: string
  prompt: string
  variations: number
}

export interface RefinementPrompt {
  id: string
  label: string
  prompt: string
  category: 'expression' | 'lighting' | 'style' | 'background'
}
