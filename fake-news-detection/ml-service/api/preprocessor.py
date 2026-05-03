import re
import spacy
from collections import Counter

class TextPreprocessor:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            # If model not found, we'll need to download it in the setup script
            self.nlp = None

    def clean_text(self, text):
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        # Remove special characters and numbers
        text = re.sub(r'\W', ' ', text)
        text = re.sub(r'\d', ' ', text)
        # Remove single characters
        text = re.sub(r'\s+[a-zA-Z]\s+', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def preprocess(self, text):
        if not self.nlp:
            return self.clean_text(text)
            
        doc = self.nlp(text.lower())
        # Tokenization, lemmatization, stopword removal
        tokens = [token.lemma_ for token in doc if not token.is_stop and not token.is_punct and token.is_alpha]
        return " ".join(tokens)

    def extract_keywords(self, text, top_n=10):
        if not self.nlp:
            # Fallback to simple split
            words = re.findall(r'\w+', text.lower())
            return [w for w, c in Counter(words).most_common(top_n)]
            
        doc = self.nlp(text)
        # Extract named entities and nouns
        keywords = []
        for ent in doc.ents:
            keywords.append(ent.text)
        
        for chunk in doc.noun_chunks:
            keywords.append(chunk.root.text)
            
        # Filter and count
        keywords = [k.lower() for k in keywords if len(k) > 2]
        return [k for k, c in Counter(keywords).most_common(top_n)]

if __name__ == "__main__":
    preprocessor = TextPreprocessor()
    sample_text = "Scientists at MIT have developed a new renewable energy technology that could revolutionize solar power efficiency by 40%. The United States government is interested."
    print("Cleaned:", preprocessor.clean_text(sample_text))
    print("Preprocessed:", preprocessor.preprocess(sample_text))
    print("Keywords:", preprocessor.extract_keywords(sample_text))
