from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
from .extractor import URLContentExtractor
from .preprocessor import TextPreprocessor
from .model import FakeNewsModel

app = FastAPI(title="Fake News Detection ML Service")

# Initialize services
preprocessor = TextPreprocessor()
model = FakeNewsModel()
extractor = URLContentExtractor()

class AnalysisRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Fake News Detection ML Service is running"}

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    content = ""
    title = ""
    
    # 1. URL content extraction if provided
    if request.url:
        extracted = extractor.extract(request.url)
        if not extracted["success"]:
            raise HTTPException(status_code=400, detail=f"Failed to extract URL content: {extracted['error']}")
        content = extracted["text"]
        title = extracted["title"]
    elif request.text:
        content = request.text
    else:
        raise HTTPException(status_code=400, detail="Either text or url must be provided")

    if not content:
        raise HTTPException(status_code=400, detail="No content found to analyze")

    # 2. Text preprocessing
    cleaned_text = preprocessor.clean_text(content)
    
    # 3. Keyword extraction
    keywords = preprocessor.extract_keywords(content)
    
    # 4. Hybrid Analysis (ML + Fact Check + Source Reputation)
    analysis_result = model.predict(cleaned_text, original_text=content, url=request.url)
    
    if analysis_result.get("status") == "Error":
        raise HTTPException(status_code=500, detail=analysis_result.get("message", "Analysis failed"))

    # Add extra metadata for the frontend
    analysis_result.update({
        "title": title,
        "keywords": keywords,
        "extracted_text": content[:500] + "..." if len(content) > 500 else content,
    })

    return analysis_result

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
