const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

const Problem = require('../models/problem');

const User = require('../models/user');
const Submission = require("../models/submission");

const SolutionVideo = require("../models/solutionVideo");

// judge0
const createProblem = async (req,res)=>{

    const {title,description,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{

        for(const {language,completeCode} of referenceSolution){

            const languageId = getLanguageById(language);
            
            const submissions = visibleTestCases.map( (testcase)=>(

                {
                    source_code:completeCode,
                    language_id:languageId,
                    stdin:testcase.input,
                    expected_output:testcase.output
                }



            ));

            const submitResult = await submitBatch(submissions);

            // console.log(submitResult); // working amazingly

            const resultToken = submitResult.map( (value)=> value.token );
            // the above line will make an array of token

            const testResult = await submitToken(resultToken);

            console.log(testResult); // working amazingly

            for(const test of testResult){

                if(test.status.id!=3){
                    return res.status(400).send( "ERROR Occured : THERE IS AN ISSUE WITH THE PROBLEM SOLUTIONS" );
                }
            }

            



        }

        // now we can store it in our db
        const userProblem = await Problem.create({
            ...req.body,
            problemCreator: req.result._id
        })

        res.status(201).send("problem saved successfully");

    }
    catch(err){

        res.status(400).send("ERROR : " + err.message)

    }

}

// judge0
const updateProblem = async (req,res)=>{

    const {id} = req.params;

    const {title,description,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator} = req.body;

    try{

        if(!id) return res.status(400).send("missing ID field");

        const DsaProblem = await Problem.findById(id);

        if(!DsaProblem){
            return res.status(404).send("ID is not present in the server");
        }

        for(const {language,completeCode} of referenceSolution){

            const languageId = getLanguageById(language);
            
            const submissions = visibleTestCases.map( (testcase)=>(

                {
                    source_code:completeCode,
                    language_id:languageId,
                    stdin:testcase.input,
                    expected_output:testcase.output
                }



            ));

            const submitResult = await submitBatch(submissions);

            // console.log(submitResult); // working amazingly

            const resultToken = submitResult.map( (value)=> value.token );
            // the above line will make an array of token

            const testResult = await submitToken(resultToken);

            // console.log(testResult); // working amazingly

            for(const test of testResult){

                if(test.status.id!=3){
                    return res.status(400).send( "ERROR Occured : THERE IS AN ISSUE WITH THE PROBLEM SOLUTIONS" );
                }
            }

            



        }

        const newProblem = await Problem.findByIdAndUpdate(id,{title,description,tags,visibleTestCases,hiddenTestCases,startCode,referenceSolution,problemCreator},{runValidators : true, new : true});

        res.status(200).send(newProblem);

    }
    catch(err){

        return res.status(500).send( "ERROR OCCURED AT userProblem.js, updateProblem" );
    }

}


const deleteProblem = async (req,res)=>{

    const {id} = req.params;

    try{

        if(!id) return res.status(400).send("id is missing");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if(!deletedProblem) return res.status(404).send("problem is missing");

        res.status(200).send("Successfully deleted");

    }

    catch(err){
        res.status(500).send("Error:" + err.message);
    }

    

    
}


const getProblemById = async (req,res)=>{

    const {id} = req.params;

    try{

        if(!id) return res.status(400).send("id is missing");

        const getProblem = await Problem.findById(id).select( '_id title description difficulty tags visibleTestCases startCode referenceSolution' ).lean();

        if(!getProblem) return res.status(404).send("problem is missing");

        // solution video ka jo bhi url wagera hai lee aaooo

        const videos = await SolutionVideo.findOne( {problemId:id} );

        if(videos){

            getProblem.secureUrl = videos.secureUrl;
            
            getProblem.thumbnailUrl = videos.thumbnailUrl;

            getProblem.duration = videos.duration;

            return res.status(200).send(getProblem);
        }

        res.status(200).send(getProblem);

    }

    catch(err){
        res.status(500).send("Error:" + err.message);
    }

    

    
}


const getAllProblem = async (req,res)=>{

    try{

        const getProblem = await Problem.find({}).select(' _id title difficulty tags ');

        if(getProblem.length==0) return res.status(404).send("problem is missing");

        res.status(200).send(getProblem);

    }

    catch(err){
        res.status(500).send("Error:" + err.message);
    }

    

    
}


const solvedAllProblemByUser = async(req,res)=>{

    try{

        // const count = req.result.problemSolved.length;

        const userId = req.result._id;

        const user = await User.findById(userId).populate( {

            path : "problemSolved",
            select : " _id title difficulty tags "
        } ); // using the power of "ref" which we have defined in models

        res.status(200).send(user.problemSolved);
    }
    catch(err){
        res.status(500).send( "Server Error" );
    }

}

const submittedProblem = async(req,res) =>{

    try{

        const userId = req.result._id;

        const problemId = req.params.pid;

        const ans = await Submission.find( {userId,problemId} );

        if(ans.length == 0){
            return res.status(200).send("No Submission is present");
        }

        return res.status(200).send( ans );
    }
    catch(err){
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem};