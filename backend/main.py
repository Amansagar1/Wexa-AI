from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from database import db

app = FastAPI(title="Six Degrees of Tech API")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # Allow explicit frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Connect to the database on startup
    db.connect()

@app.on_event("shutdown")
def shutdown_event():
    db.close()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Six Degrees of Tech API!",
        "status": "Running successfully 🚀",
        "docs": "Go to /docs to see the interactive API documentation."
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected" if db.driver else "disconnected"}

@app.get("/api/search")
def search_nodes(q: str):
    """
    Search for Person, Company, or Skill by name.
    """
    query = """
    MATCH (n)
    WHERE (n:Person OR n:Company OR n:Skill) 
      AND toLower(n.name) CONTAINS toLower($q)
    RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
    LIMIT 20
    """
    try:
        results = db.execute_query(query, {"q": q})
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/path")
def find_shortest_path(start_id: str, end_id: str):
    """
    Finds the shortest path between two nodes (Multi-hop traversal).
    """
    query = """
    MATCH (start) WHERE elementId(start) = $start_id
    MATCH (end) WHERE elementId(end) = $end_id
    MATCH p = shortestPath((start)-[*]-(end))
    RETURN nodes(p) AS nodes, relationships(p) AS edges
    """
    try:
        results = db.execute_query(query, {"start_id": start_id, "end_id": end_id})
        if not results:
            return {"path": None, "message": "No path found between these nodes."}
            
        # Parse path into nodes and edges for the frontend
        path_data = results[0]
        nodes = []
        for n in path_data['nodes']:
            nodes.append({
                "id": n.element_id,
                "type": list(n.labels)[0] if n.labels else "Unknown",
                "properties": dict(n)
            })
            
        edges = []
        for r in path_data['edges']:
            edges.append({
                "id": r.element_id,
                "type": r.type,
                "source": r.start_node.element_id,
                "target": r.end_node.element_id,
                "properties": dict(r)
            })
            
        return {"path": {"nodes": nodes, "edges": edges}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/recommend/{person_id}")
def get_recommendations(person_id: str, skill: str):
    """
    Relational-awkward query: Find people who know a specific skill that are connected 
    to me through at most 2 degrees of separation, ordered by number of mutual connections.
    """
    query = """
    MATCH (me:Person) WHERE elementId(me) = $person_id
    MATCH (me)-[:KNOWS_PERSON*1..2]-(target:Person)-[:KNOWS_SKILL]->(s:Skill)
    WHERE toLower(s.name) CONTAINS toLower($skill) AND me <> target
    
    // Find how many mutual connections we have
    OPTIONAL MATCH (me)-[:KNOWS_PERSON]-(mutual:Person)-[:KNOWS_PERSON]-(target)
    
    RETURN elementId(target) AS id, target.name AS name, target.role AS role, 
           count(mutual) AS mutual_connections
    ORDER BY mutual_connections DESC
    LIMIT 10
    """
    try:
        results = db.execute_query(query, {"person_id": person_id, "skill": skill})
        return {"recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
