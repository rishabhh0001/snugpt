import os
import requests
from dotenv import load_dotenv

# Load env
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

api_key = os.getenv("NVIDIA_API_KEY")
print(f"API Key starting with: {api_key[:15] if api_key else 'None'}")

# Standard NVIDIA retrieval reranking endpoint
# Try both integrate and ai subdomains
urls = [
    "https://ai.api.nvidia.com/v1/retrieval/nvidia/reranking",
    "https://integrate.api.nvidia.com/v1/retrieval/nvidia/reranking"
]

payload = {
    "model": "nvidia/rerank-qa-mistral-4b",
    "query": {
        "text": "What is CSD101?"
    },
    "passages": [
        {"text": "CSD101 is Introduction to Computing and Programming, a core computer science course."},
        {"text": "Shiv Nadar University is located in Greater Noida, Uttar Pradesh, India."},
        {"text": "MAT203 is a mathematics course covering Advanced Calculus and Linear Algebra."}
    ]
}

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "Accept": "application/json"
}

for url in urls:
    print(f"\nTrying endpoint: {url}")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS! Response JSON:")
            print(response.json())
            break
        else:
            print("Error Response:")
            print(response.text)
    except Exception as e:
        print(f"Failed to call {url}: {e}")
