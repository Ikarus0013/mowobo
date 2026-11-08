# Mowobo

Mowobo is a web app that checks model reference photos with Google Gemini and is a first step to an AI model portfolio.

## What it does

You upload reference photos of one person in different poses. Google Gemini examines each photo and gives a score, feedback and suggestions. Gemini also tells if the photo is good enough as an AI reference. Then you select a portfolio style. The app asks Gemini for six style variations of one photo.

**CAUTION:** The portfolio step does not make real images. Refer to "Limits".

## Requirements

- Node.js 18.17 or later.
- npm (included with Node.js).
- A Google AI Studio account and a Gemini API key: <https://aistudio.google.com/app/apikey>.

## Install

1. Get the code:

   ```bash
   git clone https://github.com/Ikarus0013/mowobo.git
   ```

2. Go into the project folder:

   ```bash
   cd mowobo
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Copy the example environment file:

   ```bash
   cp .env.example .env.local
   ```

5. Write your Gemini API key into the `.env.local` file. Refer to "Configure".

## Configure

Put these values in the `.env.local` file in the project root.

| Variable | Required | Description | Where to get it |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Key for Google Gemini. Only the server uses it. | <https://aistudio.google.com/app/apikey> |
| `NEXT_PUBLIC_APP_URL` | No | Public URL of the app. The current code does not read it. | Your own URL, for example `http://localhost:3000`. |

**CAUTION:** Do not commit the `.env.local` file. It contains your private key.

## Use

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open <http://localhost:3000> in your browser.
3. Drag your photos into the upload area, or click the area to select files.
4. Give each photo the correct type (face, profile, half body, full body or walking).
5. Continue to the quality check.
6. Read the score, the feedback and the suggestions for each photo.
7. Continue to the style step and select a style (commercial, fashion, beauty or lifestyle).
8. Start the portfolio step and look at the results.

## How it works

1. The browser changes each photo to Base64 text.
2. The browser sends the photo to `/api/analyze-photo`.
3. The server sends the photo and a prompt to Gemini. Gemini sends back a JSON answer with a score and feedback.
4. For the portfolio, the browser sends one photo and a style to `/api/generate-portfolio`.
5. The server asks Gemini six times, one time for each style variation.

The API key stays on the server. The browser does not get the key.

## Files

| Path | Description |
| --- | --- |
| `app/page.tsx` | Main page. Controls the steps (upload, check, style, portfolio). |
| `app/api/analyze-photo/route.ts` | API route for the photo quality check. |
| `app/api/generate-portfolio/route.ts` | API route for the portfolio step. |
| `components/PhotoUpload.tsx` | Photo upload area. |
| `components/QualityChecker.tsx` | Shows the quality check results. |
| `components/StyleSelection.tsx` | Style selection. |
| `components/PortfolioGeneration.tsx` | Shows the portfolio results. |
| `lib/gemini.ts` | Browser functions that call the API routes. |
| `types/` | TypeScript types. |

## Limits

- `npm run build` stops with TypeScript errors at this time. `npm run dev` can still start the app. Refer to the list below.
  - `app/api/generate-portfolio/route.ts`: a variable `imageData` is used before its declaration.
  - `components/PhotoUpload.tsx`, `components/QualityChecker.tsx` and `lib/gemini.ts`: type errors.
- The portfolio step does not make images. Gemini sends back text, and the app shows this text as an image address. The images do not show correctly.
- The code uses the model `gemini-1.5-flash`. Google can remove old models. If you get an error, change the model name in the API routes.
- The app does not save photos or results.
- Do not upload photos of other persons without their permission.

## License

MIT. Refer to the `LICENSE` file.
