// Quiz and Survey Data Management

// Default quiz questions for different courses
export const defaultQuizQuestions = {
  preTest: [
    {
      id: 1,
      question: "What is your current experience level with this topic?",
      type: "multiple_choice",
      options: [
        "Beginner - No prior experience",
        "Intermediate - Some experience",
        "Advanced - Extensive experience",
        "Expert - Professional level"
      ],
      correctAnswer: 0 // This is subjective, so any answer is correct
    },
    {
      id: 2,
      question: "How confident do you feel about learning this subject?",
      type: "multiple_choice",
      options: [
        "Very confident",
        "Somewhat confident",
        "Neutral",
        "Not very confident",
        "Not confident at all"
      ],
      correctAnswer: 0
    }
  ],
  postTest: [
    {
      id: 1,
      question: "How would you rate your understanding of the course material?",
      type: "multiple_choice",
      options: [
        "Excellent - I understand everything",
        "Good - I understand most concepts",
        "Fair - I understand some concepts",
        "Poor - I understand very little"
      ],
      correctAnswer: 0
    },
    {
      id: 2,
      question: "Which topic did you find most challenging?",
      type: "text",
      placeholder: "Please describe the most challenging topic..."
    }
  ]
};

// Default survey questions
export const defaultSurveyQuestions = [
  {
    id: 1,
    question: "How would you rate the overall course quality?",
    type: "rating",
    scale: 5
  },
  {
    id: 2,
    question: "How clear were the course instructions?",
    type: "rating",
    scale: 5
  },
  {
    id: 3,
    question: "How engaging was the course content?",
    type: "rating",
    scale: 5
  },
  {
    id: 4,
    question: "What did you like most about this course?",
    type: "text",
    placeholder: "Please share what you enjoyed most..."
  },
  {
    id: 5,
    question: "What suggestions do you have for improving this course?",
    type: "text",
    placeholder: "Please share your suggestions for improvement..."
  }
];

// Quiz data storage (in a real app, this would be in a database)
let quizData = {
  // courseId: { preTest: [...], postTest: [...] }
};

// Survey data storage
let surveyData = {
  // courseId: [...questions]
};

// Quiz management functions
export const getQuizQuestions = (courseId, quizType) => {
  if (!quizData[courseId]) {
    quizData[courseId] = {
      preTest: [...defaultQuizQuestions.preTest],
      postTest: [...defaultQuizQuestions.postTest]
    };
  }
  return quizData[courseId][quizType] || [];
};

export const saveQuizQuestions = (courseId, quizType, questions) => {
  if (!quizData[courseId]) {
    quizData[courseId] = { preTest: [], postTest: [] };
  }
  quizData[courseId][quizType] = questions;
  return true;
};

export const addQuizQuestion = (courseId, quizType, question) => {
  const questions = getQuizQuestions(courseId, quizType);
  const newQuestion = {
    ...question,
    id: Date.now() // Simple ID generation
  };
  questions.push(newQuestion);
  saveQuizQuestions(courseId, quizType, questions);
  return newQuestion;
};

export const updateQuizQuestion = (courseId, quizType, questionId, updatedQuestion) => {
  const questions = getQuizQuestions(courseId, quizType);
  const index = questions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updatedQuestion };
    saveQuizQuestions(courseId, quizType, questions);
    return questions[index];
  }
  return null;
};

export const deleteQuizQuestion = (courseId, quizType, questionId) => {
  const questions = getQuizQuestions(courseId, quizType);
  const filteredQuestions = questions.filter(q => q.id !== questionId);
  saveQuizQuestions(courseId, quizType, filteredQuestions);
  return true;
};

// Survey management functions
export const getSurveyQuestions = (courseId) => {
  if (!surveyData[courseId]) {
    surveyData[courseId] = [...defaultSurveyQuestions];
  }
  return surveyData[courseId];
};

export const saveSurveyQuestions = (courseId, questions) => {
  surveyData[courseId] = questions;
  return true;
};

export const addSurveyQuestion = (courseId, question) => {
  const questions = getSurveyQuestions(courseId);
  const newQuestion = {
    ...question,
    id: Date.now()
  };
  questions.push(newQuestion);
  saveSurveyQuestions(courseId, questions);
  return newQuestion;
};

export const updateSurveyQuestion = (courseId, questionId, updatedQuestion) => {
  const questions = getSurveyQuestions(courseId);
  const index = questions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    questions[index] = { ...questions[index], ...updatedQuestion };
    saveSurveyQuestions(courseId, questions);
    return questions[index];
  }
  return null;
};

export const deleteSurveyQuestion = (courseId, questionId) => {
  const questions = getSurveyQuestions(courseId);
  const filteredQuestions = questions.filter(q => q.id !== questionId);
  saveSurveyQuestions(courseId, filteredQuestions);
  return true;
};

// Export all quiz and survey data (for backup/export purposes)
export const exportAllData = () => {
  return {
    quizData,
    surveyData,
    timestamp: new Date().toISOString()
  };
};

// Import quiz and survey data (for restore/import purposes)
export const importAllData = (data) => {
  if (data.quizData) {
    quizData = data.quizData;
  }
  if (data.surveyData) {
    surveyData = data.surveyData;
  }
  return true;
};