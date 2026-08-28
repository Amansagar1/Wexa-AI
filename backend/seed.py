import random
from faker import Faker
from database import db

fake = Faker('en_IN')

def wipe_database():
    print("Wiping existing database...")
    db.execute_query("MATCH (n) DETACH DELETE n")

def create_schema():
    print("Creating indexes...")
    # These create index commands help make searching by name fast
    indexes = [
        "CREATE INDEX IF NOT EXISTS FOR (p:Person) ON (p.name)",
        "CREATE INDEX IF NOT EXISTS FOR (c:Company) ON (c.name)",
        "CREATE INDEX IF NOT EXISTS FOR (s:Skill) ON (s.name)",
    ]
    for q in indexes:
        try:
            db.execute_query(q)
        except Exception as e:
            # If it already exists, just continue
            pass

def seed_data(num_people=50, num_companies=10, num_skills=20):
    print("Seeding new data...")
    
    # 1. Create Skills
    skills = [
        "Python", "JavaScript", "React", "Node.js", "GraphQL", 
        "Neo4j", "PostgreSQL", "AWS", "Docker", "Kubernetes",
        "Machine Learning", "Data Science", "FastAPI", "TypeScript",
        "Go", "Rust", "UI/UX", "Project Management", "Agile", "DevOps"
    ]
    # Ensure we use the exact number requested (or limit to available)
    skills = random.sample(skills, min(num_skills, len(skills)))
    
    for skill in skills:
        db.execute_query("CREATE (s:Skill {name: $name})", {"name": skill})
        
    # 2. Create Companies
    companies = []
    industries = ["Fintech", "Healthtech", "E-commerce", "AI/ML", "SaaS", "Cybersecurity"]
    for _ in range(num_companies):
        c_name = fake.company()
        c_ind = random.choice(industries)
        companies.append(c_name)
        db.execute_query(
            "CREATE (c:Company {name: $name, industry: $industry})", 
            {"name": c_name, "industry": c_ind}
        )
        
    # 3. Create People
    roles = ["Software Engineer", "Data Scientist", "Product Manager", "Designer", "DevOps Engineer", "CTO"]
    
    # Manually add Demo first!
    people = ["Demo"]
    db.execute_query(
        "CREATE (p:Person {name: $name, role: $role})",
        {"name": "Demo", "role": "Lead Software Engineer"}
    )
    
    for _ in range(num_people - 1):
        p_name = fake.name()
        p_role = random.choice(roles)
        people.append(p_name)
        db.execute_query(
            "CREATE (p:Person {name: $name, role: $role})",
            {"name": p_name, "role": p_role}
        )
        
    # 4. Create Relationships (WORKED_AT)
    print("Drawing WORKED_AT relationships...")
    for person in people:
        # Each person worked at 1 to 3 companies
        worked_at = random.sample(companies, random.randint(1, 3))
        for company in worked_at:
            start_year = random.randint(2010, 2022)
            end_year = start_year + random.randint(1, 5)
            # 20% chance they still work there
            if random.random() < 0.2:
                end_year = "Present"
                
            db.execute_query("""
                MATCH (p:Person {name: $person_name})
                MATCH (c:Company {name: $company_name})
                CREATE (p)-[:WORKED_AT {start_year: $start_year, end_year: $end_year}]->(c)
            """, {
                "person_name": person,
                "company_name": company,
                "start_year": start_year,
                "end_year": end_year
            })
            
    # 5. Create Relationships (KNOWS_SKILL)
    print("Drawing KNOWS_SKILL relationships...")
    for person in people:
        # Each person knows 2 to 5 skills
        known_skills = random.sample(skills, random.randint(2, 5))
        for skill in known_skills:
            db.execute_query("""
                MATCH (p:Person {name: $person_name})
                MATCH (s:Skill {name: $skill_name})
                CREATE (p)-[:KNOWS_SKILL]->(s)
            """, {
                "person_name": person,
                "skill_name": skill
            })
            
    # 6. Create Relationships (KNOWS_PERSON)
    print("Drawing KNOWS_PERSON relationships...")
    for person in people:
        # Each person knows 1 to 5 other people
        connections = random.sample([p for p in people if p != person], random.randint(1, 5))
        for connection in connections:
            db.execute_query("""
                MATCH (p1:Person {name: $p1_name})
                MATCH (p2:Person {name: $p2_name})
                MERGE (p1)-[:KNOWS_PERSON]->(p2)
                MERGE (p2)-[:KNOWS_PERSON]->(p1) // Make it undirected/bidirectional
            """, {
                "p1_name": person,
                "p2_name": connection
            })
            
    print("Seeding complete! 🚀")

if __name__ == "__main__":
    db.connect()
    wipe_database()
    create_schema()
    seed_data(num_people=50, num_companies=10, num_skills=20)
    db.close()
