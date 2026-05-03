const mlService = require('../services/mlService');
const verificationService = require('../services/verificationService');
const mongoose = require('mongoose');

// Analysis Schema
const analysisSchema = new mongoose.Schema({
    text: String,
    url: String,
    prediction: String,
    confidence: Number,
    isFake: Boolean,
    finalResult: String,
    credibilityScore: Number,
    extractedClaim: String,
    detectedEntities: Array,
    sources: Array,
    factChecks: Array,
    keywords: Array,
    metadata: Object,
    analyzedAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis_v4', analysisSchema);

exports.analyzeNews = async (req, res) => {
    try {
        const { text, url } = req.body;

        if (!text && !url) {
            return res.status(400).json({ success: false, error: 'Text or URL is required' });
        }

        // 1. Call updated Hybrid ML Service
        const analysisResult = await mlService.analyze(text, url);

        if (analysisResult.status !== "Success") {
            return res.status(500).json({ success: false, error: 'Analysis failed' });
        }

        // 2. Map results for database
        const analysis = new Analysis({
            text: text || analysisResult.extracted_text,
            url: url,
            prediction: analysisResult.Classification || analysisResult.prediction,
            confidence: parseInt(analysisResult.confidence),
            isFake: analysisResult.Classification === "FAKE",
            finalResult: (analysisResult.Classification || analysisResult.prediction).toUpperCase(),
            credibilityScore: parseInt(analysisResult.confidence),
            extractedClaim: analysisResult.title || text,
            detectedEntities: analysisResult.metadata.entities_detected || [],
            sources: analysisResult.sources_checked || [],
            factChecks: analysisResult.metadata.fact_check_score ? [{ rating: analysisResult.metadata.fact_check_score }] : [],
            keywords: analysisResult.keywords || [],
            metadata: {
                ...analysisResult.metadata,
                reasoning: analysisResult.Reason || analysisResult.reasoning,
                redFlags: analysisResult["Red Flags"],
                confidenceLevel: analysisResult.Confidence
            }
        });

        try {
            await analysis.save();
        } catch (dbError) {
            console.error('⚠️ Database Save Failed (MongoDB might not be running):', dbError.message);
        }

        // 3. Return standardized response
        res.json({
            success: true,
            data: {
                id: analysis._id,
                finalResult: analysis.finalResult,
                prediction: analysis.prediction,
                confidence: analysis.confidence,
                confidenceLevel: analysisResult.Confidence,
                reason: analysisResult.Reason || analysisResult.reasoning,
                redFlags: analysisResult["Red Flags"],
                extractedClaim: analysis.extractedClaim,
                suggestedVerification: "Cross-reference with reputable news agencies like Reuters, AP, or BBC.",
                detectedEntities: analysis.detectedEntities,
                sources: analysis.sources,
                keywords: analysis.keywords,
                metadata: analysis.metadata
            }
        });

    } catch (error) {
        console.error('Analysis Controller Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const total = await Analysis.countDocuments();
        const realCount = await Analysis.countDocuments({ finalResult: 'REAL' });
        const fakeCount = await Analysis.countDocuments({ finalResult: 'FAKE' });

        res.json({
            success: true,
            data: {
                total,
                real: realCount,
                fake: fakeCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const history = await Analysis.find()
            .sort({ analyzedAt: -1 })
            .limit(limit);

        res.json({
            success: true,
            data: { history }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        await Analysis.findByIdAndDelete(id);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        await Analysis.deleteMany({});
        res.json({ success: true, message: 'Cleared' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
