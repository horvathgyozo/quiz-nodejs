var express = require('express');
var queries = require('./queries');
var session = require('express-session');
var NedbStore = require('nedb-session-store')(session);
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var app = express();
var numberOfQuestionsPerQuiz = 5;

// view engine setup
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    cookie: { 
      path: '/',
      httpOnly: true,
      maxAge: 6000000 
    },
    secret: 'secret code',
    resave: false,
    saveUninitialized: false,
    store: new NedbStore({
      filename: 'session.nedb'
    }),
}));
app.use(flash());

// endpoints
app.get('/', function (req, res) {
  
  queries.getAllQuizes().then(function (quizes) {
    res.render('index', {
      quizes
    });  
  });
});

app.get('/quiz/:id', function (req, res) {
    console.log('question');
    var quizId = req.params.id; 
    if (!req.session.isFilling) {
      req.session.isFilling = true;
      req.session.questions = [];
    }
    
    var error = req.flash('error')[0];
    
    var db = req.session.db;
    var answeredQuestions = req.session.questions;
    var lastAnsweredQuestion = answeredQuestions[answeredQuestions.length-1];
    
    if (!lastAnsweredQuestion || lastAnsweredQuestion.answerId) {
    
      console.log('uj');
      
      queries.getAllFor(quizId).then(function (questions) {
      
        if (answeredQuestions.length === questions.length || 
            answeredQuestions.length === numberOfQuestionsPerQuiz) {
          res.redirect('/kiertekeles');
          return;
        }
    
        do {
          var veletlen = Math.floor(Math.random() * questions.length);
          var randomQuestion = questions[veletlen];
          var voltMar = answeredQuestions.some(function (q) {
            return q.questionId === randomQuestion._id;
          });
        }
        while (voltMar);
        
        answeredQuestions.push({
          questionId: randomQuestion._id,
          answerId: null,
        });
        req.session.answeredQuestions = answeredQuestions;
        
        res.render('question', {
          db: answeredQuestions.length,
          question: randomQuestion.question,
          answers: randomQuestion.answers,
          error,
        });
      })
    }
    else {
      console.log('nem uj');
      queries.getQuestionWithAnswersFor(lastAnsweredQuestion.questionId)
        .then(function (question) {
          res.render('question', {
            db: answeredQuestions.length,
            question: question.question,
            answers: question.answers,
            error,
          });
        })
    }
});

app.post('/quiz/:id', function (req, res) {
  var quizId = req.params.id;
  var answerId = req.body.answer;
  if (!answerId) {
    req.flash('error', 'Ó mondd, te kit választanál?');
  } else {
    var answeredQuestions = req.session.questions;
    var lastAnsweredQuestion = answeredQuestions[answeredQuestions.length-1];
    
    lastAnsweredQuestion.answerId = answerId;
  }
  res.redirect('/quiz/'+quizId);
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server started.');
});