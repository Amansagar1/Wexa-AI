import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

# ---------------Load environment variables (handling both local and deployed scenarios) -------------
# ---------------In development, it loads from .env in the backend folder -------------
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

URI = os.getenv("NEO4J_URI")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

class Database:
    def __init__(self):
        self.driver = None

    def connect(self):
        try:
            print(f"Connecting to Neo4j at {URI}...")
            self.driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
            self.driver.verify_connectivity()
            print("Successfully connected to CognoDB.")
        except Exception as e:
            print(f"Failed to create the driver: {e}")
            raise e

    def close(self):
        if self.driver:
            self.driver.close()

    def execute_query(self, query, parameters=None):
        if not self.driver:
            self.connect()
        try:
            with self.driver.session(database="neo4j") as session:
                result = session.run(query, parameters or {})
                return [record.data() for record in result]
        except Exception as e:
            print(f"Query execution failed: {e}")
            raise e

# ---------------Singleton instance -------------
db = Database()
