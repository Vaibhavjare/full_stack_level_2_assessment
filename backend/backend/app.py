from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import List
from bson import ObjectId
from pymongo import MongoClient
from fastapi.middleware.cors import CORSMiddleware

# MongoDB connection
client = MongoClient("mongodb://localhost:27017")
db = client.student_db
collection = db.students

# FastAPI app
app = FastAPI()

# Allow frontend (React) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helper to convert MongoDB _id to string
def student_helper(student) -> dict:
    return {
        "id": str(student["_id"]),
        "name": student["name"],
        "email": student["email"],
        "course": student["course"],
        "department": student["department"],
        "fees": student["fees"],
    }

# Pydantic model
class Student(BaseModel):
    name: str
    email: EmailStr
    course: str
    department: str
    fees: str

# ------------------ API Routes ------------------

# Add a student
@app.post("/students", response_model=dict)
def add_student(student: Student):  
    print(student)
    
    # Name validation
    if not student.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    # Duplicate email check
    if collection.find_one({"email": student.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    student_id = collection.insert_one(student.dict()).inserted_id
    new_student = collection.find_one({"_id": student_id})
    return student_helper(new_student)

# Get all students
@app.get("/students", response_model=List[dict])
def get_students():
    students = [student_helper(student) for student in collection.find()]
    return students

# Delete a student
@app.delete("/students/{student_id}", response_model=dict)
def delete_student(student_id: str):
    result = collection.delete_one({"_id": ObjectId(student_id)})
    if result.deleted_count == 1:
        return {"message": "Student deleted successfully"}
    raise HTTPException(status_code=404, detail="Student not found")

# Update a student
@app.put("/students/{student_id}", response_model=dict)
def update_student(student_id: str, updated_student: Student):
    if not updated_student.name.strip():
        raise HTTPException(status_code=400, detail="Name cannot be empty")

    # Prevent duplicate email on update
    existing = collection.find_one({"email": updated_student.email, "_id": {"$ne": ObjectId(student_id)}})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    result = collection.update_one(
        {"_id": ObjectId(student_id)},
        {"$set": updated_student.dict()}
    )
    if result.modified_count == 1:
        student = collection.find_one({"_id": ObjectId(student_id)})
        return student_helper(student)
    raise HTTPException(status_code=404, detail="Student not found or no changes made")
