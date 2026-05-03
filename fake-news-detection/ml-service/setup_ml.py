import spacy
import nltk
import os

def setup():
    print("Setting up ML service dependencies...")
    
    # Download spaCy model
    try:
        spacy.load("en_core_web_sm")
        print("spaCy model already installed.")
    except:
        print("Downloading spaCy model...")
        import sys
        import subprocess
        subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
        
    # Download nltk data
    print("Downloading NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    
    print("Setup complete.")

if __name__ == "__main__":
    setup()
