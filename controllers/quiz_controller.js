var models= require('../models/models.js');

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({                    //models.Quiz.findById(quizId)  
		where: { id: Number(quizId)},
		include: [{ model: models.Comment }]
	})                
	.then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId));}
		}
	).catch(function(error) {next(error);});
}


// GET /quizes   // GET /quizes?search=texto_a_buscar
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

// GET /  quizes / :id / edit                                   // **********   REVISAR      ***************
exports.edit = function(req, res) {
	var quiz = req.quiz;
	res.render('quizes/edit', {quiz:quiz, errors:[] });
};

// PUT /  quizes / :id 
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;

	req.quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz
				.save( {fields: ["pregunta", "respuesta", "tema"]})
				.then( function(){ res.redirect('/quizes');});
			}
		}
	);
};

// GET /  quizes / new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(
			{pregunta: "Pregunta", respuesta: "Respuesta" , tema: "otro"}
		);

	res.render('quizes/new', {quiz:quiz, errors:[] });
};

// POST /  quizes / create
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
				.save({fields: ["pregunta", "respuesta", "tema"]})
				.then( function(){ res.redirect('/quizes') });
			}
		}
	);
};

// DELETE /  quizes / :id
exports.destroy = function(req, res) {
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};