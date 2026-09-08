/**
 * Speaking Practice App - Frontend JavaScript
 * Handles speech recognition, text-to-speech, and UI interactions.
 */

// Application State
let practiceData = [];
let currentIndex = 0;
let isListening = false;
let recognition = null;
let synth = null;

// DOM Elements
const importSection = document.getElementById('import-section');
const practiceSection = document.getElementById('practice-section');
const jsonFileInput = document.getElementById('json-file-input');
const importBtn = document.getElementById('import-btn');
const importStatus = document.getElementById('import-status');
const startPracticeBtn = document.getElementById('start-practice-btn');
const startSpeakingBtn = document.getElementById('start-speaking-btn');
const stopBtn = document.getElementById('stop-btn');
const tryAgainBtn = document.getElementById('try-again-btn');
const nextBtn = document.getElementById('next-btn');
const listenQuestionBtn = document.getElementById('listen-question-btn');
const listenAnswerBtn = document.getElementById('listen-answer-btn');
const currentQuestionEl = document.getElementById('current-question');
const targetAnswerEl = document.getElementById('target-answer');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const loadingIndicator = document.getElementById('loading-indicator');
const resultsSection = document.getElementById('results-section');
const spokenAnswerEl = document.getElementById('spoken-answer');
const expectedAnswerDisplayEl = document.getElementById('expected-answer-display');
const accuracyScoreEl = document.getElementById('accuracy-score');
const feedbackMessageEl = document.getElementById('feedback-message');
const completionSection = document.getElementById('completion-section');
const restartBtn = document.getElementById('restart-btn');

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeSpeechRecognition();
    initializeTextToSpeech();
    setupEventListeners();
});

/**
 * Initialize Speech Recognition
 */
function initializeSpeechRecognition() {
    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        showImportStatus('Speech recognition is not supported in your browser. Please use Chrome or Edge.', 'error');
        return;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        updateListeningUI();
    };
    
    recognition.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            }
        }
        
        if (finalTranscript) {
            spokenAnswerEl.textContent = finalTranscript;
        }
    };
    
    recognition.onerror = (event) => {
        handleSpeechError(event.error);
    };
    
    recognition.onend = () => {
        isListening = false;
        hideLoading();
        updateButtonsAfterRecognition();
    };
}

/**
 * Handle speech recognition errors
 */
function handleSpeechError(error) {
    console.error('Speech recognition error:', error);
    
    let errorMessage = '';
    
    switch (error) {
        case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
        case 'audio-capture':
            errorMessage = 'Microphone not found. Please connect a microphone.';
            break;
        case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
        default:
            errorMessage = 'An error occurred during speech recognition.';
    }
    
    // Show error in the results section instead of alert
    showInlineMessage(errorMessage, 'error');
    hideLoading();
    startSpeakingBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
}

/**
 * Show inline message in results section
 */
function showInlineMessage(message, type) {
    feedbackMessageEl.textContent = message;
    feedbackMessageEl.className = `feedback-message ${type}`;
}

/**
 * Initialize Text-to-Speech
 */
function initializeTextToSpeech() {
    synth = window.speechSynthesis;
    
    if (!synth) {
        console.warn('Text-to-speech is not supported in this browser.');
        listenQuestionBtn.disabled = true;
        listenAnswerBtn.disabled = true;
    }
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
    // Import button click
    importBtn.addEventListener('click', () => {
        jsonFileInput.click();
    });
    
    // File input change
    jsonFileInput.addEventListener('change', handleFileSelect);
    
    // Start practice button
    startPracticeBtn.addEventListener('click', startPractice);
    
    // Start speaking button
    startSpeakingBtn.addEventListener('click', startSpeaking);
    
    // Stop button
    stopBtn.addEventListener('click', stopSpeaking);
    
    // Try again button
    tryAgainBtn.addEventListener('click', tryAgain);
    
    // Next question button
    nextBtn.addEventListener('click', nextQuestion);
    
    // Listen buttons
    listenQuestionBtn.addEventListener('click', () => speakText(currentQuestionEl.textContent));
    listenAnswerBtn.addEventListener('click', () => speakText(targetAnswerEl.textContent));
    
    // Restart button
    restartBtn.addEventListener('click', restartPractice);
    
    // Keyboard shortcut (Spacebar to start speaking)
    document.addEventListener('keydown', handleKeyboardShortcut);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcut(event) {
    // Only trigger on spacebar
    if (event.code !== 'Space') return;
    
    // Don't trigger if recognition is already active
    if (isListening) return;
    
    // Don't trigger if start speaking button is hidden or disabled
    if (startSpeakingBtn.classList.contains('hidden')) return;
    if (startSpeakingBtn.disabled) return;
    
    // Prevent default page scrolling
    event.preventDefault();
    
    // Start speaking
    startSpeaking();
}

/**
 * Handle file selection
 */
async function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    await uploadJsonFile(file);
    
    // Reset file input so the same file can be selected again
    jsonFileInput.value = '';
}

