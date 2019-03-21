const mongoose = require('mongoose');
const { Schema } = mongoose;

const includesPublic = value => value.includes('/public/');
const hasEnoughKeys = obj => Object.keys(obj).length > 1;

const questionSchema = new Schema({
    questionId: {
        type: String,
        required: [true, 'Each question must have a question ID']
    },
    imgPath: {
        type: String,
        validate: [includesPublic, 'question image paths must be in the public directory']
    },
    answers: {
        type: Object,
        required: [true, 'Each question must have a set of possible answers'],
        validate: [hasEnoughKeys, 'Each question must have at least two answers']
    },
    correctAnswer: {
        type: String,
        required: [true, 'Each question must have a specified correct answer']
    },
    text: {
        type: String,
        required: [true, 'Each question must text']
    }
});

const Question = mongoose.model('questions', questionSchema);

module.exports = Question;