import requests
from bs4 import BeautifulSoup
import re

class URLContentExtractor:
    @staticmethod
    def extract(url):
        try:
            # Set headers to mimic a browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()
            
            # Extract title
            title = ""
            if soup.title:
                title = soup.title.string
            elif soup.find('h1'):
                title = soup.find('h1').get_text()
            
            # Extract article text
            # Often news articles are in <article> tags or within specific class names
            # A common heuristic is to look for paragraphs
            paragraphs = soup.find_all('p')
            text = ' '.join([p.get_text() for p in paragraphs])
            
            # Clean text
            text = re.sub(r'\s+', ' ', text).strip()
            
            return {
                "success": True,
                "title": title,
                "text": text
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

if __name__ == "__main__":
    # Test
    test_url = "https://www.bbc.com/news/world-us-canada-67990117"
    extractor = URLContentExtractor()
    result = extractor.extract(test_url)
    print(result)
