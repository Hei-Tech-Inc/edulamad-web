/**
 * Downloadable `edulamad-questions-template.json` — matches {@link validateQuestions} expectations.
 */
export const QUESTION_UPLOAD_TEMPLATE_FILE = 'edulamad-questions-template.json';

export const QUESTION_UPLOAD_TEMPLATE_JSON = `[
  {
    "courseCode": "COSC 201",
    "university": "KNUST",
    "year": 2023,
    "examSession": "Final 2023",
    "questionNumber": 1,
    "questionText": "Which of the following data structures uses LIFO ordering?",
    "type": "mcq",
    "options": [
      "A. Queue",
      "B. Stack",
      "C. Linked List",
      "D. Binary Tree"
    ],
    "sectionLabel": "Section A",
    "marks": 2,
    "topic": "Stacks and Queues",
    "difficulty": "easy",
    "solution": {
      "correctAnswer": "B",
      "explanation": "A Stack uses LIFO ordering — last in, first out.",
      "keyPoints": ["Stack = LIFO", "Queue = FIFO"]
    }
  },
  {
    "courseCode": "COSC 201",
    "university": "KNUST",
    "year": 2023,
    "examSession": "Final 2023",
    "questionNumber": 2,
    "questionText": "Explain the difference between a stack and a queue. Give one real-world example of each.",
    "type": "essay",
    "sectionLabel": "Section B",
    "marks": 10,
    "topic": "Data Structures",
    "difficulty": "medium",
    "solution": {
      "modelAnswer": "A stack is a LIFO data structure...",
      "keyPoints": [
        "Stack: LIFO — browser back button",
        "Queue: FIFO — print queue"
      ]
    }
  }
]
`;
