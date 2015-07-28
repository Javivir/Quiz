var models= require('../models/models.js');

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) {next(error);});
}


// GET /quizes?search=texto_a_buscar
exports.index = function (req,res) {
	var texto_a_buscar = req.query.search || '';
	var where = {};

	if(req.query.search) {
	    search = '%' + texto_a_buscar.trim().replace(/\s+/g,'%') + '%';
	    where = {where: ['lower(pregunta) like lower(?)', search], order: 'pregunta ASC'};
 	 }

	models.Quiz.findAll(where).then(
	    function(quizes) {
			res.render('quizes/index.ejs', {quizes: quizes, search: texto_a_buscar, errors:[] });
	    }
	).catch(function(error) {next(error);})
};


// GET /  quizes / :id
exports.show = function (req,res) {
	res.render('quizes/show', { quiz:req.quiz, errors:[] })
};


// GET /  quizes / :id / answer
exports.answer = function(req, res) {
	var resultado = "Incorrecto";
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	} 
	res.render('quizes/answer', { quiz:req.quiz, respuesta: resultado, errors:[] });
};

// GET /  quizes / new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
			{pregunta: "Pregunta", respuesta: "Respuesta"}
		);

	res.render('quizes/new', {quiz:quiz, errors:[] });
};

// GET /  quizes / create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz);
// guarda en la DB
	quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				quiz
				.save({fields: ["pregunta", "respuesta"]})
				.then( function(){ res.redirect('/quizes') });
			}
		}
	);
};