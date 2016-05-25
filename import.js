var fs = require('fs');
var Datastore = require('nedb');
    
    
var quizDB = new Datastore({ filename: 'quiz.nedb', autoload: true });
var questionDB = new Datastore({ filename: 'question.nedb', autoload: true });
var answerDB = new Datastore({ filename: 'answer.nedb', autoload: true });


function loadFromFile(filename) {
  const EOF = '\r\n';
  var txt = fs.readFileSync(filename, 'utf-8');
  return txt.split(EOF);
}

function getQuizName(lines) {
  return lines[0];
}

function getNextQuestion(lines) {
  while (actLine !== lines.length && lines[actLine][0] !== 'Q') {
    actLine++;
  }
  if (actLine === lines.length) {
    return false;
  }
  return lines[actLine].substr(2);
}

function getNextAnswer(lines) {
  actLine++;
  if (actLine !== lines.length && 
         (lines[actLine][0] === 'A' || lines[actLine][0] === 'C')) {
    return {
      answer: lines[actLine].substr(2),
      correct: lines[actLine][0] === 'C',
    };
  }
  return false;
}

function saveNextQuestion(quiz) {
  var q;
  if (q = getNextQuestion(lines)) {
    questionDB.insert({ 
      question: q,
      quizId: quiz._id, 
    }, function (err, insertedQuestion) {
      console.log(insertedQuestion);
      saveNextAnswer(quiz, insertedQuestion);
    });
  }
}

function saveNextAnswer(quiz, question) {
  var a;
  if (a = getNextAnswer(lines)) {
    a.questionId = question._id;
    answerDB.insert(a, function (err, insertedAnswer) {
      saveNextAnswer(quiz, question);
    })
  } else {
    saveNextQuestion(quiz);
  }
}

var actLine;
var lines;

function importQuiz(filename) {
  actLine = 1;
  lines = loadFromFile(filename);
  var quiz = getQuizName(lines);
  // console.log(quiz);
  quizDB.insert({ name: quiz, }, function (err, insertedQuiz) {
    console.log(insertedQuiz);
    saveNextQuestion(insertedQuiz);  
  })
}

importQuiz('quiz2.txt');
