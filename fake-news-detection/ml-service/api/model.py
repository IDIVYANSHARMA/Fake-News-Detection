import os
import re
import spacy
import torch
import requests
import validators
import json
from pymongo import MongoClient
from transformers import pipeline
from datetime import datetime
from urllib.parse import urlparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FakeNewsModel:
    def __init__(self):
        # 1. Load ML Model (BERT-tiny for efficiency)
        self.model_name = "mrm8488/bert-tiny-finetuned-fake-news-detection"
        try:
            self.classifier = pipeline("text-classification", model=self.model_name)
            print(f"ML Model '{self.model_name}' loaded.")
        except Exception as e:
            print(f"Error loading transformer model: {e}")
            self.classifier = None

        # 2. Load SpaCy for Entity Extraction
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print(" SpaCy loaded.")
        except Exception as e:
            print(f" SpaCy load error: {e}")
            self.nlp = None

        # 3. MongoDB Connection
        self.mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/fake-news-detection")
        try:
            self.client = MongoClient(self.mongo_uri)
            self.db = self.client.get_database()
            print("MongoDB connected.")
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            self.db = None

        # 4. API Keys
        self.google_api_key = os.getenv("GOOGLE_FACTCHECK_API_KEY", "")

        # 5. Fallback Trusted Domains
        self.trusted_domains = [
            "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "nytimes.com", 
            "wsj.com", "theguardian.com", "aljazeera.com", "bloomberg.com",
            "republicworld.com", "indiatoday.in", "timesofindia.indiatimes.com",
            "ndtv.com", "indianexpress.com", "thehindu.com", "dw.com", "france24.com"
        ]

    def extract_entities(self, text):
        """Extract key entities using SpaCy."""
        if not self.nlp:
            return []
        doc = self.nlp(text)
        entities = []
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "LAW"]:
                entities.append({"name": ent.text, "type": ent.label_})
        return entities

    def verify_with_external_api(self, claim):
        """Search claim against Google Fact Check Tools API."""
        if not self.google_api_key:
            return {"score": 0.5, "sources": [], "found": False}
        
        endpoint = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
        params = {
            "query": claim,
            "key": self.google_api_key
        }
        
        try:
            response = requests.get(endpoint, params=params, timeout=5)
            data = response.json()
            
            if "claims" in data and len(data["claims"]) > 0:
                fact_checks = data["claims"][0].get("claimReview", [])
                sources = [fc.get("publisher", {}).get("name", "Unknown") for fc in fact_checks]
                ratings = [fc.get("textualRating", "").lower() for fc in fact_checks]
                
                # Check for negative ratings
                is_false = any(r in ["false", "fake", "incorrect", "misleading", "pants on fire", "untrue"] for r in ratings)
                # Check for positive ratings
                is_true = any(r in ["true", "correct", "accurate", "mostly true"] for r in ratings)
                
                if is_false:
                    score = 0.1
                elif is_true:
                    score = 0.9
                else:
                    score = 0.5
                    
                return {"score": score, "sources": sources, "found": True, "ratings": ratings}
        except Exception as e:
            print(f"Fact Check API Error: {e}")
            
        return {"score": 0.5, "sources": [], "found": False}

    def check_source_credibility(self, url):
        """Check source reputation."""
        if not url:
            return 1.0, "No URL provided"
            
        domain = urlparse(url).netloc.replace("www.", "").lower()
        
        if any(trusted in domain for trusted in self.trusted_domains):
            return 1.4, "Trusted news organization"
            
        if self.db:
            blacklisted = self.db.blacklisted_sources.find_one({"domain": domain})
            if blacklisted:
                return 0.2, "Source is blacklisted"
            
            trusted = self.db.trusted_sources.find_one({"domain": domain})
            if trusted:
                return 1.3, "Verified trusted source"
            
        return 1.0, "Unknown source"

    def detect_red_flags(self, text, url=None):
        """Identify red flags in the content."""
        red_flags = []
        
        # 1. Clickbait Headline Patterns
        clickbait_patterns = [
            r"you won't believe", r"shocking", r"gone viral", r"miracle cure",
            r"secret leaked", r"hidden truth", r"they don't want you to know",
            r"WATCH:", r"STOP EVERYTHING", r"AMAZING!"
        ]
        for p in clickbait_patterns:
            if re.search(p, text, re.IGNORECASE):
                red_flags.append("Clickbait headline detected")
                break
        
        # 2. Emotional/Sensational Language
        emotional_patterns = [
            r"!!+", r"\?\?\?+", r"URGENT", r"BREAKING NEWS!!!", 
            r"OUTRAGEOUS", r"SCAM", r"TERRIBLE"
        ]
        for p in emotional_patterns:
            if re.search(p, text):
                red_flags.append("Sensationalist/Emotional language (Excessive punctuation/Caps)")
                break
                
        # 3. Lack of Sources/Forwarded Style
        if len(text) < 100 and not url:
            red_flags.append("Short text with no source URL (Likely forwarded message)")
            
        # 4. Out-of-context signals
        if "found on social media" in text.lower() or "whatsapp" in text.lower():
            red_flags.append("Social media/Messaging app source signal")

        return red_flags

    def check_scientific_improbability(self, text):
        """Check for scientifically improbable or common fake science tropes."""
        improbable_tokens = [
            (r"moon.*emitting.*wi-fi", "Scientific impossibility: The Moon does not emit Wi-Fi."),
            (r"gravity.*reversed", "Scientific impossibility: Gravity reversal."),
            (r"earth.*is.*flat", "Factually incorrect: Flat Earth claim."),
            (r"5g.*causes.*covid", "Disproven conspiracy theory."),
            (r"miracle.*cure.*cancer", "Potentially dangerous medical misinformation."),
            (r"secret.*nasa.*leaked", "Sensationalist 'leaked' information trope.")
        ]
        for pattern, reason in improbable_tokens:
            if re.search(pattern, text, re.IGNORECASE):
                return True, reason
        return False, None

    def predict(self, cleaned_text, original_text=None, url=None):
        raw_text = original_text if original_text else cleaned_text
        red_flags = self.detect_red_flags(raw_text, url)
        
        # Phase 1: ML Analysis (BERT)
        ml_score = 0.5
        if self.classifier:
            sample = cleaned_text[:512]
            results = self.classifier(sample)
            raw_label = results[0]['label']
            confidence = results[0]['score']
            # If the model is confident in Label 1 (Real), score is high
            ml_score = confidence if raw_label == "LABEL_1" else (1 - confidence)
            
        # Phase 2: Live Fact-Check (Google API)
        claim = raw_text.split('.')[0][:150]
        fact_check_result = self.verify_with_external_api(claim)
        fact_check_score = fact_check_result["score"]
        
        # Phase 3: Source Credibility
        source_multiplier, source_reason = self.check_source_credibility(url)
        
        # Phase 4: Entity Weighting (Balanced Approach)
        entities = self.extract_entities(raw_text)
        is_credible_org = any(e['name'].upper() in ["NASA", "ISRO", "WHO", "UN", "FBI", "REUTERS", "BBC", "AP"] for e in entities)
        
        # Phase 5: Scientific/Logical Consistency Check
        is_improbable, improbable_reason = self.check_scientific_improbability(raw_text)

        # Phase 6: Decision Engine (Weighted)
        weights = {
            "ml": 0.15,          # Reduced weight as it's easily fooled by formal tone
            "fact_check": 0.55,  # Increased weight for verified data
            "red_flags": 0.30,   # Increased weight for clickbait/sensationalism
            "credibility_bonus": 0.10 if is_credible_org else 0.0
        }
        
        red_flag_score = 1.0 - (len(red_flags) * 0.2)
        if is_improbable:
            red_flag_score = 0.1  # Significant penalty for scientific impossibility
        
        # Threshold Logic: If NO fact-check was found, and the ML score is high but red flags exist, 
        # it's likely a well-written fake article.
        if not fact_check_result["found"] and len(red_flags) > 0 and ml_score > 0.7:
            # Penalty for "Professional-looking fake"
            ml_score *= 0.5
        
        final_score = (ml_score * weights["ml"]) + \
                      (fact_check_score * weights["fact_check"]) + \
                      (red_flag_score * weights["red_flags"]) + \
                      (weights["credibility_bonus"] if is_credible_org else 0)
        
        # Adjust by source multiplier
        final_score *= source_multiplier
        final_score = min(1.0, max(0.0, final_score))
        
        # Binary Classification Mapping
        # High barrier for REAL if no fact-check or scientific doubt exists
        if is_improbable:
            classification = "FAKE"
        elif fact_check_result["found"] and fact_check_score > 0.8:
            classification = "REAL"
        elif final_score > 0.65 and not is_improbable:
            classification = "REAL"
        else:
            classification = "FAKE"

        # Confidence Mapping
        if final_score > 0.8 or final_score < 0.2 or is_improbable:
            confidence_level = "High"
        else:
            confidence_level = "Medium"

        # Build Reason
        reasoning = []
        if is_improbable:
            reasoning.append(f"Flagged for scientific improbability: {improbable_reason}")
        elif fact_check_result["found"]:
            reasoning.append(f"Verified against external fact-check databases.")
        elif not fact_check_result["found"] and classification == "FAKE":
            reasoning.append("Claim is unverified and contains sensationalist language typical of misinformation.")
        elif classification == "REAL":
            reasoning.append("Information is consistent with credible reporting styles and logical standards.")
            
        if source_multiplier < 1.0 and url:
            reasoning.append("Source domain has low or unknown credibility.")

        return {
            "status": "Success",
            "Classification": classification,
            "Reason": " ".join(reasoning),
            "Confidence": confidence_level,
            "Red Flags": red_flags if red_flags else ["None detected"],
            # Backward compatibility
            "prediction": classification.capitalize(),
            "confidence": f"{round(final_score * 100)}%",
            "reasoning": " ".join(reasoning),
            "metadata": {
                "ml_score": ml_score,
                "fact_check_score": fact_check_score,
                "is_improbable": is_improbable,
                "red_flags": red_flags
            }
        }

if __name__ == "__main__":
    model = FakeNewsModel()
    test_claim = "NASA finds water on Mars"
    print(f"Testing claim: {test_claim}")
    result = model.predict(test_claim, url="https://reuters.com")
    print(f"Classification: {result['Classification']}")
    print(f"Reason: {result['Reason']}")
    print(f"Red Flags: {result['Red Flags']}")
    print(f"Confidence: {result['Confidence']}")
