# morich Attract Scripter

(株)morichのキャリアエージェントが、求職者との面談中に、特定の求人への応募意思を効果的に引き出すための「最高級のアトラクトトーク」を生成するアプリ。

## Development

This project uses Vite, React, TypeScript, and Tailwind CSS.

### Prerequisites

- Node.js (v18 or later recommended)
- A Vercel account for deployment

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rururu5581/attract-planner.git
    cd attract-planner
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add your Gemini API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Deployment

This application is configured for easy deployment on Vercel.

1.  Push your code to your GitHub repository.
2.  Import the project into Vercel from your GitHub repository.
3.  Set the `API_KEY` environment variable in the Vercel project settings.
4.  Vercel will automatically build and deploy the application.
