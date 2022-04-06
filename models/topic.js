"use strict";

const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;

//modelo de COMMENTS

var CommentSchema = Schema({
  content: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" },
});


var Comment = mongoose.model("Comment", CommentSchema);

//Modelo de TOPIC
var TopicSchema = Schema({
  title: String,
  content: String,
  code: String,
  lang: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.ObjectId, ref: "User" },
  comments: [CommentSchema],
});

// Carga paginación

TopicSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Topic", TopicSchema);
