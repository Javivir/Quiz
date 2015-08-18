var models= require('../models/models.js');

exports.show = function(req, res, next){

	var numQuizes = 0;
	var numComments = 0;
	var mediaCommentsQuiz = 0;
	var numQuizesSinComments = 0;
	var numQuizesConComments = 0;
	var quizComments = 0;

// Encadenamos consultas a la BD
// En la primera consulta buscamos todos los quizes e incluimos los comentarios de cada uno
	models.Quiz.findAll({ include: [{ model: models.Comment }] }).then(function(quizes){

		// Guardamos numero de comentarios
		numQuizes = quizes.length;

		// Consulta para contar el numero total de comentarios
		models.Comment.count().then(function(nc){

			// Guardamos el numero de comentarios
			numComments = nc;

			// Guardamos la media de comentarios por quiz 
			if (numQuizes == 0 || numComments == 0)	mediaCommentsQuiz = 0;
			else	mediaCommentsQuiz = (numComments / numQuizes).toFixed(2);

			// Calculamos el numero de quizes con comentarios
			for(i in quizes){
				if (quizes[i].Comments.length > 0)         //accede a los comentarios de cada pregunta
					numQuizesConComments++;	
			}
			// Calculamos el numero de quizes sin comentarios
			numQuizesSinComments = numQuizes - numQuizesConComments;

			// Enviamos a la vista toda la informacion calculada para pintarla
			res.render('quizes/statistics', { num_quizes: numQuizes, 
				num_comments: numComments, 
				media_comments_quiz: mediaCommentsQuiz,
				num_quizes_sin_comments: numQuizesSinComments,
				num_quizes_con_comments: numQuizesConComments,
				errors: [] });
		});
	});
};
