var fs = require('fs');
var Datastore = require('nedb-promise');
    
    
var quizDB = new Datastore({ filename: 'quiz.nedb', autoload: true });
var questionDB = new Datastore({ filename: 'question.nedb', autoload: true });
var answerDB = new Datastore({ filename: 'answer.nedb', autoload: true });

var actLine = 1;
var lines;

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

async function importQuiz(filename) {

  lines = loadFromFile(filename); 
  var quizName = getQuizName(lines);
  var quiz = await quizDB.insert({ name: quizName, });
  console.log(quiz);
  
  var q, a;
  while (q = getNextQuestion(lines)) {
    var question = await questionDB.insert({ 
      question: q,
      quizId: quiz._id, 
    });
    
    while (a = getNextAnswer(lines)) {
      a.questionId = question._id;
      await answerDB.insert(a);
    }
  }
  
}

importQuiz('quiz1.txt');



