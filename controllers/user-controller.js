require('../db/mongoose');
const User = require('../models/users');
const Quiz = require('../models/quizzes');

module.exports = {
    async create(request, accessToken, refreshToken, profile) { //used in /services/passport.js 
        const existingUser = await User.findOne({ googleId: profile.googleId});
        if(!existingUser) {
            const newUser = new User({ googleId: profile.googleId, displayName: profile.displayName});
            await newUser.save();
        }
    },
    async delete(id) {
        await User.findByIdAndDelete(id);
    },
    async makeUser(id){
        await User.findByIdAndUpdate(id, { $addToSet: { roles: 'user' }});
    },
    async demoteUser(id){
        await User.findByIdAndUpdate(id, { $pull: { roles: 'user' }});
    },
    async makeCoach(id){
        await User.findByIdAndUpdate(id, { $addToSet: { roles: 'coach' }});
    },
    async demoteCoach(id){
        await User.findByIdAndUpdate(id, { $pull: { roles: 'coach' }});
    },
    async makeAdmin(id){
        await User.findByIdAndUpdate(id, { $addToSet: { roles: 'admin' }});
    },
    async demoteAdmin(id){
        await User.findByIdAndUpdate(id, { $pull: { roles: 'admin' }});
    },
    async addCompletedQuiz(userId, quizId){
        if(!quizId._bsontype){
            throw new Error('Something went wrong with the quiz ID. Err: quizId not of correct type')
        }
        const user = await User.findById(userId);
        const quiz = await Quiz.findById(quizId);
        user.completedQuizzes.push(quiz);
        await user.save();
        return quiz;
    },
    async removeCompletedQuiz(userId, quizId){
        if(!userId._bsontype){
            throw new Error('Something went wrong with the quiz or user ID. Err: userId not of the correct type')
        }
        const user = await User.findByIdAndUpdate(userId, { $pull: { completedQuizzes: quizId }});
        return user;
    },
    async removeCompletedQuiz(userId, quizId){
        if(!userId._bsontype){
            throw new Error('Something went wrong with the quiz or user ID. Err: userId not of the correct type')
        }
        const user = await User.findByIdAndUpdate(userId, { $pull: { completedQuizzes: quizId }});
        return user;
    },
    async addScoreReport(userId, report){
        const user = await User.findById(userId);
        const quiz = user.scoreReports.find(quiz => quiz.quizName === report.quizName);
        if(!quiz){
            report.scores = [report.score];
            delete report.score;
            report.timesAttempted = 1;
            const wrongAnswersArr = [];
            wrongAnswersArr.push(report.missedQuestions);
            report.missedQuestions = wrongAnswersArr;
            user.scoreReports.push(report);
            await user.save();
            return user;
        }
        quiz.scores.push(report.score);
        quiz.timesAttempted++;
        quiz.missedQuestions.push(report.missedQuestions);
        const index = user.scoreReports.findIndex(quiz => quiz.quizName === report.quizName);
        user.scoreReports[index] = quiz;
        await user.save();
        return user;
    },
    async deleteScoreReport(userId, reportId, index){
        const user = await User.findById(userId);
        const report = user.scoreReports.id(reportId);
        if(report.timesAttempted === 1){
            user.scoreReports.id(reportId).remove();
            await user.save();
            return user;
        }
        report.scores.splice(index, 1);
        report.timesAttempted--;
        report.missedQuestions.splice(index, 1);
        const insertIndex = user.scoreReports.findIndex(quiz => quiz.quizName === report.quizName);
        user.scoreReports[insertIndex] = report;
        await user.save();
        return user;
    }
}