/**
 * Upload JSON file to server
 */
async function uploadJsonFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/api/import-json', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            handleImportSuccess(result.data);
        } else {
            handleImportError(result.error);
        }
    } catch (error) {
        handleImportError('Failed to connect to server. Please try again.');
    }
}

/**
 * Handle successful import
 */
function handleImportSuccess(data) {
    practiceData = data;
    currentIndex = 0;
    
    showImportStatus(`Successfully loaded ${practiceData.length} question(s)!`, 'success');
    
    // Hide import section, show practice section
    setTimeout(() => {
        importSection.classList.add('hidden');
        practiceSection.classList.remove('hidden');
        initializePractice();
    }, 1500);
}

/**
 * Handle import error
 */
function handleImportError(error) {
    showImportStatus(error, 'error');
}

/**
 * Show import status message
 */
function showImportStatus(message, type) {
    importStatus.textContent = message;
    importStatus.className = `status-message ${type}`;
}

/**
 * Initialize practice session
 */
function initializePractice() {
    // Reset UI
    resultsSection.classList.add('hidden');
    completionSection.classList.add('hidden');
    startPracticeBtn.classList.remove('hidden');
    startSpeakingBtn.classList.add('hidden');
    stopBtn.classList.add('hidden');
    tryAgainBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    // Display first question
    displayCurrentQuestion();
}

/**
 * Start practice (hide start button, prepare for speaking)
 */
function startPractice() {
    startPracticeBtn.classList.add('hidden');
    startSpeakingBtn.classList.remove('hidden');
    displayCurrentQuestion();
}

/**
 * Display current question and answer
 */
