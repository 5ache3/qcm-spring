// DOM elements
const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const explanationElement = document.getElementById('explanation');
const newQuestionBtn = document.getElementById('new-question');
const revealAnswerBtn = document.getElementById('reveal-answer');
const answerRevealElement = document.getElementById('answer-reveal');
const scoreElement = document.createElement('div');
scoreElement.className = 'score-display';
document.querySelector('.quiz-container').prepend(scoreElement);

// Game state
let questions = [];
let currentQuestion = null;
let selectedAnswers = [];
let firstTryCorrect = 0;
let totalQuestionsAttempted = 0;

// Load questions from JSON file
fetch('qcm.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    questions = data;
    loadRandomQuestion();
    updateScore();
  })
  .catch(error => {
    console.error('Error loading questions:', error);
    questionElement.textContent = 'Failed to load questions. Please refresh the page.';
  });

function loadRandomQuestion() {
  if (questions.length === 0) return;
  
  // Reset UI and state for new question
  optionsElement.innerHTML = '';
  explanationElement.style.display = 'none';
  answerRevealElement.textContent = '';
  selectedAnswers = [];
  
  // Get random question
  const randomIndex = Math.floor(Math.random() * questions.length);
  currentQuestion = questions[randomIndex];
  
  // Display question
  questionElement.textContent = currentQuestion.quetion;
  
  // Display options
  currentQuestion.options.forEach(option => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option';
    optionElement.innerHTML = `<span class="letter">${option.letter}.</span>${option.text}`;
    optionElement.dataset.letter = option.letter;
    
    optionElement.addEventListener('click', function() {
      if (this.classList.contains('selected')) {
        // Deselect if already selected
        this.classList.remove('selected');
        selectedAnswers = selectedAnswers.filter(a => a !== this.dataset.letter);
      } else {
        // Select if not selected
        this.classList.add('selected');
        selectedAnswers.push(this.dataset.letter);
      }
      
      // Check if all correct answers are selected
      checkAnswerCompletion();
    });
    
    optionsElement.appendChild(optionElement);
  });
}

function checkAnswerCompletion() {
  if (!currentQuestion) return;
  
  const correctAnswers = currentQuestion.answer.split(',').map(a => a.trim());
  const allCorrectSelected = correctAnswers.every(a => selectedAnswers.includes(a));
  const noIncorrectSelected = selectedAnswers.every(a => correctAnswers.includes(a));
  
  if (allCorrectSelected && noIncorrectSelected && selectedAnswers.length === correctAnswers.length) {
    // All correct answers selected with no incorrect ones
    totalQuestionsAttempted++;
    
    // Check if this was first try (no incorrect selections ever made)
    if (document.querySelectorAll('.option.incorrect').length === 0) {
      firstTryCorrect++;
    }
    
    // Highlight all correct answers
    correctAnswers.forEach(letter => {
      document.querySelector(`.option[data-letter="${letter}"]`).classList.add('correct');
    });
    
    // Show explanation
    explanationElement.textContent = currentQuestion.explication;
    explanationElement.style.display = 'block';
    
    // Show success message
    answerRevealElement.textContent = `Correct! Les réponses sont ${currentQuestion.answer}.`;
    answerRevealElement.style.color = 'green';
    
    updateScore();
  } else if (selectedAnswers.length === correctAnswers.length) {
    // Wrong combination selected
    totalQuestionsAttempted++;
    
    // Highlight correct and incorrect answers
    const correctAnswers = currentQuestion.answer.split(',').map(a => a.trim());
    correctAnswers.forEach(letter => {
      document.querySelector(`.option[data-letter="${letter}"]`).classList.add('correct');
    });
    
    selectedAnswers.forEach(letter => {
      if (!correctAnswers.includes(letter)) {
        document.querySelector(`.option[data-letter="${letter}"]`).classList.add('incorrect');
      }
    });
    
    // Show explanation
    explanationElement.textContent = currentQuestion.explication;
    explanationElement.style.display = 'block';
    
    // Show failure message
    answerRevealElement.textContent = `Incorrect. Les bonnes réponses sont ${currentQuestion.answer}.`;
    answerRevealElement.style.color = 'red';
    
    updateScore();
  }
}

function updateScore() {
  scoreElement.textContent = `Score: ${firstTryCorrect}/${totalQuestionsAttempted} points : ${totalQuestionsAttempted > 0 ? Math.round((firstTryCorrect - (totalQuestionsAttempted-firstTryCorrect))) : 0}`;
}

// Reveal all answers (manual reveal button)
revealAnswerBtn.addEventListener('click', function() {
  if (!currentQuestion) return;
  
  const correctAnswers = currentQuestion.answer.split(',').map(a => a.trim());
  
  // Highlight all correct answers
  correctAnswers.forEach(letter => {
    document.querySelector(`.option[data-letter="${letter}"]`).classList.add('correct');
  });
  
  // Highlight incorrect selections
  selectedAnswers.forEach(letter => {
    if (!correctAnswers.includes(letter)) {
      document.querySelector(`.option[data-letter="${letter}"]`).classList.add('incorrect');
    }
  });
  
  // Show explanation
  explanationElement.textContent = currentQuestion.explication;
  explanationElement.style.display = 'block';
  
  // Show answer message
  answerRevealElement.textContent = `Les réponses correctes sont ${currentQuestion.answer}.`;
  answerRevealElement.style.color = 'black';
  
  // Count as attempted if not already
  if (totalQuestionsAttempted === 0 || 
      !document.querySelector('.option.correct') || 
      document.querySelector('.option.incorrect')) {
    totalQuestionsAttempted++;
    updateScore();
  }
});

// New question button
newQuestionBtn.addEventListener('click', loadRandomQuestion);