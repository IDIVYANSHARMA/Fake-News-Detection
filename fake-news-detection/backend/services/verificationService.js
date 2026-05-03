const axios = require('axios');
const stringSimilarity = require('string-similarity');

class VerificationService {
    constructor() {
        this.newsApiKey = process.env.NEWS_API_KEY;
        this.gnewsApiKey = process.env.GNEWS_API_KEY;
        this.googleFactCheckKey = process.env.GOOGLE_FACT_CHECK_KEY;
    }

    async verify(keywords, originalText) {
        const results = {
            sources: [],
            factChecks: [],
            verified: false,
            similarityScore: 0
        };

        if (!keywords || keywords.length === 0) return results;

        try {
            const query = keywords.slice(0, 4).join(' ');
            let foundArticles = [];

            // 1. Check NewsAPI
            if (this.newsApiKey) {
                try {
                    const newsResponse = await axios.get(`https://newsapi.org/v2/everything`, {
                        params: { q: query, sortBy: 'relevance', language: 'en', apiKey: this.newsApiKey },
                        timeout: 5000
                    });
                    if (newsResponse.data.articles) {
                        foundArticles = [...foundArticles, ...newsResponse.data.articles.map(art => ({
                            name: art.source.name,
                            title: art.title,
                            url: art.url,
                            description: art.description
                        }))];
                    }
                } catch (err) { console.error('NewsAPI Error:', err.message); }
            }

            // 2. Check GNews API (Secondary)
            if (this.gnewsApiKey) {
                try {
                    const gnewsResponse = await axios.get(`https://gnews.io/api/v4/search`, {
                        params: { q: query, lang: 'en', token: this.gnewsApiKey },
                        timeout: 5000
                    });
                    if (gnewsResponse.data.articles) {
                        foundArticles = [...foundArticles, ...gnewsResponse.data.articles.map(art => ({
                            name: art.source.name,
                            title: art.title,
                            url: art.url,
                            description: art.description
                        }))];
                    }
                } catch (err) { console.error('GNews Error:', err.message); }
            }

            // 3. Check Google Fact Check API
            if (this.googleFactCheckKey) {
                try {
                    const factResponse = await axios.get(`https://factchecktools.googleapis.com/v1alpha1/claims:search`, {
                        params: { query: query, key: this.googleFactCheckKey },
                        timeout: 5000
                    });
                    if (factResponse.data.claims) {
                        results.factChecks = factResponse.data.claims.map(claim => ({
                            text: claim.text,
                            claimant: claim.claimant,
                            rating: claim.claimReview[0].textualRating,
                            source: claim.claimReview[0].publisher.name,
                            url: claim.claimReview[0].url
                        }));
                    }
                } catch (err) { console.error('FactCheck Error:', err.message); }
            }

            // 4. Check Wikipedia API (Always accessible fallback)
            let wikipediaArticles = [];
            try {
                const wikiResponse = await axios.get(`https://en.wikipedia.org/w/api.php`, {
                    params: {
                        action: 'query',
                        list: 'search',
                        srsearch: query,
                        utf8: '',
                        format: 'json',
                        srlimit: 3
                    },
                    timeout: 5000
                });

                if (wikiResponse.data && wikiResponse.data.query && wikiResponse.data.query.search) {
                    wikipediaArticles = wikiResponse.data.query.search.map(item => ({
                        name: 'Wikipedia',
                        title: item.title,
                        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
                        // Wikipedia snippets contain HTML, so we strip it.
                        description: item.snippet ? item.snippet.replace(/<[^>]*>?/gm, '') : ''
                    }));
                    foundArticles = [...foundArticles, ...wikipediaArticles];
                }
            } catch (err) { console.error('Wikipedia Error:', err.message); }

            // 5. Similarity Logic
            if (foundArticles.length > 0) {
                // Remove duplicates by URL
                const uniqueArticles = Array.from(new Map(foundArticles.map(item => [item.url, item])).values());

                // Calculate similarity for each article
                const scoredArticles = uniqueArticles.map(art => {
                    const titleScore = stringSimilarity.compareTwoStrings(originalText.toLowerCase(), art.title.toLowerCase());
                    const descScore = art.description ? stringSimilarity.compareTwoStrings(originalText.toLowerCase(), art.description.toLowerCase()) : 0;
                    return { ...art, score: Math.max(titleScore, descScore) };
                });

                // Sort by score
                scoredArticles.sort((a, b) => b.score - a.score);

                results.sources = scoredArticles.slice(0, 5);
                results.similarityScore = Math.max(...scoredArticles.map(a => a.score)) * 100;

                // Threshold for verification: If similarity > 30% for Wikipedia, or 40% normally
                const threshold = wikipediaArticles.length > 0 && results.sources[0].name === 'Wikipedia' ? 30 : 40;

                if (results.similarityScore > threshold) {
                    results.verified = true;
                }
            } else {
                // If NO articles found at all
                if (!this.newsApiKey && !this.gnewsApiKey) {
                    results.sources = [{ name: 'System Note', title: 'Connect API keys for deeper live verification', url: '#' }];
                }
            }

            return results;
        } catch (error) {
            console.error('Verification Service Error:', error.message);
            return results;
        }
    }
}

module.exports = new VerificationService();
