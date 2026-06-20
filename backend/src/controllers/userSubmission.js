
const Problem = require("../models/problem");

const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");

const Submission = require("../models/submission");
const User = require("../models/user");

const submitCode = async (req,res)=>{

    try{

        const userId = req.result._id;
        const problemId = req.params.id;

        let {code,language} = req.body;

        if( !userId || !code || !problemId || !language ) 
            return res.status(400).send("something missing => controllers => userSumissioin.js");

        if (language === 'cpp') {
            language = 'c++';
        }

        // fetch the problem from the database
        const problem = await Problem.findById(problemId);

        if(!problem){
            return res.status(404).send( "problem doesnt exist" );
        }
        // now i got the Hidden Test Cases

        const submittedResult = await Submission.create( {
            userId,
            problemId,
            code,
            language,
            status: 'pending',
            testCasesTotal : problem.hiddenTestCases.length
        } )

        // judge0 ko submit krdo code

        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map( (testcase)=>(

            {
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }



        ));

        const submitResult = await submitBatch(submissions);
        
        const resultToken = submitResult.map( (value)=> value.token );

        const testResult = await submitToken(resultToken);

        // submitted result of update kroooo
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;

        for( const test of testResult ){

            if(test.status.id==3) {
                testCasesPassed++;
                runtime= runtime + parseFloat(test.time || 0); // test.time is in string may be time is null therefore 0
                memory = Math.max(memory , test.memory);
            }
            else{
                if(test.status.id==4){
                    status = "error";
                    errorMessage = test.stderr;
                }
                else{
                    status = "wrong";
                    errorMessage = test.stderr;
                }
            }
        }

        // store the result in the database
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save();

        // insert the problem ID in the userSchema it is not already there

        if( !req.result.problemSolved.includes(problemId) ){
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        const accepted = (status == 'accepted')

        return res.status(201).json({

            accepted,
            totalTestCases : submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });
    }
    catch(err){

        return res.status(500).send(" Error => controllers => userSubmissions " + err.message);
    }
}

// this is my old run
const runCode = async (req,res) =>{

    try{

        const userId = req.result._id;
        const problemId = req.params.id;

        let {code,language} = req.body;

        if( !userId || !code || !problemId || !language ) 
            return res.status(400).send("something missing => controllers => userSumissioin.js");

        if (language === 'cpp') {
            language = 'c++';
        }

        // fetch the problem from the database
        const problem = await Problem.findById(problemId);

        if(!problem){
            return res.status(404).send( "problem doesnt exist" );
        }

        // judge0 ko submit krdo code

        const languageId = getLanguageById(language);

        const submissions = problem.visibleTestCases.map( (testcase)=>(

            {
                source_code:code,
                language_id:languageId,
                stdin:testcase.input,
                expected_output:testcase.output
            }



        ));

        const submitResult = await submitBatch(submissions);
        
        const resultToken = submitResult.map( (value)=> value.token );

        const testResult = await submitToken(resultToken);


        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for(const test of testResult){
            if(test.status.id==3){
                testCasesPassed++;
                runtime = runtime+parseFloat(test.time)
                memory = Math.max(memory,test.memory);
            }
            
            else{
                if(test.status.id==4){
                    status = false
                    errorMessage = test.stderr
                }
                else{
                    status = false
                    errorMessage = test.stderr
                }
            }
        }

        res.status(201).json({
            success:status,
            testCases: testResult,
            runtime,
            memory
        });

        // res.status(201).send( testResult );
    }
    catch(err){
     res.status(500).send("Internal Server Error "+ err);
   }


}

// const runCode = async(req,res)=>{
    
//      // 
//      try{
//       const userId = req.result._id;
//       const problemId = req.params.id;

//       let {code,language} = req.body;

//      if(!userId||!code||!problemId||!language)
//        return res.status(400).send("Some field missing");

//    //    Fetch the problem from database
//       const problem =  await Problem.findById(problemId);
//    //    testcases(Hidden)
//       if(language==='cpp')
//         language='c++'

//    //    Judge0 code ko submit karna hai

//    const languageId = getLanguageById(language);

//    const submissions = problem.visibleTestCases.map((testcase)=>({
//        source_code:code,
//        language_id: languageId,
//        stdin: testcase.input,
//        expected_output: testcase.output
//    }));


//    const submitResult = await submitBatch(submissions);
   
//    const resultToken = submitResult.map((value)=> value.token);

//    const testResult = await submitToken(resultToken);

//     let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = true;
//     let errorMessage = null;

//     for(const test of testResult){
//         if(test.status_id==3){
//            testCasesPassed++;
//            runtime = runtime+parseFloat(test.time)
//            memory = Math.max(memory,test.memory);
//         }else{
//           if(test.status_id==4){
//             status = false
//             errorMessage = test.stderr
//           }
//           else{
//             status = false
//             errorMessage = test.stderr
//           }
//         }
//     }

   
  
//    res.status(201).json({
//     success:status,
//     testCases: testResult,
//     runtime,
//     memory
//    });
      
//    }
//    catch(err){
//      res.status(500).send("Internal Server Error "+ err);
//    }
// }

module.exports = {submitCode,runCode};


// testResult looks like this, but like many of these objects as there will be many test cases
// {
//     stdout: 'NQ==',
//     time: '0.003',
//     memory: 1232,
//     stderr: null,
//     token: '67e8a7f7-7d60-49a0-839a-ef9749094c17',
//     compile_output: null,
//     message: null,
//     status: { id: 3, description: 'Accepted' }
// }

// for time we take summition of time taken by each testcase
// for memory we take maximum memory of all