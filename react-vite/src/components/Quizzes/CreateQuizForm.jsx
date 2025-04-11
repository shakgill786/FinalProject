import { useState } from "react";

export default function CreateQuizForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    const res = await fetch("/api/quizzes/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, grade_level: gradeLevel }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setGradeLevel("");
      setSuccess(true);
    } else {
      const data = await res.json();
      setErrors(data.errors || ["Something went wrong"]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create a New Quiz</h2>
      {errors.length > 0 && <ul>{errors.map(e => <li key={e}>{e}</li>)}</ul>}
      {success && <p>✅ Quiz created successfully!</p>}
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Grade Level (e.g. Grade 1)"
        value={gradeLevel}
        onChange={(e) => setGradeLevel(e.target.value)}
      />
      <button type="submit">Create Quiz</button>
    </form>
  );
}
