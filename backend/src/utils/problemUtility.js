// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// const axios = require("axios");

// const getLanguageById = (lang) => {
//     const language = {
//         "c++": 54,
//         "java": 62,
//         "javascript": 63
//     };
//     return language[lang.toLowerCase()];
// }

// const submitBatch = async (rawSubmissions) => {
//     // 1. Encode the necessary fields to Base64 right here
//     const encodedSubmissions = rawSubmissions.map(sub => ({
//         language_id: sub.language_id,
//         // Convert string to a Buffer, then export as a Base64 string.
//         // We also check if the value exists first, to avoid crashing on null/undefined.
//         source_code: sub.source_code ? Buffer.from(sub.source_code).toString('base64') : null,
//         stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : null,
//         expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : null
//     }));

//     // 2. Stringify the newly encoded array
//     let data = JSON.stringify({
//         submissions: encodedSubmissions
//     });

//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: 'https://Judge0-CE.proxy-production.allthingsdev.co/submissions/batch?base64_encoded=true',
//         headers: { 
//             'x-apihub-key': process.env.JUDGE0_KEY, 
//             'x-apihub-host': 'Judge0-CE.allthingsdev.co', 
//             'x-apihub-endpoint': '402b857c-1126-4450-bfd8-22e1f2cbff2f', 
//             'Content-Type': 'application/json'
//         },
//         data: data
//     };

//     // try {
//     //     const response = await axios.request(config);
//     //     return response.data;
//     // } catch(err) {
//     //     return err.message;
//     // }

//     try {
//         const response = await axios.request(config);

//         console.log("===== submitBatch SUCCESS =====");
//         console.log(response.data);

//         return response.data;
//     } catch (err) {
//         console.log("===== submitBatch ERROR =====");
//         console.log(err.response?.data);
//         console.log(err.message);

//         throw err;
//     }
// }

// const waiting = (timer) => {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve();
//         }, timer);
//     });

// }

// const submitToken = async(resultToken)=>{

//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: 'https://Judge0-CE.proxy-production.allthingsdev.co/submissions/batch',
        
//         params: {
//             tokens: resultToken.join(','), 
//             base64_encoded: 'true',
//             // Updated to the wildcard to fetch all possible data!
//             fields: '' 
//         },
        
//         headers: { 
//             'x-apihub-key': process.env.JUDGE0_KEY, 
//             'x-apihub-host': 'Judge0-CE.allthingsdev.co', 
//             'x-apihub-endpoint': 'e42f2a26-5b02-472a-80c9-61c4bdae32ec'
//         }
//     };

//     async function fetchData(){

//         try {

//             const response = await axios.request(config);

//             return response.data; 
            
//         } catch (error) {

//             console.error(error);
//         }
//     }

//     while(true){

//         const result = await fetchData();

//         const IsResultObtained = result.submissions.every( (r)=>r.status.id>2 );

//         if(IsResultObtained) return result.submissions;

//         await waiting(1000);
//     }
    


// }

// module.exports = { getLanguageById, submitBatch, submitToken};


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require("axios");

const getLanguageById = (lang) => {
    const language = {
        "c++": 54,
        "java": 62,
        "javascript": 63
    };
    return language[lang.toLowerCase()];
}

const submitBatch = async (rawSubmissions) => {
    // 1. Encode the necessary fields to Base64
    const encodedSubmissions = rawSubmissions.map(sub => ({
        language_id: sub.language_id,
        source_code: sub.source_code ? Buffer.from(sub.source_code).toString('base64') : null,
        stdin: sub.stdin ? Buffer.from(sub.stdin).toString('base64') : null,
        expected_output: sub.expected_output ? Buffer.from(sub.expected_output).toString('base64') : null
    }));

    // 2. Stringify the newly encoded array
    let data = JSON.stringify({
        submissions: encodedSubmissions
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        // UPDATED URL
        url: 'https://ce.judge0.com/submissions/batch?base64_encoded=true',
        headers: { 
            // REMOVED API HUB HEADERS
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios.request(config);

        console.log("===== submitBatch SUCCESS =====");
        console.log(response.data);

        return response.data;
    } catch (err) {
        console.log("===== submitBatch ERROR =====");
        console.log(err.response?.data);
        console.log(err.message);

        throw err;
    }
}

const waiting = (timer) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, timer);
    });
}

const submitToken = async(resultToken) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        // UPDATED URL
        url: 'https://ce.judge0.com/submissions/batch',
        params: {
            tokens: resultToken.join(','), 
            base64_encoded: 'true',
            fields: '' 
        },
        headers: {
            // REMOVED API HUB HEADERS
            'Content-Type': 'application/json' 
        }
    };

    async function fetchData(){
        try {
            const response = await axios.request(config);
            return response.data; 
        } catch (error) {
            console.error(error);
        }
    }

    while(true){
        const result = await fetchData();
        const IsResultObtained = result.submissions.every((r) => r.status.id > 2);

        if(IsResultObtained) return result.submissions;

        // PRO TIP: Increased wait time to 2 seconds to avoid strict rate limits
        await waiting(2000); 
    }
}

module.exports = { getLanguageById, submitBatch, submitToken };