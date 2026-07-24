


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

    let data = JSON.stringify({
        submissions: encodedSubmissions
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,

        url: `${process.env.JUDGE0_BASE_URL}/submissions/batch?base64_encoded=true`,
        headers: { 

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

        url: `${process.env.JUDGE0_BASE_URL}/submissions/batch`,
        params: {
            tokens: resultToken.join(','), 
            base64_encoded: 'true',
            fields: '' 
        },
        headers: {

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

        await waiting(2000); 
    }
}

module.exports = { getLanguageById, submitBatch, submitToken };