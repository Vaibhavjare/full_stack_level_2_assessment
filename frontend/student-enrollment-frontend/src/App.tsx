import React, { useEffect, useState } from "react";
import { Student } from "./types";
import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container,
  Box,
  Snackbar,
  Alert,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import axios from "axios";

const API_URL = "http://127.0.0.1:5000/students";

// Custom Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#ff9800", // Orange
    },
    success: {
      main: "#4caf50", // Green
    },
    error: {
      main: "#f44336", // Red
    },
  },
});

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [department, setDepartment] = useState("");
  const [fees, setFees] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const fetchStudents = async () => {
    try {
      const res = await axios.get<Student[]>(API_URL);
      setStudents(res.data);
    } catch {
      showMessage("Failed to fetch students", "error");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Snackbar helper
  const showMessage = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // Add student
  const handleAddStudent = async () => {
    try {
      const newStudent = { name, email, course, department, fees };
      await axios.post(API_URL, newStudent);
      resetForm();
      fetchStudents();
      showMessage("Student added successfully!", "success");
    } catch {
      showMessage("Failed to add student", "error");
    }
  };

  // Delete student
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchStudents();
      showMessage("Student deleted successfully!", "success");
    } catch {
      showMessage("Failed to delete student", "error");
    }
  };

  // Update student
  const handleUpdate = async () => {
    if (!selectedId) return;
    try {
      const updatedStudent = { name, email, course, department, fees };
      await axios.put(`${API_URL}/${selectedId}`, updatedStudent);
      resetForm();
      fetchStudents();
      showMessage("Student updated successfully!", "success");
    } catch {
      showMessage("Failed to update student", "error");
    }
  };

  // Select student for editing
  const handleEdit = (student: Student) => {
    setSelectedId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setDepartment(student.department);
    setFees(student.fees);
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setEmail("");
    setCourse("");
    setDepartment("");
    setFees("");
    setSelectedId(null);
  };
  
  <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
  <h1 style={{ color: theme.palette.primary.main, textAlign: "center" }}>
    Student Enrollment System
  </h1>
</Box>

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <h1 style={{ color: theme.palette.primary.main }}>Student Enrollment System</h1>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Hide Student Data" : "Show Student Data"}
          </Button>
        </Box>

        {/* Form Section - Centered */}
        <Box display="flex" justifyContent="center" mb={4}>
          <Box display="flex" flexDirection="column" width={400} gap={2} p={3} boxShadow={3} borderRadius={2}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField label="Course" value={course} onChange={(e) => setCourse(e.target.value)} />
            <TextField
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <TextField label="Fees" value={fees} onChange={(e) => setFees(e.target.value)} />

            <Box display="flex" gap={2}>
              <Button variant="contained" color="primary" onClick={handleAddStudent}>
                Add
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleUpdate}
                disabled={!selectedId}
              >
                Update
              </Button>
              <Button variant="outlined" onClick={resetForm}>
                Clear
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Student Table Section */}
        {showTable && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Name</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Course</b></TableCell>
                <TableCell><b>Department</b></TableCell>
                <TableCell><b>Fees</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.course}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.fees}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEdit(student)}
                      style={{ marginRight: "10px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Snackbar for messages */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default App;
