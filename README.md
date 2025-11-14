# AI Medical Voice Agent

## Project Description

AI Medical Voice Agent is an innovative solution designed to streamline the preliminary patient evaluation process for healthcare providers. By leveraging advanced AI voice technology, the system automates the gathering of basic patient information, medical history, and symptoms, allowing doctors to dedicate more time to diagnosis and treatment. This project aims to reduce physician burnout, decrease patient wait times, and enhance the overall efficiency of medical consultations.

## Features

- **AI-Powered Voice Consultation**: Patients can interact with an AI voice agent to provide their medical history and symptoms in a natural conversational manner.
- **Structured Clinical Reports**: The system generates comprehensive and structured reports from patient consultations, highlighting key information such as chief complaint, summary of symptoms, duration, severity, and recommendations.
- **Physician Dashboard**: A dedicated dashboard for physicians to review past consultations, access AI-generated reports, and initiate new consultations with various AI medical specialists (e.g., General Physician, Pediatrician, Dermatologist, Nutritionist).
- **Specialized AI Agents**: Offers different AI medical specialists tailored to specific medical fields, providing more focused and accurate preliminary evaluations.
- **User-Friendly Interface**: A clean and intuitive user interface ensures a seamless experience for both patients and healthcare professionals.
- **Secure Authentication**: Integrated sign-in and sign-up processes ensure secure access to the platform.

## Screenshots

### Landing Page
<img width="2940" height="1592" alt="image" src="https://github.com/user-attachments/assets/8780b841-7d0e-42c4-987a-3a3cbf2567c1" />


### Consultation Dashboard
<img width="2930" height="1604" alt="image" src="https://github.com/user-attachments/assets/dffd269a-9d9a-4704-a04c-f5b0f00048fb" />


### Physician Call Interface
<img width="2446" height="1232" alt="image" src="https://github.com/user-attachments/assets/2b5160f7-28aa-48d8-a97a-103afc36db13" />


### Medical Report
<img width="1858" height="1594" alt="image" src="https://github.com/user-attachments/assets/0737813a-1441-483b-8984-93fcf5a8fc13" />



## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ai-medical-voice-agent.git
   cd ai-medical-voice-agent
   ```
2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   ```
3. Set up environment variables:
   Create a `.env.local` file in the root directory and add your environment variables (e.g., database connection strings, API keys).

4. Run the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Technologies Used

- Next.js (React Framework)
- TypeScript
- Drizzle ORM (for database interactions)
- Tailwind CSS (for styling)
- Clerk (for authentication)
- Vapi.ai (for AI voice interactions)

## Future Enhancements

- Integration with Electronic Health Record (EHR) systems.
- Advanced analytics for clinic performance and AI agent accuracy.
- Multi-language support for voice consultations.
- Customizable consultation flows for different medical specialties.
- Mobile application for patients and physicians.
