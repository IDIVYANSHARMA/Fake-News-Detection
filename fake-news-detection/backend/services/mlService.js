const axios = require('axios');

class MLService {
    constructor() {
        this.apiUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
    }

    async analyze(text, url = null) {
        try {
            const response = await axios.post(`${this.apiUrl}/analyze`, {
                text,
                url
            });
            return response.data;
        } catch (error) {
            console.error('ML Service Error:', error.message);
            throw new Error(`Failed to communicate with ML Service: ${error.message}`);
        }
    }

    async healthCheck() {
        try {
            const response = await axios.get(`${this.apiUrl}/health`);
            return response.data;
        } catch (error) {
            return { status: 'unreachable', error: error.message };
        }
    }
}

module.exports = new MLService();
