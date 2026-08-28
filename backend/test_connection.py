import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

# Load environment variables from .env file
load_dotenv()

# Get credentials from environment variables
URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

def test_connection():
    try:
        print(f"Attempting to connect to: {URI}")
        driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
        
        # Verify connectivity
        driver.verify_connectivity()
        print("Successfully connected to CognoDB!")
        
        # Run a quick test query
        records, summary, keys = driver.execute_query(
            "RETURN 'Hello, World!' AS message",
            database_="neo4j",
        )
        for record in records:
            print(f"Database says: {record['message']}")
            
        driver.close()
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_connection()