function displayCurrentQuestion() {
    const currentItem = practiceData[currentIndex];
    currentQuestionEl.textContent = currentItem.question;
    targetAnswerEl.textContent = currentItem.answer;
    
    // Update progress
    const progress = ((currentIndex + 1) / practiceData.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `Question ${currentIndex + 1} of ${practiceData.length}`;
    
    // Clear previous results
    spokenAnswerEl.textContent = '';
    expectedAnswerDisplayEl.textContent = '';
    accuracyScoreEl.textContent = '--%';
    accuracyScoreEl.className = 'accuracy-score';
    feedbackMessageEl.textContent = '';
    feedbackMessageEl.className = 'feedback-message';
    resultsSection.classList.add('hidden');
}

/**
 * Start speech recognition
 */
function startSpeaking() {
    if (!recognition) {
        alert('Speech recognition is not available in your browser.');
        return;
    }
    
    try {
        recognition.start();
        showLoading();
    } catch (error) {
        console.error('Failed to start recognition:', error);
        alert('Failed to start speech recognition. Please try again.');
    }
}

/**
 * Stop speech recognition
 */
function stopSpeaking() {
    if (recognition && isListening) {
        recognition.stop();
    }
}

/**
 * Update UI while listening
 */
function updateListeningUI() {
    startSpeakingBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
}

/**
 * Update buttons after recognition ends
 */
function updateButtonsAfterRecognition() {
    stopBtn.classList.add('hidden');
    
    // Only show start speaking again if we have a spoken answer
    if (spokenAnswerEl.textContent.trim()) {
        // Calculate accuracy and show results
        calculateAndDisplayResults();
    } else {
        startSpeakingBtn.classList.remove('hidden');
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Calculate and display results
 */
function calculateAndDisplayResults() {
    const spoken = spokenAnswerEl.textContent;
    const expected = targetAnswerEl.textContent;
    
    // Calculate accuracy using Levenshtein distance
    const accuracy = calculateAccuracy(spoken, expected);
    
    // Display results
    expectedAnswerDisplayEl.textContent = expected;
    accuracyScoreEl.textContent = `${accuracy}%`;
    
    // Determine pass/fail
    const passed = accuracy >= 80;
    
    if (passed) {
        accuracyScoreEl.className = 'accuracy-score pass';
        feedbackMessageEl.textContent = 'Great job! You passed!';
        feedbackMessageEl.className = 'feedback-message pass';
        nextBtn.classList.remove('hidden');
        tryAgainBtn.classList.add('hidden');
    } else {
        accuracyScoreEl.className = 'accuracy-score fail';
        feedbackMessageEl.textContent = 'Keep practicing! Try again to improve.';
        feedbackMessageEl.className = 'feedback-message fail';
        tryAgainBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
}

/**
 * Calculate accuracy using Levenshtein distance
 */
function calculateAccuracy(spoken, expected) {
    // Normalize strings
    const spokenNormalized = spoken.trim().toLowerCase();
    const expectedNormalized = expected.trim().toLowerCase();
    
    // Handle empty strings
    if (spokenNormalized.length === 0 && expectedNormalized.length === 0) {
        return 100.0;
    }
    
    // Calculate max length
    const maxLength = Math.max(spokenNormalized.length, expectedNormalized.length);
    
    if (maxLength === 0) {
        return 100.0;
    }
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(spokenNormalized, expectedNormalized);
    
    // Calculate similarity percentage
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    // Round to one decimal place
    return Math.round(similarity * 10) / 10;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1, s2) {
    if (s1.length < s2.length) {
        return levenshteinDistance(s2, s1);
    }
    
    if (s2.length === 0) {
        return s1.length;
    }
    
    let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
    
    for (let i = 0; i < s1.length; i++) {
        const currentRow = [i + 1];
        
        for (let j = 0; j < s2.length; j++) {
            const insertions = previousRow[j + 1] + 1;
            const deletions = currentRow[j] + 1;
            const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
            
            currentRow.push(Math.min(insertions, deletions, substitutions));
        }
        
        previousRow = currentRow;
    }
    
    return previousRow[previousRow.length - 1];
}

/**
 * Try again (retry current question)
 */
function tryAgain() {
    // Clear previous results
    spokenAnswerEl.textContent = '';
    resultsSection.classList.add('hidden');
    
    // Show start speaking button
    startSpeakingBtn.classList.remove('hidden');
    tryAgainBtn.classList.add('hidden');
}

/**
 * Move to next question
 */
function nextQuestion() {
    currentIndex++;
    
    // Check if we've completed all questions
    if (currentIndex >= practiceData.length) {
        showCompletion();
    } else {
        // Display next question
        displayCurrentQuestion();
        
        // Reset buttons
        startSpeakingBtn.classList.remove('hidden');
        tryAgainBtn.classList.add('hidden');
        nextBtn.classList.add('hidden');
        resultsSection.classList.add('hidden');
    }
}

/**
 * Show completion message
 */
function showCompletion() {
    resultsSection.classList.add('hidden');
    completionSection.classList.remove('hidden');
    
    // Disable speaking controls
    startSpeakingBtn.disabled = true;
    listenQuestionBtn.disabled = true;
    listenAnswerBtn.disabled = true;
}

/**
 * Restart practice from beginning
 */
function restartPractice() {
    currentIndex = 0;
    
    // Re-enable controls
    startSpeakingBtn.disabled = false;
    listenQuestionBtn.disabled = false;
    listenAnswerBtn.disabled = false;
    
    // Hide completion, show practice
    completionSection.classList.add('hidden');
    practiceSection.classList.remove('hidden');
    
    // Reset UI
    startPracticeBtn.classList.remove('hidden');
    startSpeakingBtn.classList.add('hidden');
    tryAgainBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    resultsSection.classList.add('hidden');
    
    // Display first question
    displayCurrentQuestion();
}

/**
 * Speak text using text-to-speech
 */
function speakText(text) {
    if (!synth) {
        alert('Text-to-speech is not supported in your browser.');
        return;
    }
    
    // Cancel any ongoing speech
    synth.cancel();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slow for clarity
    
    // Try to use an English voice
    const voices = synth.getVoices();
    const englishVoice = voices.find(voice => 
        voice.lang.includes('en-US') || voice.lang.includes('en-GB') || voice.lang.includes('en')
    );
    
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    
    // Speak
    synth.speak(utterance);
}
