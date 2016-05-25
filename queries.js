var Datastore = require('nedb');
    
    
var quizDB = new Datastore({ filename: 'quiz.nedb', autoload: true });
var questionDB = new Datastore({ filename: 'question.nedb', autoload: true });
var answerDB = new Datastore({ filename: 'answer.nedb', autoload: true });

function getQuestionsFor(quizId) {
  return new Promise(function (resolve, reject) {
    // quizDB.findOne({ _id: quizId }, function (err, quiz) {
    //   if (err) reject(err);
      questionDB.find({ quizId: quizId }, function (err, questions) {
        if (err) reject(err);
        resolve(questions);
      })
    // })  
  });
}

function getAllFor(quizId) {
  return new Promise(function (resolve, reject) {
    getQuestionsFor(quizId).then(function (questions) {
      
      var result = Promise.all(
        questions.map(function (q) {
          return new Promise(function (resolve, reject) {
            answerDB.find( { questionId: q._id }, function (err, answers) {
              if (err) reject(err);
              
              q.answers = answers;
              resolve(q);
            })  
          });
        })  
      );
      
      resolve(result);
      
    });
  })
}

function getAllQuizes() {
  return new Promise(function (resolve, reject) {
    quizDB.find({}, function (err, quizes) {
      if (err) reject(err);
      
      resolve(quizes);
    });
  }); 
}

function getQuestionWithAnswersFor(questionId) {
  return new Promise(function (resolve, reject) {
    questionDB.findOne({_id: questionId}, function (err, question) {
      if (err) reject(err);
      
      answerDB.find({questionId: question._id}, function (err, answers) {
        if (err) reject(err);
        
        question.answers = answers;
        resolve(question);
      })
    })
  })
}

function getAnswersFor(questionId) {
  
}

// getQuestionsFor('Quiz1').then(function (questions) {
//   console.log(questions);
// });

// getAllFor('Quiz1').then(function (questions) {
//   console.log(questions);
// })

module.exports = {
  getAllFor,
  getAllQuizes,
  getQuestionsFor,
  getQuestionWithAnswersFor,
  getAnswersFor,
};