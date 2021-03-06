var path = require ('path');
	// Cargar Modelo ORM

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

var Sequelize= require('sequelize');

	// Usar BBDD SQLite o Postgress
var sequelize = new Sequelize(DB_name, user, pwd,
		{	dialect: protocol,
			protocol:protocol,
			port: port,
			host: host,
			storage: storage,		//solo SQlite (.env)
			omitNull:true			//solo Postgress
		}
	);

	// Importar la definicion de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

	// Importar la definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

Comment.belongsTo(Quiz, {onDelete: 'cascade'}); //añadido el borrado en cascada para borrar comentarios
Quiz.hasMany(Comment , {onDelete: 'cascade'});     //Quiz puede tener muchos comments

exports.Quiz = Quiz; // exportar definición de la tabla Quiz
exports.Comment = Comment;

	//sequeliz.sync() crea e inicicializa tabal de preguntas en DB
sequelize.sync().then(function() {
	//succes(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function (count){
		if(count === 0) {   // la tabla se inicializa solo si está vacía
			Quiz.bulkCreate( 
              [ {pregunta: 'Capital de Italia',   respuesta: 'Roma', tema: 'Ocio'}, 
                {pregunta: 'Capital de Portugal', respuesta: 'Lisboa', tema: 'Ocio'},
                {pregunta: 'Capital de Francia', respuesta: 'Paris', tema: 'Ocio'}
              ]
			).then(function(){console.log('Base de datos inicializada')})
		};
	});
});