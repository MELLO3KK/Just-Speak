# Speaking Practice App (Flask Version)

A web-based speaking practice application built with Flask that helps users improve their speaking skills through interactive exercises with speech recognition and accuracy scoring.

## Features

- **JSON Import**: Upload custom practice questions and answers via JSON file
- **Speech Recognition**: Use browser-based Web Speech API to transcribe spoken answers
- **Text-to-Speech**: Listen to questions and expected answers using browser TTS
- **Accuracy Scoring**: Get real-time feedback using Levenshtein distance algorithm
- **Progress Tracking**: Visual progress bar shows your advancement through questions
- **Retry Mechanism**: Practice until you achieve 80% or higher accuracy
- **Keyboard Shortcuts**: Press Spacebar to start speech recognition
- **Responsive Design**: Works on desktop and mobile browsers

## Project Structure

```
Flask/
├── app.py                 # Flask backend application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── sample-data.json      # Sample practice questions
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── styles.css    # Application styles
    └── js/
        └── app.js        # Frontend JavaScript
```

## Prerequisites

- Python 3.10 or higher
- A modern web browser with Web Speech API support (Chrome or Edge recommended)
- Microphone access for speech recognition

## Installation

1. Navigate to the Flask directory:
   ```bash
   cd Flask
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask server:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## How to Use the App

### Importing Questions

1. Click **"Import JSON File"** to upload your own practice questions
2. Or click **"Load Sample Data"** to use the included sample questions
3. The app will validate your JSON file and show any errors

### Practicing

1. Click **"Start Practice"** to begin
2. Click **"Start Speaking"** (or press Spacebar) to record your answer
3. Speak clearly into your microphone
4. Click **"Stop"** when finished, or wait for automatic detection
5. View your transcribed answer and accuracy score
6. If accuracy is below 80%, click **"Try Again"** to retry
7. If accuracy is 80% or higher, click **"Next Question"** to proceed

### Text-to-Speech

- Click the 🔊 button next to "Question" to hear the question
- Click the 🔊 button next to "Target Answer" to hear the expected answer

### Completing Practice

- After answering all questions, you'll see a completion message
- Click **"Start Over"** to restart from the beginning

## JSON Format

Your JSON file must be an array of objects, each containing `question` and `answer` fields:

```json
[
  {
    "question": "What is your name?",
    "answer": "My name is John."
  },
  {
    "question": "Where do you live?",
    "answer": "I live in Bangkok."
  },
  {
    "question": "What do you do for work?",
    "answer": "I am a software developer."
  }
]
```

### Validation Rules

- The root element must be an array
- Each item must be an object
- Each item must have:
  - `question`: non-empty string
  - `answer`: non-empty string

## Browser Support

### Speech Recognition

- **Best Support**: Google Chrome, Microsoft Edge
- **Limited Support**: Safari, Firefox (may require flags or extensions)
- **No Support**: Internet Explorer

### Text-to-Speech

- Supported in most modern browsers including Chrome, Edge, Firefox, and Safari

### Important Notes

1. **Microphone Access**: The browser will request microphone permission on first use. You must allow access for speech recognition to work.

2. **Localhost Requirement**: For security reasons, microphone access typically requires either:
   - `localhost` (which this app uses)
   - HTTPS connection

3. **Internet Connection**: Some browsers may require an internet connection for the Web Speech API to function, as speech recognition may use cloud services.

4. **Chrome/Edge Recommended**: For the best experience, use Google Chrome or Microsoft Edge, which have the most complete Web Speech API implementations.

## Troubleshooting

### Speech Recognition Not Working

1. **Check Browser Compatibility**: Ensure you're using Chrome or Edge
2. **Allow Microphone Access**: Check browser permissions and allow microphone access
3. **Check Internet Connection**: Some browsers need internet for speech recognition
4. **Refresh the Page**: Sometimes the speech API needs a page refresh to initialize properly

### "No Speech Detected" Error

1. Speak more clearly and loudly
2. Check that your microphone is working in other applications
3. Ensure no other application is独占 (exclusive) use of the microphone

### "Microphone Permission Denied"

1. Click the lock icon in the browser's address bar
2. Change microphone permission to "Allow"
3. Refresh the page

### Text-to-Speech Not Working

1. Check browser compatibility
2. Ensure your system volume is not muted
3. Try a different browser if issues persist

### JSON Import Fails

1. Verify your JSON is valid using a JSON validator
2. Ensure the root element is an array `[...]`
3. Check that each item has both `question` and `answer` fields
4. Make sure strings are properly quoted

## Accuracy Calculation

The app calculates accuracy using the Levenshtein distance algorithm:

1. Both spoken and expected answers are normalized (trimmed and lowercased)
2. Levenshtein distance counts the minimum edits needed to transform one string to another
3. Similarity is calculated as: `((maxLength - distance) / maxLength) * 100`
4. Result is rounded to one decimal place
5. **Pass threshold**: 80% or higher

## License

This project is provided as-is for educational purposes.

## Credits

Built with:
- Flask (Python web framework)
- Web Speech API (Browser speech recognition)
- Speech Synthesis API (Browser text-to-speech)
