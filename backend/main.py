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
    allow_origins=["*"], # Allow all origins for production deployment
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
def search_nodes(q: str = ""):
    """
    Search for Person, Company, or Skill by matching any word in the query.
    If query is empty, returns a default set of nodes.
    """
    words = [word.lower() for word in q.split() if word.strip()]
    
    if not words:
        query = """
        MATCH (n)
        WHERE n:Person OR n:Company OR n:Skill
        RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
        LIMIT 20
        """
        try:
            results = db.execute_query(query)
            return {"results": results}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    query = """
    MATCH (n)
    WHERE (n:Person OR n:Company OR n:Skill) 
      AND any(w IN $words WHERE toLower(n.name) CONTAINS w)
    RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
    LIMIT 20
    """
    try:
        results = db.execute_query(query, {"words": words})
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
    RETURN 
        [n in nodes(p) | {id: elementId(n), type: labels(n)[0], properties: properties(n)}] AS nodes,
        [r in relationships(p) | {id: elementId(r), type: type(r), source: elementId(startNode(r)), target: elementId(endNode(r)), properties: properties(r)}] AS edges
    """
    try:
        results = db.execute_query(query, {"start_id": start_id, "end_id": end_id})
        if not results:
            return {"path": None, "message": "No path found between these nodes."}
            
        return {"path": {"nodes": results[0]["nodes"], "edges": results[0]["edges"]}}
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

class NodeCreate(BaseModel):
    type: str
    name: str
    role: Optional[str] = None
    industry: Optional[str] = None

@app.post("/api/nodes")
def create_node(node: NodeCreate):
    """
    Create a new isolated node in the graph.
    """
    if node.type not in ["Person", "Skill", "Company"]:
        raise HTTPException(status_code=400, detail="Invalid node type. Must be Person, Skill, or Company.")
    
    if node.type == "Person":
        query = """
        CREATE (n:Person {name: $name})
        SET n.role = CASE WHEN $role IS NOT NULL THEN $role ELSE n.role END,
            n.industry = CASE WHEN $industry IS NOT NULL THEN $industry ELSE n.industry END
        RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
        """
    elif node.type == "Company":
        query = """
        CREATE (n:Company {name: $name})
        SET n.role = CASE WHEN $role IS NOT NULL THEN $role ELSE n.role END,
            n.industry = CASE WHEN $industry IS NOT NULL THEN $industry ELSE n.industry END
        RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
        """
    elif node.type == "Skill":
        query = """
        CREATE (n:Skill {name: $name})
        SET n.role = CASE WHEN $role IS NOT NULL THEN $role ELSE n.role END,
            n.industry = CASE WHEN $industry IS NOT NULL THEN $industry ELSE n.industry END
        RETURN elementId(n) AS id, labels(n)[0] AS type, n.name AS name, n.role AS role, n.industry AS industry
        """
    else:
        raise HTTPException(status_code=400, detail="Invalid node type")
    try:
        results = db.execute_query(query, {
            "name": node.name,
            "role": node.role,
            "industry": node.industry
        })
        if not results:
            raise HTTPException(status_code=500, detail="Failed to create node")
        return {"node": results[0], "message": "Node created successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
